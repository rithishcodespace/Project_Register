const express = require("express");
const { route } = require("./teacherRoute");
const createError = require("http-errors");
// const verifyAccessToken = require("../utils/verifyAccessToken");
const router = express.Router();
const generateWeeklyDeadlines = require("../utils/generateWeeklyDeadlines");
const db = require("../db");
const userAuth = require("../middlewares/userAuth")
const checkTimeline = require("../middlewares/timeLine");
const nodemailer = require("nodemailer");
require("dotenv").config();

// common to all route -> for jwt auth
router.get("/profile/view", userAuth, (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("User ID from auth middleware:", userId);
    if(!userId)next(createError.BadRequest("userId not found!"))
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [userId], (error, result) => {
      if (error) return next(error);

      if (result.length === 0) {
        return next(createError.NotFound("User profile not found"));
      }
      
      res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: result[0] // Send the user profile data directly
      });
    });
  } catch (error) {
    next(error);
  }
});

// adds the connection request in the db -> invite button
router.post("/student/join_request", userAuth, (req, res, next) => {
  try {
    let { from_reg_num, to_reg_num } = req.body;
    
    if (!to_reg_num.trim() || from_reg_num === to_reg_num) {
      return next(createError.BadRequest(`reg_number are not defined!`));
    }

    let query1 = "select name, emailId, reg_num, dept from users where reg_num = ?";
    db.query(query1,[to_reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.NotFound("User not Found!"));
      let {name,emailId,reg_num,dept} = result[0];
      if (!name.trim() || !emailId.trim() || !reg_num.trim() || !dept.trim())return next(createError.BadRequest("User details not found!"));
      // checks for already a connection request exists or not for me and him
      let sql = "SELECT * FROM team_requests WHERE (from_reg_num = ? AND to_reg_num = ?) or (to_reg_num = ? and from_reg_num = ?)";
      db.query(sql, [from_reg_num, to_reg_num,from_reg_num,to_reg_num], (error, result) => {
        if (error) return next(error);
  
        if (result.length > 0) {
          return res.send(`Connection request already exists with status: ${result[0].status}`);
        }
  
        // checks wheter he is in another team or team_leader  
        let checkConnection = "select * from team_requests where (to_reg_num = ? or from_reg_num = ?) and status = 'accept'";
        db.query(checkConnection,[to_reg_num,to_reg_num],(error,result) => {
          if(error)return next(error);
          if(result.length > 0)return next(createError.BadRequest("He is already a member of some other team!"));

          // checks sender is in another team or team_leader

          let checkConnectionSender = "select * from team_requests where (to_reg_num = ? or from_reg_num = ?) and status = 'accept'";
          db.query(checkConnectionSender,[from_reg_num,from_reg_num],(error,result) => {
            if(error)return next(error);
            if(result.length > 0)return next(createError.BadRequest("sender is already a member of some other team!"));

            let size = "select * from team_requests where from_reg_num = ? and status = 'accept'";
            db.query(size,[from_reg_num],(error,result) => {
              if(error)return next(error);
              if(result.length >= 3)return next(createError.BadRequest("You can't form a team more than 4 members1"));
               // validating project_type
              let query = "SELECT project_type,company_name,semester FROM users WHERE reg_num IN (?,?)";
              db.query(query,[from_reg_num,to_reg_num],(error,result) => {
                if(error)return next(error);
                if (result.length != 2) {
                  return res.status(400).send("One or both students not found.");
                }
                const type1 = result[0].project_type;
                const type2 = result[1].project_type;
                const company1 = result[0].company_name;
                const company2 = result[1].company_name;
                const sem1 = result[0].semester;
                const sem2 = result[1].semester;
                if(type1 === null || type2 === null)return next(createError.BadRequest("User haven't entered his project_type yet!")); // should be handled by mathan
                else if(type1.toLowerCase() !== type2.toLowerCase()) {
                return res.status(500).send("BOTH MEMBERS SHOULD BE EITHER INTERNAL OR EXTERNAL!!");
                }
                else if(type1 === 'external' && type2 === 'external'){
                  if(company1 != company2)return res.status(500).send("BOTH MEMBERS SHOULD BE OF SAME COMPANY!");
                }

                if(sem1 != sem2)return next(createError.BadRequest("You can't send requests to your seniors or juniors!"));
        
                // inserts the request in the request db (only if no existing request)
                let sql1 = "INSERT INTO team_requests (name, emailId, reg_num, dept, from_reg_num, to_reg_num, status) VALUES (?,?,?,?,?,?,?)";
                let values = [name, emailId, reg_num, dept, from_reg_num, to_reg_num,'interested'];
              
                db.query(sql1, values, (error, result) => {
                  if (error) return next(error);  // Use return here to prevent further code execution
                  
                  return res.send("Request added successfully!");
                });
            })
            })
          })
        })
  
      });
      })

  } catch (error) {
    next(error.message);
  }
});

// filters the request i received -> notification

router.get("/student/request_recived/:reg_num",(req,res,next) => {
    try{
      const{reg_num} = req.params;
      if(!reg_num)return next(createError.BadRequest('reg_num not found!'));
      // checks if he is already a team_member
      let sql1 = "select * from team_requests where (from_reg_num = ? or to_reg_num = ?) and status = 'accept'";
      db.query(sql1,[reg_num,reg_num],(error,result) => {
        if(error)return next(error);
        if(result.length > 0)return next('You are already a member of another team!')
        // fetching the requests
        let sql = "select * from team_requests where to_reg_num = ? and status = 'interested'";
        db.query(sql,[reg_num],(error,result) => {
          if(error)return next(error);
          res.send(result);
        })
      })
    }
    catch(error)
    {
      next(error.message);
    }
})

// fetch all the invitations the loggedIn user received

router.get("/student/team_request/:reg_num",userAuth,(req,res,next) => {
  try{
    const {reg_num} = req.params;
    if(!reg_num)return next(createError.BadRequest("reg_num not found!"));
    let sql1 = "SELECT * FROM team_requests WHERE (to_reg_num = ? OR from_reg_num = ?) AND status = 'accept'";
    db.query(sql1,[reg_num,reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length > 0){
        return res.send("YOU ALREADY A TEAM MEMBER SO YOU CANT SEE THE REQUESTS SENT TO YOU!");
      }
      let sql = "select * from team_requests where to_reg_num = ? and status = 'interested'"
      db.query(sql,[reg_num],(error,result) => {
        if(error)return next(error);
        return res.send(result);
    })
    })
  }
  catch(error)
  {
    next(error);
  }
})

// accept or reject request -> inside notification
router.patch("/student/team_request/:status/:to_reg_num/:from_reg_num",userAuth, (req, res, next) => {
  try {
    const { from_reg_num, to_reg_num, status } = req.params;
    let {reason} = req.body; // not validating since it might be null for accept

    reason = reason ? reason : null;

    if (!from_reg_num || !to_reg_num || !status)
      return next(createError.BadRequest("Missing required parameters."));

    const validStatuses = ['accept', 'reject'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return next(createError.BadRequest("Invalid status."));
    }

    const safeStatus = status.toLowerCase();

    if(safeStatus === 'reject' && reason === null)return next(createError.BadRequest('reason not found for rejecting the connection request!'));
    

    //  Update the request if it exists and is still 'interested'
    let updateSQL = `UPDATE team_requests SET status = ?,reason = ? WHERE to_reg_num = ? AND from_reg_num = ? AND status = 'interested'`;

    db.query(updateSQL, [safeStatus, reason, to_reg_num, from_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.affectedRows === 0)
        return next(createError.BadRequest("No matching pending request found or already processed."));

      // If accepted, check team size
      if (safeStatus === 'accept') {
        const countSQL = `SELECT COUNT(*) AS count FROM team_requests WHERE from_reg_num = ? AND status = 'accept'`;
        db.query(countSQL, [from_reg_num], (err1, result1) => {
          if (err1) return next(err1);
          const acceptedCount = result1[0].count;
          if (acceptedCount >= 3) {
            const cleanupSQL = `DELETE FROM team_requests WHERE from_reg_num = ? AND status <> 'accept'`;
            db.query(cleanupSQL, [from_reg_num], (err2) => {
              if (err2) return next(err2);
              return res.send(`Request accepted. Team is now full. Remaining pending requests were removed.`);
            });
          } else {
            return res.send(`Request accepted successfully. Current team size: ${acceptedCount}`);
          }
        });
      } else {
        return res.send(`Request ${status}ed successfully.`);
      }
    });
  } catch (error) {
    next(error);
  }
});

// it checks whether he sent invitations and if sent it is conformed
router.post("/student/fetch_team_status_and_invitations",userAuth, (req, res, next) => {
  try {
    const { from_reg_num } = req.body; // logged user's reg num

    if(!from_reg_num)next(createError.BadRequest("from_reg_num not found!"))

    // Step 1: Check if user is in any team (as leader or member)
    const checkTeamSQL = `SELECT team_id, team_conformed, from_reg_num AS teamLeader FROM team_requests WHERE (from_reg_num = ? OR reg_num = ?) AND status = 'accept' LIMIT 1`;

    db.query(checkTeamSQL, [from_reg_num, from_reg_num], (err1, result1) => {
      if (err1) return next(err1);

      if (result1.length > 0 && result1[0].team_id) {
        const teamId = result1[0].team_id;
        const isTeamConfirmed = result1[0].team_conformed;
        const teamLeaderRegNum = result1[0].teamLeader;

        // Step 2: Fetch all team members (confirmed or not conformed just accepted)
        const fetchTeamSQL = `SELECT * FROM team_requests WHERE team_id = ? AND status = 'accept'`;
        db.query(fetchTeamSQL, [teamId], (err2, teamMembers) => {
          if (err2) return next(err2);
          if(teamMembers.length === 0)return next(createError.NotFound("team members not found!"));

          const fetchLeaderSQL = "SELECT * FROM users WHERE reg_num = ?";
          db.query(fetchLeaderSQL, [teamLeaderRegNum], (err3, leaderDetails) => {
            if (err3) return next(err3);

            // If team is not confirmed, fetch pending invitations
            if (!isTeamConfirmed) {
              const fetchInvitesSQL = `SELECT * FROM team_requests WHERE from_reg_num = ? AND team_conformed = 0`;
              db.query(fetchInvitesSQL, [from_reg_num], (err4, invites) => {
                if (err4) return next(err4);

                const pendingInvitations = invites.filter(invite => invite.status !== 'accept');
                res.json({
                  teamConformationStatus: 0,
                  teamMembers,
                  pendingInvitations,
                  teamLeader: leaderDetails[0] || null
                });
              });
            } else {
              res.json({
                teamConformationStatus: 1,
                teamMembers,
                pendingInvitations: [],
                teamLeader: leaderDetails[0] || null
              });
            }
          });
        });
      } else {
        // User is not in any confirmed team, fetch invitations they've sent
        const fetchInvitesSQL = `SELECT * FROM team_requests WHERE from_reg_num = ? AND team_conformed = 0`;

        db.query(fetchInvitesSQL, [from_reg_num], (err3, invites) => {
          if (err3) return next(err3);

          const pendingInvitations = invites.filter(invite => invite.status !== 'accept');
          const teamMembers = invites.filter(invite => invite.status === 'accept');

          res.json({
            teamConformationStatus: 0,
            teamMembers,
            pendingInvitations,
            teamLeader: null
          });
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

// make the team status -> 1 and assings team id to the team

// if it should be solo team both reg_num should be sent same

router.patch("/student/team_request/conform_team", userAuth, (req, res, next) => {
  try{
     const { name, emailId, reg_num, dept, from_reg_num } = req.body;

     if (!name || !emailId || !reg_num || !dept || !from_reg_num) {
       return next(createError.BadRequest("Some required fields are missing!"));
     }
   
     const countSql = "SELECT distinct COUNT(*) AS count FROM team_requests WHERE team_conformed = true";
     db.query(countSql, (err, result) => {
       if (err) return next(err);
   
       const teamNumber = result[0].count + 1;
       const team_id = `TEAM-${String(teamNumber).padStart(4, "0")}`;
   
       // Step 2: Check if this user already has accepted requests
       const checkSql = `SELECT * FROM team_requests WHERE (from_reg_num = ? OR to_reg_num = ?) AND status = 'accept'`;
       db.query(checkSql, [from_reg_num, from_reg_num], (err, rows) => {
         if (err) return next(err);
   
         // Case: No team members, solo team
         if (rows.length === 0) {
            const team_id = `TEAM-${String(result[0].count + 1).padStart(4, "0")}`;

            // 1. Insert leader into teams table
            const insertLeaderIntoTeams = `INSERT INTO teams (team_id, reg_num, is_leader) VALUES (?, ?, 1)`;
            db.query(insertLeaderIntoTeams, [team_id, reg_num], (err) => {
              if (err) return next(err);

              // 2. Insert leader row into team_requests table
              const insertLeaderRequest = `
                INSERT INTO team_requests (team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num, status, team_conformed)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'accept', true)
              `;
              db.query(insertLeaderRequest, [team_id, name, emailId, reg_num, dept, from_reg_num, from_reg_num], (err) => {
                if (err) return next(err);

                // 3. Cleanup pending requests for solo member
                const deletePending = `
                  DELETE FROM team_requests 
                  WHERE (from_reg_num = ? OR to_reg_num = ?) 
                  AND team_conformed = false 
                  AND status <> 'accept' 
                  AND team_id IS NULL
                `;
                db.query(deletePending, [reg_num, reg_num], (err) => {
                  if (err) return next(err);

                  return res.send(`${reg_num} has been added as a solo team, and pending requests were cleaned.`);
                });
              });
            });

            return;
         }
   
         // Step 3: Set team_conformed = true for accepted members
         const updateConfirmSql = `UPDATE team_requests SET team_conformed = true WHERE from_reg_num = ? AND status = 'accept'`;
         db.query(updateConfirmSql, [from_reg_num], (err, result1) => {
           if (err) return next(err);
           if (result1.affectedRows === 0) return res.status(500).send("Could not confirm team.");

           // fetches the team members to be inserted into the teams table

           let getSql = "select * from team_requests where WHERE from_reg_num = ? AND status = 'accept'";
           db.query(getSql,[from_reg_num],(error4,teamMates) => {
            if(error4)return next(error4);
            if(teamMates.length === 0)return next('team mates not found!');
            for(let i=0;i<teamMates.length;i++)
            {
              // insert into teams table
              let insertSql = "insert into teams (team_id, reg_num, is_leader) values (?,?,?)";
              db.query(insertSql,[team_id,teamMates[i].reg_num,0,],(error,result) => {
                if(error)return next(error);
                if(result.affectedRows === 0)return next(createError.BadRequest('teamMate is not inserted into the table1'));
                
              })
            }

             // Step 4: Set team_id for those members
             const updateIdSql = `UPDATE team_requests SET team_id = ? WHERE from_reg_num = ? AND status = 'accept'`;
             db.query(updateIdSql, [team_id, from_reg_num], (err, result2) => {
               if (err) return next(err);
               if (result2.affectedRows === 0) return res.status(500).send("Could not assign team ID.");

               // insert leader into the team table
               let insertTeamLeader = "insert into teams (team_id,reg_num,is_leader) values (?,?,?)";
               db.query(insertTeamLeader,[team_id,reg_num,1],(error,result) => {
                if(error)return error;
                if(result.affectedRows === 0)return next(createError.BadRequest('some rows are not affected!'));

                // Step 5: Insert leader row
               const insertLeaderSql = `INSERT INTO team_requests (team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num, status, team_conformed) VALUES (?, ?, ?, ?, ?, ?, ?, 'accept', true)`;
               db.query(insertLeaderSql, [team_id, name, emailId, reg_num, dept, from_reg_num, from_reg_num], (err, result3) => {
                 if (err) return next(err);
                 if (result3.affectedRows === 0) return res.status(500).send("Could not insert team leader row.");
     
                 // Step 6: Get all members in the new team
                 const getMembersSql = `
                   SELECT to_reg_num FROM team_requests 
                   WHERE team_id = ?
                 `;
                 db.query(getMembersSql, [team_id], (err, members) => {
                   if (err) return next(err);
                   if (members.length === 0) return next(createError.NotFound("No team members found."));
     
                   // Step 7: Cleanup pending requests of each team member
                   let pending = members.length;
                   members.forEach(({ to_reg_num }) => {
                     const deleteSql = `
                       DELETE FROM team_requests 
                       WHERE (from_reg_num = ? OR to_reg_num = ?) 
                       AND team_conformed = false 
                       AND status <> 'accept' 
                       AND team_id IS NULL
                     `;
                     db.query(deleteSql, [to_reg_num, to_reg_num], (err, delResult) => {
                       if (err) return next("hai hello"+err);
     
                       pending--;
                       if (pending === 0) {
                         return res.send("Team confirmed and all pending requests cleaned.");
                       }
                     });
                   });
                 });
               });

               })
             })
  
           })
           
         });
       });
     });
  }
  catch(error)
  {
    next(error);
  }
});

// fetches team members
router.get("/student/getTeamDetails/:reg_num",userAuth, (req, res, next) => {
  const{reg_num} = req.params;
  if(!reg_num)return next(createError.BadRequest("reg_num not found!"));
  let sql = `SELECT * FROM team_requests WHERE (from_reg_num = ? OR to_reg_num = ?) AND team_conformed = true`;
  db.query(sql,[reg_num,reg_num,],(error,result) => {
    if(error)return next(error);
    res.send(result);
  })
});

// updates the progress

router.post("/student/update_progress/:week/:reg_num/:team_id",userAuth, (req, res, next) => {
  try {
    let { week, reg_num, team_id } = req.params;
    const { progress } = req.body;

      const validPhases = [
        "week1", "week2", "week3", "week4", "week5", "week6",
        "week7", "week8", "week9", "week10", "week11", "week12"
      ];

      week = week.toLowerCase();

      // Validation Check
      if (!validPhases.includes(week) || !reg_num || !team_id) {
        return res.status(400).json({ message: "Invalid week name or reg_num missing" });
      }

      // checks if already submmited
      let check = `SELECT ${week}_progress FROM teams WHERE reg_num = ? AND team_id = ?`;
      db.query(check, [reg_num, team_id], (error, results) => {
        if (error) return next(error);

        if (results[0] && results[0][`${week}_progress`] !== null) {
          return res.status(200).send("YOU HAVE ALREADY SUBMITTED YOUR PROGRESS FOR THIS WEEK!");
        }

      const sql = `UPDATE teams SET ${week}_progress = ? WHERE reg_num = ? and team_id = ?`;

      db.query(sql, [progress, reg_num,team_id], (err, result) => {
        if (err) return next(err);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "No record found for the provided reg_num." });
        }
        let sql1 = `select ${week}_progress from teams where team_id = ?`;
        db.query(sql1,[team_id],(error,result) => {
          if(error)return next(error);

          const allMembersUpdated = result.every((member) => member[`${week}_progress`] !== null); // every -> checks whether every element satisfies the given condition, optimised instead of forEach // . -> [] alternative for . notation
          if(allMembersUpdated)
          {
            let weekNumber = week.replace(/\D/g, ''); 
            let insertSql = "INSERT INTO weekly_logs_verification (team_id, week_number) VALUES (?, ?)";
            db.query(insertSql,[team_id,weekNumber],(error,inserted) => {
              if(error)return next(error);
              if(inserted.affectedRows === 0)return next(createError.BadRequest('An error occured while inserting!'));

              let getGuide = "select guide_reg_num from teams where team_id = ?";
              db.query(getGuide,[team_id],(error,result) => {
              if(error)return next(error);
              if(result.length === 0)return next(createError.NotFound("guide reg num not found!"));
              let guide_reg_num = result[0].guide_reg_num;
              let getGuideEmailStudentEmail = "SELECT emailId, role FROM users WHERE reg_num IN (?, ?) AND role IN ('staff', 'student');";
                db.query(getGuideEmailStudentEmail,[guide_reg_num,reg_num],(error,result) => {
                  if(error)return next(error);
                  if(result.length === 0)return next(createError.NotFound("guide email not found!"));
                  let guideEmail = null;
                  let studentEmail = null;

                  result.forEach(user => {
                    if (user.role === 'staff') guideEmail = user.emailId;
                    else if (user.role === 'student') studentEmail = user.emailId;
                  });

                  if (!guideEmail || !studentEmail) {
                    return next(createError.InternalServerError("Could not resolve guide or student email."));
                  }

                  const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: process.env.EMAIL_USER, 
                      pass: process.env.EMAIL_PASS,
                    },
                  });

                    const mailOptions = {
                      from: `"No Reply" <${process.env.EMAIL_USER}>`,
                      to: guideEmail,
                      subject: `Progress update for ${week} by Team ${team_id}`,
                      replyTo: studentEmail,  // Optional: replies go to student
                      text: `Dear Guide,

                      Team ${team_id} has completed their progress update for ${week}.
                      This submission was triggered by the student with registration number: ${reg_num}.

                      Please check the Project Register for more details.

                      Best regards,
                      Project Management System`
                  };
                    transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error("Email Error:", error);
                      return res.status(500).send("Progress updated, but failed to send email.");
                    } else {
                      console.log("Email sent:", info.response);
                      return res.send("Progress updated and email sent successfully!");
                    }
                  }); 
                
                })
              })

            })

          }
          else {
            return res.send("Progress updated successfully for this member!");
          }
        })
      });

      });
    } catch (error) {
      next(error);
    }
  });


// brings the details of the project through project_id 
// router.get("/student/get_project_details/:project_id",userAuth,(req,res,next) => {
//   try{
//      const {project_id} = req.params;
//      if(!project_id)next(createError.BadRequest("project_Id not found!"))
//      let sql = "select * from projects where project_id = ?";
//      db.query(sql,[project_id],(error,result) => {
//       if(error)next(error);
//       res.send(result);
//      })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

// updates the project type

router.patch("/student/alter_project_type/:reg_num/:type",userAuth,(req,res,next) => {
  try{
    const{type,reg_num} = req.params;
    let{company_name,company_address,company_contact} = req.body;
    const safeType = type.toLowerCase();
    const validTypes = ["internal","external"];
    if(!validTypes.includes(safeType))
    {
      return next(createError.BadRequest("invalid type!"))
    }
    if(safeType == 'internal')
    {
      company_name = null,
      company_address = null,
      company_contact = null
    }
    else{
      if(!company_name.trim() || !company_address.trim() || !company_contact.trim()) return next(createError.BadRequest("External project requires complete company details."));
    }
    let sql = "update users set project_type = ?,company_name = ?,company_address = ?,company_contact = ? where reg_num = ?";
    db.query(sql,[safeType,company_name,company_address,company_contact,reg_num],(error,result) => {
      if(error) return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("changes not got updated!"));
      res.send(`Project Type updated successfully to ${type}`);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// checks whether the user have given project_type -> INTERNAL OR EXTERNAL
router.get("/student/get_project_type/:reg_num",(req,res,next) => {
  try{
    const{reg_num} = req.params;
    if(!reg_num)
    {
      next(createError.BadRequest("reg_num not found!"));
    }
    let sql = "select project_type from users where reg_num = ?";
    db.query(sql,[reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return res.send("user haven't set their register number!");
      res.send(result[0].project_type);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// send request to mentor for optional review -> if missed any one of the review

router.post('/send_request_for_optional_review/:mentor_reg_num',(req,res,next) => {
  try{
    const{mentor_reg_num} = req.params;
    if(!mentor_reg_num)return next(createError.BadRequest('mentor register number not found!'));
  
  }
  catch(error)
  {
    next(error);
  }
})

// checks whether the student have already added the progress for the particular week

// router.get("/student/gets_progress_of_mine/:week/:reg_num",(req,res,next) => {
//   try{
//     const{week,reg_num} = req.params;
//     if(!week || !reg_num)return next(createError.BadRequest("week or reg_num not found!"));
//     const column = `week${week}_progress`;
//     const sql = `SELECT ?? FROM team_requests WHERE reg_num = ? AND team_conformed = 1`;
//     db.query(sql,[column,reg_num],(error,result) => {
//       if(error)return next(error);
//       if(result.length === 0)return next(createError.NotFound("progress not found!"));
//       res.send(result);
//     })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

// adds the query in the query table

// router.post("/student_query/:team_member/:guide_reg_num",userAuth, (req, res, next) => {
//   try {
//     const { team_id, project_id, query } = req.body;
//     const { team_member, guide_reg_num } = req.params;

//     if (!project_id || !team_id || !team_member || !query || !guide_reg_num) {
//       return next(createError.BadRequest("Required parameters are missing!"));
//     }

//     // Step 1: Fetch project name using project_id
//     const getProjectNameSql = "SELECT project_name FROM projects WHERE project_id = ?";
//     db.query(getProjectNameSql, [project_id], (err, rows) => {
//       if (err) return next(err);

//       if (rows.length === 0) {
//         return next(createError.NotFound("Project not found!"));
//       }

//       const project_name = rows[0].project_name;

//       // Step 2: Insert the query into the queries table
//       const insertQuerySql = `
//         INSERT INTO queries (team_id, project_id, project_name, team_member, query, guide_reg_num)
//         VALUES (?, ?, ?, ?, ?, ?)
//       `;
//       db.query(insertQuerySql, [team_id, project_id, project_name, team_member, query, guide_reg_num], (err, result) => {
//         if (err) return next(err);

//         // Step 3: Delete older answered queries, keeping only the latest 5
//         const deleteOldSql = `
//           DELETE FROM queries 
//           WHERE query_id IN (
//             SELECT query_id FROM (
//               SELECT query_id 
//               FROM queries 
//               WHERE team_id = ? AND reply IS NOT NULL
//               ORDER BY created_at DESC
//               LIMIT 18446744073709551615 OFFSET 5
//             ) AS temp
//           )
//         `;

//         db.query(deleteOldSql, [team_id], (err2) => {
//           if (err2) return next(err2);

//           // Step 4: Send a success response
//           res.send("Query added successfully!");
//         });
//       });
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// gets student details by reg_num

router.get("/student/get_student_details_by_regnum/:reg_num",userAuth,(req,res,next) => {
  try{
    const{reg_num} = req.params;
    if(!reg_num)return next(createError.BadRequest("reg_num not found!!"));
    let sql = "select * from users where reg_num = ?";
    db.query(sql,[reg_num],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// gets team details using the team_id

// router.get("/student/getTeamdetails_using_team_id/:team_id",userAuth,(req,res,next) => {
//   try{
//     const{team_id} = req.body;
//     if(!team_id) return next(createError.BadRequest("team_id is not defined!!"));
//     let sql = "select * from team_request where team_id = ?";
//     db.query(sql,[team_id],(error,result) => {
//       if(error)return next(error);
//       res.send(result);
//     })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

//fetch queries sent by my team

// router.get("/student/get_queries_sent_by_my_team/:team_id",userAuth,(req,res,next) => {
//   try{
//     const{team_id} = req.params;
//     if(!team_id)return next(createError.BadRequest("team_id not found!!"));
//     let sql = "select * from queries where team_id = ?";
//     db.query(sql,[team_id],(error,result) => {
//       if(error)return next(error);
//       res.send(result);
//     })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

// checks whether he is already a member of another team

router.get("/student/check_accepted_status/:reg_num",userAuth,(req,res,next) => {
  try{
    const{reg_num} = req.params;
    let sql = "SELECT * FROM team_requests WHERE (to_reg_num = ? OR from_reg_num = ?) AND status = 'accepted'";
    db.query(sql,[reg_num,reg_num],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})


// inserts the project into project table
// project_type should come frontend -> redux -> userSlice
// only team_member can post the project
// -> send the project_type from redux not input tag

router.post("/student/addproject/:project_type/:team_id/:reg_num", userAuth,(req, res, next) => {
  try {
    let { project_type,reg_num,team_id } = req.params;
    let { project_name, cluster, description, outcome, hard_soft } = req.body;

    project_type = project_type.toLowerCase();
    hard_soft = hard_soft.toLowerCase();

    const validTypes = ['internal','external','hardware','software'];

    if (!project_type.trim() || !project_name.trim() || !cluster.trim() || !description.trim() || !reg_num.trim() || !team_id) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    if(!validTypes.includes(project_type) || !validTypes.includes(hard_soft))return next(createError.BadRequest("invalid project_type"))

    // checks whether he is a team_leader -> to post project

    let query = "select is_leader from teams where team_id = ? and reg_num = ?";
    db.query(query,[team_id,reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.BadRequest("You are not a TEAM LEADER!"));
      if(result.length > 1)return next(createError.BadRequest("You have more than one team!"));

      // checks whether he already posted projects

      let query1 = "select * from projects where tl_reg_num = ?";
      db.query(query1,[reg_num],(error,result) => {
        if(error)return next(error);
        if(result.length > 0)return next(createError.BadRequest("The team already posted a project!"));

        // geneating project_id

        const sql = "SELECT COUNT(*) AS count FROM projects";
        db.query(sql, (error, result) => {
          if (error) return next(error);
  
          const project_length = result[0].count + 1;
          const project_id = `P${String(project_length).padStart(4, "0")}`;

          // inserting into projects
  
          const sql1 = ` INSERT INTO projects (project_id,project_name,project_type,cluster,description,outcome,hard_soft,tl_reg_num,team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [project_id,project_name,project_type,cluster,description,outcome,hard_soft,reg_num,team_id];
          db.query(sql1,values,(error,result) => {
            if(error)return next(error);
            if(result.affectedRows === 0)return next(createError.BadRequest("an error occured silently!"));

            // inserts the project_id to the team in teams table
            let insertSql = "UPDATE teams SET project_id = ? WHERE team_id = ?";
            db.query(insertSql,[project_id,team_id],(error,result) => {
              if(error)return next(error);
              if(result.affectedRows === 0)return next(createError.BadRequest("no rows inserted!"));
              res.send(`Project inserted successfully for the team :- ${team_id} -> project_id :- ${project_id}`);

            })
          })
      });
      })

    })
  } catch (error) {
    next(error.message);
  }
});

// sends the review request to the expert and guide => once in a month
// reason will be for optional review
router.post("/student/send_review_request/:team_id/:project_id/:reg_num", userAuth, (req, res, next) => {
  try {
    const { team_id, project_id, reg_num } = req.params;
    const { project_name, team_lead, review_date, start_time, isOptional, reason, mentor_reg_num } = req.body;

    if (!team_id || !project_id || !project_name || !team_lead || !review_date || !start_time || !reg_num) {
      return next(createError.BadRequest("Some parameters are missing!"));
    }

    const today = new Date();
    const reviewDate = new Date(review_date);
    today.setHours(0, 0, 0, 0);
    reviewDate.setHours(0, 0, 0, 0);

    if (reviewDate < today) {
      return next(createError.BadRequest("Invalid date! Review date cannot be in the past."));
    }

    const formattedDate = reviewDate.toISOString().split('T')[0];

    // checks if he is the team leader

    let sql0 = "select is_leader from teams where team_id = ? and reg_num = ?";
    db.query(sql0,[team_id,reg_num],(error0,result0) => {
      if(error0)return next(error0);
      if(result0.length === 0)return next(createError.NotFound('student leader status not found!'));
      if(!result0[0].is_leader)return res.send('YOU CANT REQUEST FOR CHALLENGE REVIEW, ONLY YOUR TEAM LEADER CAN APPLY FOR IT');

      // fetch expert and guide reg_num
      const sql = "SELECT guide_reg_num, sub_expert_reg_num FROM teams WHERE team_id = ?";
      db.query(sql, [team_id], (error, result) => {
        if (error) return next(error);
        if (!result || result.length === 0) {
          return next(createError.BadRequest("Guide or expert reg_num not found!"));
        }

        const expert_reg_num = result[0].sub_expert_reg_num;
        const guide_reg_num = result[0].guide_reg_num;

        // Check how many reviews already done
        const sql2 = "SELECT * FROM scheduled_reviews WHERE team_id = ?";
        db.query(sql2, [team_id], (error, result1) => {
          if (error) return next(error);
          if (result1.length >= 2) return next(createError.BadRequest("Your team already completed 2 reviews."));

          // Helper function for common flow after eligibility
          const continueWithRequest = (review_title) => {
            const weekToCheck = result1.length === 0 ? 3 : 6;
            const weekSql = "SELECT * FROM weekly_logs_verifications WHERE week_number = ? AND is_verified = true AND team_id = ?";
            db.query(weekSql, [weekToCheck, team_id], (error, verificationResult) => {
              if (error) return next(error);
              if (verificationResult.length === 0) {
                return next(createError.BadRequest(`You are not eligible to apply for the review request. Week ${weekToCheck} log not verified.`));
              }

              const checkSql = "SELECT * FROM review_requests WHERE review_date = ? AND start_time = ? AND expert_reg_num = ? AND guide_reg_num = ? AND team_id = ?";
              db.query(checkSql, [formattedDate, start_time, expert_reg_num, guide_reg_num, team_id], (error, existingResult) => {
                if (error) return next(error);
                if (existingResult.length > 0) {
                  return next(createError.BadRequest("Review request already exists for this slot!"));
                }

                if(review_title !== 'optional')
                {
                  const insertSql = `
                  INSERT INTO review_requests
                  (team_id, project_id, project_name, team_lead, review_date, start_time, expert_reg_num, guide_reg_num, review_title)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                  db.query(insertSql, [team_id, project_id, project_name, team_lead, formattedDate, start_time, expert_reg_num, guide_reg_num, 'optional_review'], (error, result) => {
                    if (error) return next(error);
                    if (result.affectedRows === 0) return res.status(500).json({ message: "Insertion failed!" });
                    return res.send(`${formattedDate} - ${start_time}: Review request submitted successfully.`);
                  });
                }
                else if(review_title === 'optional'){
                  // send request to mentor to accept the genuie reason
                  
                  // checks already sent this request to the mentor
                  let sql = "select * from option_review_requests where team_id = ? review_date = ? start_time = ? and mentor_reg_num = ?";
                  db.query(sql,[team_id,review_date,start_time,mentor_reg_num],(error,checkResult) => {
                    if(error)return next(error);
                    if(checkResult.length > 0)return next(createError.BadRequest('already sent request for this same optional review!'));

                    // insert into optional_review_request
                    let sql1 = "insert into optional_review_requests (team_id,project_id,team_lead,review_date,start_time,mentor_reg_num,reason,status) values(?,?,?,?,?,?,?,?)";
                    db.query(sql1,[team_id,project_id,team_lead,review_date,start_time,mentor_reg_num,reason,'pending'],(error,result) => {
                      if(error)return next(error);
                      if(result.affectedRows === 0)return next(createError.BadRequest('an error occured while inserting into optional review requests!'));
                      res.send('optional review request sent successfully to the mentor')
                    })
                  })
                }
              });
            });
          };

          // Optional path
          if (isOptional === "optional") {
            if (result1.length !== 1) {
              return next(createError.BadRequest("You're not eligible for an optional review."));
            }

            const sql3 = "SELECT week8 FROM weekly_logs_deadlines WHERE team_id = ?";
            db.query(sql3, [team_id], (error, week8Date) => {
              if (error) return next(error);
              if (!week8Date || week8Date.length === 0) return next(createError.NotFound("Week 8 deadline not found!"));

              const week8 = new Date(week8Date[0].week8);
              today.setHours(0, 0, 0, 0);
              week8.setHours(0, 0, 0, 0);

              if (today < week8) {
                return next(createError.BadRequest("YOU CAN'T APPLY FOR OPTIONAL REVIEW BEFORE WEEK8 DEADLINE!"));
              }

              continueWithRequest("optional");
            });

          } else {
            const review_title = result1.length === 0 ? "1st_review" : "2nd_review";
            continueWithRequest(review_title);
          }

        });
      });
      })

  } catch (error) {
    next(error);
  }
});

// fetches the scheduled reviews for my team                            

router.get("/student/schedule_review/:project_id", userAuth, (req, res, next) => {
  try {
    const project_id = req.params.project_id;

    if (!project_id) {
      return next(createError.BadRequest("Project ID is required"));
    }

    const query = `SELECT * FROM project_registor.scheduled_reviews WHERE project_id = ?`;

    db.query(query, [project_id], (error, result) => {
      if (error) return next(error);
      if (result.length === 0) {
        return res.status(404).json({ message: "No review found for the given project ID" });
      }
      return res.json(result);
    });
  } catch (err) {
    next(err);
  }
});

// fetches the upcoming meeting links for my team

router.get('/student/fetch_upcoming_meeting_links/:team_id',(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id) return next(createError.BadRequest('team is undefined!'));
    let sql = 'select meeting_link,review_no from meeting_links where team_id = ? and scheduled_at >= current_timestamp';
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.NotFound('meeting links not found!'));
      return res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// fetches guide-expert for a particular team
router.get('/student/get_guide_expert/:team_id/:role',(req,res,next) => {
  try{
    const{team_id,role} = req.params;
    if(!team_id || !role)return next(createError.BadRequest('team id or role is undefined!'));
    const safeRole = role.toLowerCase();
    const validRoles = ['guide','sub_expert'];
    if(!validRoles.includes(safeRole))return next(createError.BadRequest('invalid role!'));
    let sql = `select ${role}_reg_num from teams where team_id = ?`;
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.BadRequest('register number not found!!'));
      // gets the name from users table
      let sql1 = "select name from users where reg_num = ?";
      db.query(sql1,[reg_num],(error,result) => {
        if(error)return next(error);
        if(result.length === 0)return next(createError[404]);
        res.send(result);
      })
    })
    
  }
  catch(error)
  {
    next(error);
  }
})

// challenge review -> requested by the team_leader 
// review_id -> not satisfied review's id
router.post('/student/challenge_review/request/:team_id/:project_id/:reg_num/:review_id', (req, res, next) => {
  try {
    const { team_id, project_id, reg_num, review_id } = req.params;
    if (!team_id || !reg_num || !review_id) return next(createError.BadRequest('team_id or reg_num or review_id is not defined!'));

    // Step 1: Check if student is team leader
    let sql0 = "SELECT is_leader FROM teams WHERE team_id = ? AND reg_num = ?";
    db.query(sql0, [team_id, reg_num], (error0, result0) => {
      if (error0) return next(error0);
      if (result0.length === 0) return next(createError.NotFound('student leader status not found!'));
      if (!result0[0].is_leader) return res.send('YOU CANT REQUEST FOR CHALLENGE REVIEW, ONLY YOUR TEAM LEADER CAN APPLY FOR IT');

      // Step 2: Validate date (within 7 days)
      let sql1 = "SELECT * FROM scheduled_reviews WHERE review_id = ?";
      db.query(sql1, [review_id], (error1, result1) => {
        if (error1) return next(error1);
        if (result1.length === 0) return next(createError.NotFound('review_date not found'));

        const review_date = new Date(result1[0].review_date);
        const today = new Date();
        review_date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffInDays = (today - review_date) / (1000 * 60 * 60 * 24);

        if (diffInDays > 7) {
          return next(createError.BadRequest('Challenge review time limit exceeded!'));
        }

        // Step 3: Check if marks were updated
        let sql2 = 'SELECT * FROM review_marks_team WHERE team_id = ? AND review_title = ? AND review_date = ?';
        db.query(sql2, [team_id, result1[0].review_title, result1[0].review_date], (error2, result2) => {
          if (error2) return next(error2);
          if (result2.length === 0) return next(createError.BadRequest('Since guide or expert have not updated marks for your team, you cannot request for challenge review'));

          // Step 4: Insert into challenge_review_requests
          let sql3 = "INSERT INTO challenge_review_requests (team_id, project_id, team_lead, status) VALUES (?, ?, ?, ?)";
          db.query(sql3, [team_id, project_id, reg_num, 'pending'], (error3, result3) => {
            if (error3) return next(error3);
            if (result3.affectedRows === 0) return next(createError.BadRequest('error occurred while inserting for challenge review!'));
            res.send(`Optional review request sent to admin`);
          });
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// show already submitted progress -> to update => 1st
router.get('/student/view_submitted_progress/:team_id/:reg_num/:week',(req,res,next) => {
  try{
    const{reg_num,week,team_id} = req.params;
    if(!team_id || !reg_num || !week)return next(createError.BadRequest('some parameters are missing!'));
    let sql = `SELECT 
                t.team_id,
                t.reg_num,
                CASE
                  WHEN t.week12_progress IS NOT NULL AND (w12.is_verified IS NULL OR w12.is_verified = 0) THEN 'week12_progress'
                  WHEN t.week11_progress IS NOT NULL AND (w11.is_verified IS NULL OR w11.is_verified = 0) THEN 'week11_progress'
                  WHEN t.week10_progress IS NOT NULL AND (w10.is_verified IS NULL OR w10.is_verified = 0) THEN 'week10_progress'
                  WHEN t.week9_progress IS NOT NULL AND (w9.is_verified IS NULL OR w9.is_verified = 0) THEN 'week9_progress'
                  WHEN t.week8_progress IS NOT NULL AND (w8.is_verified IS NULL OR w8.is_verified = 0) THEN 'week8_progress'
                  WHEN t.week7_progress IS NOT NULL AND (w7.is_verified IS NULL OR w7.is_verified = 0) THEN 'week7_progress'
                  WHEN t.week6_progress IS NOT NULL AND (w6.is_verified IS NULL OR w6.is_verified = 0) THEN 'week6_progress'
                  WHEN t.week5_progress IS NOT NULL AND (w5.is_verified IS NULL OR w5.is_verified = 0) THEN 'week5_progress'
                  WHEN t.week4_progress IS NOT NULL AND (w4.is_verified IS NULL OR w4.is_verified = 0) THEN 'week4_progress'
                  WHEN t.week3_progress IS NOT NULL AND (w3.is_verified IS NULL OR w3.is_verified = 0) THEN 'week3_progress'
                  WHEN t.week2_progress IS NOT NULL AND (w2.is_verified IS NULL OR w2.is_verified = 0) THEN 'week2_progress'
                  WHEN t.week1_progress IS NOT NULL AND (w1.is_verified IS NULL OR w1.is_verified = 0) THEN 'week1_progress'
                  ELSE 'No unverified progress'
                END AS last_unverified_week
              FROM teams t
              LEFT JOIN weekly_logs_verification w1 ON t.team_id = w1.team_id AND w1.week_number = 1
              LEFT JOIN weekly_logs_verification w2 ON t.team_id = w2.team_id AND w2.week_number = 2
              LEFT JOIN weekly_logs_verification w3 ON t.team_id = w3.team_id AND w3.week_number = 3
              LEFT JOIN weekly_logs_verification w4 ON t.team_id = w4.team_id AND w4.week_number = 4
              LEFT JOIN weekly_logs_verification w5 ON t.team_id = w5.team_id AND w5.week_number = 5
              LEFT JOIN weekly_logs_verification w6 ON t.team_id = w6.team_id AND w6.week_number = 6
              LEFT JOIN weekly_logs_verification w7 ON t.team_id = w7.team_id AND w7.week_number = 7
              LEFT JOIN weekly_logs_verification w8 ON t.team_id = w8.team_id AND w8.week_number = 8
              LEFT JOIN weekly_logs_verification w9 ON t.team_id = w9.team_id AND w9.week_number = 9
              LEFT JOIN weekly_logs_verification w10 ON t.team_id = w10.team_id AND w10.week_number = 10
              LEFT JOIN weekly_logs_verification w11 ON t.team_id = w11.team_id AND w11.week_number = 11
              LEFT JOIN weekly_logs_verification w12 ON t.team_id = w12.team_id AND w12.week_number = 12
              WHERE t.reg_num = '?';`;
    db.query(sql,[reg_num],(error,result) => { // week name
      if(error)return next(error);
      if(result.length === 0)return next(result[0].last_unverified_week);
      const progressColumn = result[0].last_unverified_week;

      if (progressColumn === 'No unverified progress') {
        return res.send({ message: 'All weeks verified or no progress submitted.' });
      }

      let sql1 = `SELECT ${progressColumn} AS progress FROM teams WHERE team_id = ?`;
      db.query(sql,[team_id],(error1,result1) => { // week progress
        if(error1)return next(error1);
        if(result.length === 0)return next(createError.NotFound('weekly progress not found!'));
        res.status(200).json({"message":"progress fetches successfully","progress":result1[0].progress,"week_name":progressColumn});
      })

    })          
  }
  catch(error)
  {
    next(error);
  }
})

// edit already updated progress => 2nd
// week will be from 1st api's response

router.patch('/student/edit_submitted_progress/:team_id/:week/:reg_num',(req,res,next) => {
  try{
    const{team_id,week,reg_num} = req.params;
    const{newProgress} = req.body;
    if(!team_id || !week || !reg_num || !newProgress)
    {
      return next(createError.BadRequest('parameters not found!'));
    }
    const allowedWeeks = ["week1_progress", "week2_progress", "week3_progress", "week4_progress", "week5_progress", "week6_progress", "week7_progress", "week8_progress", "week9_progress", "week10_progress", "week11_progress", "week12_progress"];

    if (!allowedWeeks.includes(week)) {
      return next(createError.BadRequest("Invalid week field!"));
    }

    let sql = `update teams set ${week} = ? where reg_num = ? and team_id = ?`;
    db.query(sql,[newProgress,reg_num,team_id],(error,result) => {
      if(error)return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest('failed to update!'));
      res.send('progress updated successfully!');
    })
  }
  catch(error)
  {
    next(error);
  }
})


module.exports = router;
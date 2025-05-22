const express = require("express");
const { route } = require("./teacherRoute");
const createError = require("http-errors");
// const verifyAccessToken = require("../utils/verifyAccessToken");
const router = express.Router();
const generateWeeklyDeadlines = require("../utils/generateWeeklyDeadlines");
const db = require("../db");
const userAuth = require("../middlewares/userAuth")
const checkTimeline = require("../middlewares/timeLine");
const nodemailer = require("nodemailer")

// common to all route -> for jwt auth
router.get("/profile/view", userAuth, (req, res, next) => {
  try {
    const userId = req.user;
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
router.post("/student/join_request", (req, res, next) => {
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
          db.query(checkConnection,[from_reg_num,from_reg_num],(error,result) => {
            if(error)return next(error);
            if(result.length > 0)return next(createError.BadRequest("sender is already a member of some other team!"));

            let size = "select * from team_requests where from_reg_num = ? and status = 'accept'";
            db.query(size,[from_reg_num],(error,result) => {
              if(error)return next(error);
              if(result.length >= 3)return next(createError.BadRequest("You can't form a team more than 4 members1"));
               // validating project_type
          let query = "SELECT project_type,company FROM users WHERE reg_num IN (?,?)";
          db.query(query,[from_reg_num,to_reg_num],(error,result) => {
            if(error)return next(error);
            if (result.length != 2) {
              return res.status(400).send("One or both students not found.");
            }
            const type1 = result[0].project_type;
            const type2 = result[1].project_type;
            const company1 = result[0].company;
            const company2 = result[1].company;
            if(type1 === null || type2 === null)return next(createError.BadRequest("User haven't entered his project_type yet!"));
            else if(type1.toLowerCase() !== type2.toLowerCase()) {
             return res.status(500).send("BOTH MEMBERS SHOULD BE EITHER INTERNAL OR EXTERNAL!!");
            }
            else if(type1 === 'external' && type2 === 'external'){
              if(company1 != company2)return res.status(500).send("BOTH MEMBERS SHOULD BE OF SAME COMPANY!");
            }
    
            // inserts the request in the request db (only if no existing request)
            let sql1 = "INSERT INTO team_requests (name, emailId, reg_num, dept, from_reg_num, to_reg_num) VALUES (?,?,?,?,?,?)";
            let values = [name, emailId, reg_num, dept, from_reg_num, to_reg_num];
          
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

router.get("/student/request_recived/:regnum",(req,res,next) => {
    try{
      let sql = "select * from team_requests where to_reg_num = ? and status = 'interested'";
      let reg_num = req.params.regnum;
      db.query(sql,[reg_num],(error,result) => {
        if(error)return next(error);
        res.send(result);
      })
    }
    catch(error)
    {
      next(error.message);
    }
})

// fetch all the invitations the loggedIn user received

router.get("/student/team_request/:reg_num",(req,res,next) => {
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
router.patch("/student/team_request/:status/:to_reg_num/:from_reg_num", (req, res, next) => {
  try {
    const { from_reg_num, to_reg_num, status } = req.params;

    if (!from_reg_num || !to_reg_num || !status)
      return next(createError.BadRequest("Missing required parameters."));

    //  Update the request if it exists and is still 'interested'
    const updateSQL = `UPDATE team_requests SET status = ? WHERE to_reg_num = ? AND from_reg_num = ? AND status = 'interested'`;

    db.query(updateSQL, [status, to_reg_num, from_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.affectedRows === 0)
        return next(createError.BadRequest("No matching pending request found or already processed."));

      // If accepted, check team size
      if (status.toLowerCase() === 'accept') {
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
router.post("/student/fetch_team_status_and_invitations", (req, res, next) => {
  try {
    const { from_reg_num } = req.body; // logged user's reg num

    if(!from_reg_num)next(createError.BadRequest("from_reg_num not found!"))

    // Step 1: Check if user is in any team (as leader or member)
    const checkTeamSQL = `
      SELECT team_id, team_conformed, from_reg_num AS teamLeader
      FROM team_requests 
      WHERE (from_reg_num = ? OR reg_num = ?)
      AND status = 'accept'
      LIMIT 1
    `;

    db.query(checkTeamSQL, [from_reg_num, from_reg_num], (err1, result1) => {
      if (err1) return next(err1);

      if (result1.length > 0 && result1[0].team_id) {
        const teamId = result1[0].team_id;
        const isTeamConfirmed = result1[0].team_conformed;
        const teamLeaderRegNum = result1[0].teamLeader;

        // Step 2: Fetch all team members (confirmed or not)
        const fetchTeamSQL = `
          SELECT * FROM team_requests 
          WHERE team_id = ? AND status = 'accept'
        `;
        db.query(fetchTeamSQL, [teamId], (err2, teamMembers) => {
          if (err2) return next(err2);

          const fetchLeaderSQL = "SELECT * FROM users WHERE reg_num = ?";
          db.query(fetchLeaderSQL, [teamLeaderRegNum], (err3, leaderDetails) => {
            if (err3) return next(err3);

            // If team is not confirmed, fetch pending invitations
            if (!isTeamConfirmed) {
              const fetchInvitesSQL = `
                SELECT * FROM team_requests 
                WHERE from_reg_num = ? AND team_conformed = 0
              `;
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
        const fetchInvitesSQL = `
          SELECT * FROM team_requests 
          WHERE from_reg_num = ? AND team_conformed = 0
        `;

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

//make the team status -> 1 and assings team id to the team

// if it should be solo team both reg_num should be sent same

router.patch("/student/team_request/conform_team", (req, res, next) => {
  let { name, emailId, reg_num, dept, from_reg_num } = req.body;

  if (!name || !emailId || !reg_num || !dept || !from_reg_num) {
    return next(createError.BadRequest("some req.body is null!"));
  }

  //Count the number of confirmed teams
  let sql = "SELECT COUNT(*) as count FROM team_requests WHERE team_conformed = true";
  db.query(sql, (err, result) => {
    if (err) return next(err);

    const teamNumber = result[0].count + 1;
    const team_id = `TEAM-${String(teamNumber).padStart(4, "0")}`;

    // one member in the team -> directly inserting in team_requests as conformed
      let query1 = "SELECT * FROM team_requests WHERE (from_reg_num = ? OR to_reg_num = ?) AND status = 'accept'";
      db.query(query1,[from_reg_num,from_reg_num],(error,result) => {
        if(error)return next(error);
        if(result.length == 0){
          let query2 = "insert into team_requests (team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num, status, team_conformed) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
          db.query(query2,[team_id, name, emailId, reg_num, dept, from_reg_num, from_reg_num,'accept',true],(error,result) => {
            if(error)return next(error);
            return res.send(`${from_reg_num} is the only team_member in his team!`);
          })
          return;
        }
        else{
            //Set team as confirmed
          let sql1 = "UPDATE team_requests SET team_conformed = true WHERE from_reg_num = ? AND status = 'accept'";
          db.query(sql1, [from_reg_num], (error1, result1) => {
            if (error1) return next(error1);

            if(result1.affectedRows === 0)return res.status(500).send("some error occured silently!");

            // Assign team ID
            let sql2 = "UPDATE team_requests SET team_id = ? WHERE from_reg_num = ? AND status = 'accept'";
            db.query(sql2, [team_id, from_reg_num], (error2, result2) => {
              if (error2) return next(error2);

              if(result2.affectedRows === 0)return res.status(500).send("some error occured silently!");

              // Insert the team request (Executed Last) -> team leader
              let sql3 = `
                INSERT INTO team_requests (team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num, status,team_conformed) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'accept',1)
              `;
              db.query(sql3, [team_id, name, emailId, reg_num, dept, from_reg_num, from_reg_num], (error3, result3) => {
                if (error3) return next(error3);

                if(result3.affectedRows === 0)return res.status(500).send("some error occured silently!");

                // remove the requests recieved the conformed team members
                let sql4 = "select to_reg_num from team_requests where team_id = ?";
                db.query(sql4,[team_id],(error,result) => {
                  if(error)return next(error);
                  if(result.length === 0)return next(createError.NotFound("reg_num not found!"));
                  let pending = result.length;
                  result.forEach(({reg_num}) => {
                    let sql5 = "delete from team_requests where (from_reg_num = ? or to_reg_num = ?) and team_conformed = false and status <> 'accept' and team_id is null";
                    db.query(sql5,[reg_num,reg_num],(error,result) => {
                      if(error)return next(error);
                      if(result.affectedRows === 0)return res.status(500).send("some rows got not affected!");
                      else pending --;
                      if(pending === 0)return res.send("Team status changed from false to true, and team request added.");
                    })
                  })
                })
              });
            });
          });
        }
      })
  });
});

// fetches team members
router.get("/student/getTeamDetails/:reg_num", (req, res, next) => {
  const{reg_num} = req.params;
  if(!reg_num)return next(createError.BadRequest("reg_num not found!"));
  let sql = `SELECT * FROM team_requests WHERE (from_reg_num = ? OR to_reg_num = ?) AND team_conformed = true`;
  db.query(sql,[reg_num,reg_num,],(error,result) => {
    if(error)return next(error);
    res.send(result);
  })
});

// updates the progress

  router.post("/student/update_progress/:week/:reg_num/:team_id", (req, res, next) => {
    try {
      const { week, reg_num, team_id } = req.params;
      const { progress } = req.body;

      const validPhases = [
        "week1", "week2", "week3", "week4", "week5", "week6",
        "week7", "week8", "week9", "week10", "week11", "week12"
      ];

      // Validation Check
      if (!validPhases.includes(week) || !reg_num || !team_id) {
        return res.status(400).json({ message: "Invalid week name or reg_num missing" });
      }

      const sql = `UPDATE team_requests SET ${week}_progress = ? WHERE reg_num = ?`;

      db.query(sql, [progress, reg_num], (err, result) => {
        if (err) return next(err);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "No record found for the provided reg_num." });
        }
        let sql1 = `select ${week}_progress from team_requests where team_id = ?`;
        db.query(sql1,[team_id],(error,result) => {
          if(error)return next(error);

          const allMembersUpdated = result.every((member) => member[`${week}_progress`] !== null); // every -> checks whether every element satisfies the given condition, optimised instead of forEach // . -> [] alternative for . notation
          if(allMembersUpdated)
          {
              const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "rithishvkv@gmail.com", 
                pass: process.env.EMAIL_PASS,
              },
              });

              const mailOptions = {
              from: `"No Reply" <${process.env.EMAIL_USER}>`,
              to: "rithishs.cs24@bitsathy.ac.in",
              subject: "Progress update by your mentee team",
              text: `All team members have updated their progress for ${week}. Please check the Project Register.`
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
          }
          else {
            res.send("Progress updated successfully for this member!");
          }
        })
      });
    } catch (error) {
      next(error);
    }
  });


// brings the details of the project through project_id
router.get("/student/get_project_details/:project_id",(req,res,next) => {
  try{
     const {project_id} = req.params;
     if(!project_id)next(createError.BadRequest("project_Id not found!"))
     let sql = "select * from projects where project_id = ?";
     db.query(sql,[project_id],(error,result) => {
      if(error)next(error);
      res.send(result);
     })
  }
  catch(error)
  {
    next(error);
  }
})

// updates the project type

router.patch("/student/alter_project_status/:reg_num/:type",(req,res,next) => {
  try{
    const{type,reg_num} = req.params;
    const validTypes = ["EXTERNAL","INTERNAL"];
    if(!type || !validTypes.includes(type))
    {
      return next(createError.BadRequest("invalid type! or type is null!"))
    }
    let sql = "update users set project_type = ? where reg_num = ?";
    db.query(sql,[type,reg_num],(error,result) => {
      if(error) return next(error);
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
      res.send(result[0]);
    })
    db.query(sql,[reg_num])
  }
  catch(error)
  {
    next(error);
  }
})

// adds the query in the query table

router.post("/student/add_query/:team_member/:guide_reg_num", (req, res, next) => {
  try {
    const { team_id, project_id, query } = req.body;
    const { team_member, guide_reg_num } = req.params;

    if (!project_id || !team_id || !team_member || !query || !guide_reg_num) {
      return next(createError.BadRequest("Required parameters are missing!"));
    }

    // Step 1: Fetch project name using project_id
    const getProjectNameSql = "SELECT project_name FROM projects WHERE project_id = ?";
    db.query(getProjectNameSql, [project_id], (err, rows) => {
      if (err) return next(err);

      if (rows.length === 0) {
        return next(createError.NotFound("Project not found!"));
      }

      const project_name = rows[0].project_name;

      // Step 2: Insert the query into the queries table
      const insertQuerySql = `
        INSERT INTO queries (team_id, project_id, project_name, team_member, query, guide_reg_num)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(insertQuerySql, [team_id, project_id, project_name, team_member, query, guide_reg_num], (err, result) => {
        if (err) return next(err);

        // Step 3: Delete older answered queries, keeping only the latest 5
        const deleteOldSql = `
          DELETE FROM queries 
          WHERE query_id IN (
            SELECT query_id FROM (
              SELECT query_id 
              FROM queries 
              WHERE team_id = ? AND reply IS NOT NULL
              ORDER BY created_at DESC
              LIMIT 18446744073709551615 OFFSET 5
            ) AS temp
          )
        `;

        db.query(deleteOldSql, [team_id], (err2) => {
          if (err2) return next(err2);

          // Step 4: Send a success response
          res.send("Query added successfully!");
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// gets student details by reg_num

router.get("/student/get_student_details_by_regnum/:reg_num",(req,res,next) => {
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

router.get("/student/getTeamdetails_using_team_id/:team_id",(req,res,next) => {
  try{
    const{team_id} = req.body;
    if(!team_id) return next(createError.BadRequest("team_id is not defined!!"));
    let sql = "select * from team_request where team_id = ?";
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

//fetch queries sent by my team

router.get("/student/get_queries_sent_by_my_team/:team_id",(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest("team_id not found!!"));
    let sql = "select * from queries where team_id = ?";
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// checks whether he is already a member of another team

router.get("/student/check_accepted_status/:reg_num",(req,res,next) => {
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

// fetchs the deadlines from weekly_logs table

router.get("/student/fetchDeadlines/:team_id",(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest("teamid not found!"));
    let sql = "select * from weekly_logs_deadlines";
    db.query(sql,(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})


// gives the weekly deadlines for the specific team -> we can filter the current phase
router.get("students/get_current_week/:team_id",(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest("team_id not found!"));
    let sql = "select * from weekly_logs_deadlines";
    db.query(sql,(error,result) => {
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

router.post("/student/addproject/:project_type/:reg_num", (req, res, next) => {
  try {
    let { project_type,reg_num } = req.params;
    let { project_name, cluster, description, outcome, hard_soft } = req.body;

    project_type = project_type.toLowerCase();
    hard_soft = hard_soft.toLowerCase();

    const validTypes = ['internal','external','hardware','software'];

    if (!project_type.trim() || !project_name.trim() || !cluster.trim() || !description.trim() || !reg_num.trim()) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    if(!validTypes.includes(project_type) || !validTypes.includes(hard_soft))return next(createError.BadRequest("invalid project_type"))

    // checks whether he is a team_leader -> to post project

    let query = "select team_id from team_requests where from_reg_num = ? and team_conformed = true";
    db.query(query,[reg_num],(error,result) => {
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

          // inserting
  
          const sql1 = ` INSERT INTO projects (project_id,project_name,project_type,cluster,description,outcome,hard_soft,tl_reg_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [project_id,project_name,project_type,cluster,description,outcome,hard_soft,reg_num];
          db.query(sql1,values,(error,result) => {
            if(error)return next(error);
            if(result.affectedRows === 0)return next(createError.BadRequest("an error occured silently!"));

            // inserts the project_id to the whole team in team_requests table
            let insertQuery = "update team_requests set project_id = ? where from_reg_num = ? and team_conformed = true";
            db.query(insertQuery,[project_id,reg_num],(error,result) => {
              if(error)return next(error);
              if(result.affectedRows === 0)return next(createError.BadRequest("no rows affected!"));
              return res.status(200).json({"message":`${project_name} added successfully!`,"project_id":project_id});  

              // weekly logs date insertion pending
            })
          })
      });
      })

    })
  } catch (error) {
    next(error.message);
  }
});

// sends the review request to the expert => once in a month
router.post("/student/send_review_request/:team_id/:project_id",(req,res,next) => {
  try{
    const{team_id,project_id} = req.params;
    const{project_name,team_lead,review_date,start_time,expert_reg_num} = req.body;
    if(!team_id || !project_id || !project_name || !team_lead || !review_date || !start_time || !expert_reg_num)return next(createError.BadRequest("some parameters are missing!"));

   const today = new Date();
   const reviewDate = new Date(review_date);

   today.setHours(0, 0, 0, 0);
   reviewDate.setHours(0, 0, 0, 0);

  if (reviewDate < today) {
    return next(createError.BadRequest("Invalid date! Review date cannot be in the past."));
  }

   const formattedDate = reviewDate.toISOString().split('T')[0]; // YYYY-MM-DD

    //checking already requested for same date and time

    let checkdate = "select * from review_requests where review_date = ? and start_time = ? and expert_reg_num = ?";
    db.query(checkdate,[formattedDate,start_time,expert_reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length > 0)return next(createError.BadRequest("review request already exists!"));

      // inserting into db

      let sql = "insert into review_requests (team_id,project_id,project_name,team_lead,review_date,start_time,expert_reg_num) values (?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[team_id,project_id,project_name,team_lead,formattedDate,start_time,expert_reg_num],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return res.status(500).json({"message":"some rows are not affected!"});
        return res.send(`${review_date}:-${start_time} request inserted successfully`)
      })
    })
  }
  catch(error)
  {
    next(error);
  }
})

module.exports = router;
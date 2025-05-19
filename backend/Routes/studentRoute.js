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
    let { name, emailId, reg_num, dept, from_reg_num, to_reg_num } = req.body;
    
    if (!name.trim() || !emailId.trim() || !reg_num.trim() || !dept.trim() || !from_reg_num.trim() || !to_reg_num.trim()) {
      return next(createError.BadRequest());
    }

    // checks for already a connection request exists or not
    let sql = "SELECT * FROM team_requests WHERE from_reg_num = ? AND to_reg_num = ?";
    db.query(sql, [from_reg_num, to_reg_num], (error, result) => {
      if (error) return next(error);

      if (result.length > 0) {
        return res.send(`Connection request already exists with status: ${result[0].status}`);
      }

      let query = "SELECT project_type FROM users WHERE reg_num IN (?,?)";
      db.query(query,[from_reg_num,to_reg_num],(error,result) => {
        if(error)return next(error);
        if (result.length !== 2) {
          return res.status(400).send("One or both students not found.");
        }
        const type1 = result[0].project_type;
        const type2 = result[1].project_type;
        if(type1 != type2)return res.send("BOTH MEMBERS SHOULD BE EITHER INTERNAL OR EXTERNAL!!");

        // inserts the request in the request db (only if no existing request)
      let sql1 = "INSERT INTO team_requests (name, emailId, reg_num, dept, from_reg_num, to_reg_num) VALUES (?,?,?,?,?,?)";
      let values = [name, emailId, reg_num, dept, from_reg_num, to_reg_num];
      
      db.query(sql1, values, (error, result) => {
        if (error) return next(error);  // Use return here to prevent further code execution
        
        return res.send("Request added successfully!");
      });
      })

    });
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

router.get("/student/team_request/:emailId",(req,res,next) => {
  try{
    const emailId = req.params.emailId;
    if(!emailId)next(createError.BadRequest("emailId not found!"));
    let sql = "select * from team_requests where emailId = ? and status = 'interested'"
    db.query(sql,[emailId],(error,result) => {
      if(error) next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// accept or reject request -> inside notification
router.patch("/student/team_request/:status/:to_reg_num/:from_reg_num",(req,res,next) => {
    try{
      const from_reg_num = req.params.from_reg_num;
      const to_reg_num = req.params.to_reg_num;
      const status = req.params.status;            // to will be logged in user
      if(!from_reg_num || !to_reg_num)next(createError.BadRequest("userId not found!"))        
      let sql = `UPDATE team_requests SET status = ? WHERE to_reg_num = ? AND from_reg_num = ? AND status = 'interested'`;
      db.query(sql,[status, to_reg_num, from_reg_num],(error,result) => {
        if(error) return next(error);
        let sql1 = "select * from team_requests where from_reg_num = ? and status = 'accept'";
        db.query(sql1,[from_reg_num],(error1,result1) => {
          if(error1)return next(error1);
          if(result1.length >= 3)
          {
            let sql2 = "DELETE FROM team_requests WHERE from_reg_num = ? AND status <> 'accept'";
            db.query(sql2,[from_reg_num],(error2,result2) => {
              if(error2)return next(error2);
              res.send(`status updated to ${status}`);
            })
          }
        })
      })
    }
    catch(error)
    {
       next(error);
    }
})

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

//226  499 
// it gets all the projects available -> filters by the dept of team members
router.post("/student/projects",(req,res,next) => {
  try{
    const departments = req.body.departments;
    console.log(departments);  // corrected logging
    
    if (!Array.isArray(departments)) {
      return res.status(400).json({ error: 'departments must be an array' });
    }

    if (departments.length === 0) {
      return res.status(400).json({ error: 'departments array cannot be empty' });
    }

    const placeholders = departments.map(() => "?").join(", ");
    const sql = `SELECT * FROM projects WHERE status = 'available' AND cluster IN (${placeholders})`;
    db.query(sql,departments,(error,result) => {
      if(error) return next(error);
      res.send(result);console.log(res.data)
    })
  }
  catch(error)
  {
    next(error);
  }
});

//make the team status -> 1 and assings team id to the team

router.patch("/student/team_request/conform_team", (req, res, next) => {
  let { name, emailId, reg_num, dept, from_reg_num, to_reg_num } = req.body;

  if (!name || !emailId || !reg_num || !dept || !from_reg_num || !to_reg_num) {
    return next(createError.BadRequest("some req.body is null!"));
  }

  //Count the number of confirmed teams
  let sql = "SELECT COUNT(*) as count FROM team_requests WHERE team_conformed = true";
  db.query(sql, (err, result) => {
    if (err) return next(err);

    const teamNumber = result[0].count + 1;
    const team_id = `TEAM-${String(teamNumber).padStart(4, "0")}`;

    //Set team as confirmed
    let sql1 = "UPDATE team_requests SET team_conformed = true WHERE from_reg_num = ? AND status = 'accept'";
    db.query(sql1, [from_reg_num], (error1, result1) => {
      if (error1) return next(error1);

      // Assign team ID
      let sql2 = "UPDATE team_requests SET team_id = ? WHERE from_reg_num = ? AND status = 'accept'";
      db.query(sql2, [team_id, from_reg_num], (error2, result2) => {
        if (error2) return next(error2);

        // Insert the team request (Executed Last)
        let sql3 = `
          INSERT INTO team_requests (team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num, status,team_conformed) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'accept',1)
        `;
        db.query(sql3, [team_id, name, emailId, reg_num, dept, from_reg_num, to_reg_num], (error3, result3) => {
          if (error3) return next(error3);

          // Response to Client
          res.send("Team status changed from false to true, and team request added.");
        });
      });
    });
  });
});


// make project status -> ongoing
router.patch("/student/:status/:project_name",(req,res,next) => {
    try{
      let status = req.params.status; // ongoing || completed 
      let project_name = req.params.project_name;
      if(!status || !project_name)next(createError.BadRequest("status or project_name not found!"))
      let sql = "UPDATE projects SET status = ? WHERE project_name = ?"
      db.query(sql,[status,project_name],(error,result) => {
        if(error) return next(error);
        res.send("project status updated successfully!");
      })
    }
    catch(error)
    {
       next(error);
    }
})

// assigns the project_id to the team_mates and inserts the deadlines in the weekly log table
router.patch("/student/assign_project_id/:project_id/:from_reg_num", (req, res, next) => {
  try {
    const { project_id, from_reg_num } = req.params;
    if(!project_id || !from_reg_num)return next(createError.BadRequest("project_id or from_reg_num is not present!!"))

    const updateSQL = "UPDATE team_requests SET project_id = ?,  project_picked_date = CURRENT_TIMESTAMP  WHERE from_reg_num = ? AND status = 'accept'";
    db.query(updateSQL, [project_id, from_reg_num], (error, updateResult) => {
      if (error) return next(error);

      const selectSQL = "SELECT project_picked_date, team_id FROM team_requests WHERE project_id = ?";
      db.query(selectSQL, [project_id], (error, result) => {
        if (error) return next(error);
        if (result.length === 0 || !result[0].project_picked_date) {
          return res.send("Picked date not found!");
        }

        const pickedDate = new Date(result[0].project_picked_date);
        const teamId = result[0].team_id;
        const deadlines = generateWeeklyDeadlines(pickedDate); // returns 12 weeks

        const insertSQL = "INSERT INTO weekly_logs_deadlines (team_id, project_id, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, week_9, week_10, week_11, week_12) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [teamId, project_id, ...deadlines];

        db.query(insertSQL,values,(error,result) => {
          if(error)return next(error);
         res.json({
          message: "Project assigned and weekly deadlines set.",
          project_id,
          teamId,
          deadlines
        });
        })

      });
    });
  } catch (error) {
    next(error);
  }
});

// fetches team members
router.get("/student/getTeamDetails/:reg_num", (req, res, next) => {
  const{reg_num} = req.params;
  if(!reg_num)return next(createError.BadRequest("reg_num not found!"));
  let sql = "select * from team_requests where from_reg_num = ? and status = 'accept'";
  db.query(sql,[reg_num],(error,result) => {
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

        const allMembersUpdated = result.every((member) => member[`${week}_progress`] !== null); // every checks whether every element satisfies the given condition, optimised instead of forEach // . -> [] alternative for . notation
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


// fetches the details of guide and expert

router.get("/student/fetch_guide_or_expert/:role",(req,res,next) => {
  try{
    const{role} = req.params;
    if(role !== "guide" && role != "sub_expert") return next(createError.BadRequest("invalid role!!"));
    let sql = "select * from users where role = ?";
    db.query(sql,[role],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

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

// by mathan

router.get("/student/check_phase_eligibility/:reg_num", (req, res, next) => {
  const reg_num = req.params.reg_num;
  if (!reg_num) return res.status(400).send("reg_num is required");

  const today = new Date();
  const dayOfWeek = today.getDay(); // 6 = Saturday
  const isSaturday = dayOfWeek === 6;

  // Step 1: Find team_id and project_picked_date
  const teamQuery = `SELECT team_id, project_id, project_picked_date FROM team_requests WHERE reg_num = ? LIMIT 1`;
  db.query(teamQuery, [reg_num], (err1, teamRes) => {
    if (err1) return next(err1);
    if (!teamRes.length) return res.status(404).send("Team info not found");

    const { team_id, project_id, project_picked_date } = teamRes[0];
    const pickedDate = new Date(project_picked_date);
    const timeDiff = today - pickedDate;
    const weekNumber = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));

    // Step 2: Find current phase from weekNumber
    const phaseNum = Math.min(Math.floor((weekNumber - 1) / 2) + 1, 6);
    const currentPhase = `phase${phaseNum}_progress`;

    // Step 3: Check if update already done in this phase
    const checkPhaseQuery = `SELECT ${currentPhase} FROM team_requests WHERE reg_num = ?`;
    db.query(checkPhaseQuery, [reg_num], (err2, phaseRes) => {
      if (err2) return next(err2);

      const phaseProgress = phaseRes[0]?.[currentPhase] || "";
      const alreadyUpdated = parseInt(phaseProgress) > 0;

      res.json({
        allowedPhase: currentPhase,
        weekNumber,
        canUpdate: isSaturday && !alreadyUpdated,
        alreadyUpdated,
        isSaturday
      });
    });
  });
});

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

// EXTERNAL STUDENTS

// -> use teachers add project api for this also by modify the project type

// router.post("/ext_student/:reg_num",(req,res,next) => {
//   try
// })

module.exports = router;
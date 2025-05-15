const express = require("express");
const { route } = require("./teacherRoute");
const createError = require("http-errors");
const verifyAccessToken = require("../utils/verifyAccessToken");
const router = express.Router();
const generateWeeklyDeadlines = require("../utils/generateWeeklyDeadlines");
const db = require("../db");

// adds the connection request in the db -> invite button
router.post("/student/join_request",(req,res,next) => {
    try{
      let {name,emailId,reg_num,dept,from_reg_num,to_reg_num} = req.body;
      if(name.trim() == "" || emailId.trim() == "" || reg_num.trim() == "" || dept.trim() == "" || from_reg_num.trim() == "" || to_reg_num.trim() == "")return next(createError.BadRequest());
      let sql1 = "insert into team_requests(name,emailId,reg_num,dept,from_reg_num,to_reg_num) values (?,?,?,?,?,?)";
      let values = [name,emailId,reg_num,dept,from_reg_num,to_reg_num];
      // inserts the request in the request db
      db.query(sql1,values,(error,result) => {
        if(error) next(error);
        res.send("request added successfully!");
      })
    }
    catch(error)
    {
        next(error.message);
    }
})

// // sets the team_id to the connected team members -> clicks conform button
// router.post("/student/add_team_id/:from_reg_num",async(req,res,next) => {
//   try{
//     const{from_reg_num} = req.params;
    
//     if(!from_reg_num || !team_id)return next(createError.BadRequest("reg_num or team_id not found!!"))
//     const sql = `
//     UPDATE team_requests 
//     SET team_id = ? 
//     WHERE from_reg_num = ? AND status = 'accepted'
//   `;
//     db.query(sql,[team_id,from_reg_num],(error,result) => {
//       if(error) next(error);
//       res.send("teamId inserted successfully!");
//     })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

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
      const fromreg = req.params.from_reg_num;
      const toreg = req.params.to_reg_num;
      const status = req.params.status;            // to will be logged in user
      console.log(fromreg,toreg,status);        
      let sql = `UPDATE team_requests SET status = ? WHERE to_reg_num = ? AND from_reg_num = ? AND status = 'interested'`;
      db.query(sql,[status, toreg, fromreg],(error,result) => {
        if(error) return next(error);
        res.send(`status updated to ${status}`);
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

    // Step 1: Check if user is in any confirmed team (as leader or member)
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

        // Step 2: Fetch all confirmed team members with that team_id
        const fetchTeamSQL = "SELECT * FROM team_requests WHERE team_id = ? AND status = 'accept' AND team_conformed = 1";
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

// it gets all the projects available -> filters by the dept of team members
router.post("/student/projects",(req,res,next) => {
    try{
      const departments = req.body.departments;

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
        res.send(result);
      })
    }
    catch(error)
    {
      next(error);
    }
})

// // sets the project to the respective team when they pick a project
// router.patch("/student/set_projectId_to_team",(req,res,next) => {
//   try{
//     let {project_id,team_id} = req.body;
//     let sql = "UPDATE team_requests SET project_id = ? WHERE team_id = ?";
//     db.query(sql,[project_id,team_id],(error,result) => {
//       if(error) next(error);
//       else
//       {
//         res.send("Project_Id correctly inserted into the Given team_Id");
//       }
//     })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

//make the team status -> 1 and assings team id to the team
router.patch("/student/team_request/conform_team",async(req,res,next) => {
  try{
    let {from_reg_num} = req.body;
    // returns an array like = [{"count:1"},{"count":2}] -> this destructed and stored in existingTeams
    const[existingTeams] = await db.query("select count(*) as count from team_requests where team_conformed = true");
    const teamNumber = existingTeams[0].count+1;
    const team_id = `TEAM-${String(teamNumber).padStart(4,"0")}`; //TEAM-ID-0001
    if(!from_reg_num || !team_id)return next(createError.BadRequest("team_id or reg_num is null!"))
    let sql = "update team_requests set team_conformed = true where from_reg_num = ? and status = 'accept'";
    db.query(sql,[from_reg_num],(error,result) => {
      if(error)return next(error);
      let sql1 = `
      update team_requests 
      SET team_id = ? 
      WHERE from_reg_num = ? AND status = 'accept'`
      db.query(sql1,[team_id,from_reg_num],(error,result) => {
        if(error)return next(error);
        res.send("Team status changed from false to true");
      })
    })
  }
  catch(error)
  {
      next(error);
  }
})

// make project status -> ongoing
router.patch("/student/:status/:project_name",(req,res,next) => {
    try{
      let status = req.params.status; // ongoing || completed 
      let project_name = req.params.project_name;
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

// assigns the project_id to the team_mates
router.patch("/student/assign_project_id/:project_id/:from_reg_num", (req, res, next) => {
  try {
    const { project_id, from_reg_num } = req.params;

    const updateSQL = "UPDATE team_requests SET project_id = ? WHERE from_reg_num = ? AND status = 'accept'";
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

        const insertSQL = "INSERT INTO weekly_logs_deadlines (team_id, week_number, deadline_date) VALUES (?, ?, ?)";
        let inserted = 0;

        for (let i = 0; i < deadlines.length; i++) {
          db.query(insertSQL, [teamId, i + 1, deadlines[i]], (error) => {
            if (error) return next(error);
            inserted++;
            if (inserted === deadlines.length) {
              res.send("Project ID assigned and 12 deadlines generated successfully");
            }
          });
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// fetches team members
router.get("/student/getTeamDetails/:reg_num", (req, res, next) => {
  const reg_num = req.params.reg_num;

  // First, fetch the initial request to find out if the student is in a confirmed team
  const getInitialRequestSql = `
    SELECT * FROM team_requests 
    WHERE (from_reg_num = ? OR to_reg_num = ?) AND Team_conformed = 1
  `;

  db.query(getInitialRequestSql, [reg_num, reg_num], (err, results) => {
    if (err) return next(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "No confirmed team found" });
    }

    const teamLeaderRegNum = results[0].from_reg_num;

    const getTeamSql = `
      SELECT * FROM team_requests 
      WHERE from_reg_num = ? AND Team_conformed = 1
    `;

    db.query(getTeamSql, [teamLeaderRegNum], (err2, teamDetails) => {
      if (err2) return next(err2);

      // If no team members are found, return a 404 error
      if (teamDetails.length === 0) {
        return res.status(404).json({ message: "No team members found" });
      }

      // Fetch the team leader's details
      let sql3 = "SELECT * FROM users WHERE reg_num = ?";
      db.query(sql3, [teamLeaderRegNum], (error, tldetails) => {
        if (error) return next(error);

        if (tldetails.length === 0) {
          return res.status(404).json({ message: "No team leader found" });
        }

        const finalResults = [...teamDetails, ...tldetails];

        res.send(finalResults);
      });
    });
  });
});

// updates the progress

router.post("/student/update_progress/:phase/:reg_num", (req, res, next) => {
  try {
    const { phase, reg_num } = req.params;
    const { contribution, progress } = req.body;

   const validPhases = [
    "phase1", "phase2", "phase3", "phase4", "phase5", "phase6",
    "phase7", "phase8", "phase9", "phase10", "phase11", "phase12"];

    if (!validPhases.includes(phase)) {
      return res.status(400).json({ message: "Invalid phase name" });
    }

    const sql = `UPDATE team_requests SET ${phase}_contribution = ?, ${phase}_progress = ? WHERE reg_num = ?`;

    db.query(sql, [contribution, progress, reg_num], (err, result) => {
      if (err) return next(err);

      // Email setup
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "rithishvkv@gmail.com",
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: '"No Reply" <rithishvkv@gmail.com>',
        to: "rithishs.cs24@bitsathy.ac.in",
        subject: "Progress update by your mentee",
        text: `Student with reg_num ${reg_num} has updated progress for ${phase}. Please check the Project Register.`,
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
    });
  } catch (error) {
    next(error);
  }
});


// brings the details of the project through project_id
router.get("/student/get_project_details/:project_id",(req,res,next) => {
  try{
     const {project_id} = req.params;
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

// GET /student/team_progress
router.get("/student/team_progress/:phase", (req, res) => {
  const { phase } = req.params;

  // Validate input to prevent SQL injection
  const allowedPhases = ['phase1', 'phase2', 'phase3', 'phase4'];
  if (!allowedPhases.includes(phase)) {
    return res.status(400).send("Invalid phase");
  }

  const sql = `
    SELECT name, ${phase}_progress AS value
    FROM team_requests
    WHERE team_id = '001' AND ${phase}_progress IS NOT NULL
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB error");
    res.json(results); // [{ name, value }, ...]
  });
});


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

// checks whether the user have given project_type
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


module.exports = router;
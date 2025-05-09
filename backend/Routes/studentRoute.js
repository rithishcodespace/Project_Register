const express = require("express");
const { route } = require("./teacherRoute");
const createError = require("http-errors");
const verifyAccessToken = require("../utils/verifyAccessToken");
const router = express.Router();
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

// sets the team_id to the connected team members -> clicks conform button
router.post("/student/add_team_id/:from_reg_num/:team_id",(req,res,next) => {
  try{
    const team_id = req.params.team_id;
    const sql = `
    UPDATE team_requests 
    SET team_id = ? 
    WHERE from_reg_num = ? AND status = 'accepted'
  `;
    db.query(sql,[team_id],(error,result) => {
      if(error) next(error);
      res.send("teamId inserted successfully!");
    })
  }
  catch(error)
  {
    next(error);
  }
})

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

    // Step 1: Check if user is in any team (as leader or member)
    const checkTeamSQL = `
      SELECT team_id, team_conformed 
      FROM team_requests 
      WHERE (from_reg_num = ? OR reg_num = ?)
      AND status = 'accept'
      LIMIT 1
    `;

    db.query(checkTeamSQL, [from_reg_num, from_reg_num], (err1, result1) => {
      if (err1) return next(err1);

      if (result1.length > 0 && result1[0].team_id) {
        const teamId = result1[0].team_id;
        const isTeamConfirmed = result1[0].team_conformed; // Fixed variable name

        // Step 2: Fetch all team members with that team_id
        const fetchTeamSQL = "SELECT * FROM team_requests WHERE team_id = ? AND status = 'accept'";
        db.query(fetchTeamSQL, [teamId], (err2, teamMembers) => {
          if (err2) return next(err2);

          // Step 3: For unconfirmed teams, check if user has sent any invitations
          if (!isTeamConfirmed) {
            const fetchInvitesSQL = `
              SELECT * FROM team_requests 
              WHERE from_reg_num = ? AND team_conformed = 0
            `;

            db.query(fetchInvitesSQL, [from_reg_num], (err3, invites) => {
              if (err3) return next(err3);
              
              const pendingInvitations = invites.filter(invite => invite.status !== 'accept');
              res.json({
                teamConformationStatus: 0, // Fixed typo in response field
                teamMembers,
                pendingInvitations
              });
            });
          } else {
            res.json({
              teamConformationStatus: 1, // Fixed typo in response field
              teamMembers,
              pendingInvitations: []
            });
          }
        });

      } else {
        // User is not in any team, fetch invitations they've sent
        const fetchInvitesSQL = `
          SELECT * FROM team_requests 
          WHERE from_reg_num = ? AND team_conformed = 0
        `;

        db.query(fetchInvitesSQL, [from_reg_num], (err3, invites) => {
          if (err3) return next(err3);

          const pendingInvitations = invites.filter(invite => invite.status !== 'accept');
          const teamMembers = invites.filter(invite => invite.status === 'accept');

          res.json({
            teamConformationStatus: 0, // Fixed typo in response field
            teamMembers,
            pendingInvitations
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

//make the team status -> 1 
router.patch("/student/team_request/conform_team",(req,res,next) => {
  try{
    let {from_reg_num} = req.body;
    let sql = "update team_requests set team_conformed = true where from_reg_num = ? and status = 'accept'";
    db.query(sql,[from_reg_num],(error,result) => {
      if(error)return next(error);
      res.send("Team status changed from false to true");
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
router.patch("/student/assgin_project_id/:project_id/:from_reg_num",(req,res,next) => {
  try{
     const {project_id,from_reg_num} = req.params;
     let sql = "UPDATE team_requests SET project_id = ? WHERE from_reg_num = ? AND status = 'accept'";
     db.query(sql,[project_id,from_reg_num],(error,result) => {
      if(error)next(error);
      res.send("Project_Id updated successfully")
     })
  }
  catch(error)
  {
    next(error);
  }
})

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



router.post("/student/update_progress/:phase/:reg_num", (req, res, next) => {
  try {
    const { phase, reg_num } = req.params;
    const { contribution } = req.body;

    // Validate phase name
    const validPhases = [
      "phase1_progress",
      "phase2_progress",
      "phase3_progress",
      "phase4_progress",
      "phase5_progress",
    ];

    if (!validPhases.includes(phase)) {
      return res.status(400).json({ message: "Invalid phase name" });
    }

    const sql = `UPDATE team_requests SET ${phase} = ? WHERE reg_num = ?`;

    db.query(sql, [contribution, reg_num], (err, result) => {
      if (err) return next(err);
      res.send("Progress updated successfully!");
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
router.get("/student/team_progress", (req, res) => {
  const sql = `
    SELECT name, phase1_progress as value 
    FROM team_requests 
    WHERE team_id = '001' AND phase1_progress IS NOT NULL
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB error");
    res.json(results); // Must return array with { name, value }
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

router.post("/student/add_query/:team_member",(req,res,next) => { // after 100 deletes old one
  try{
    const{team_id,project_id,project_name,query} = req.body;
    const{team_member} = req.params;
    if(!team_id || !project_id || !project_name || !team_member || !query)
    {
      return next(createError.BadRequest("req parameters are missing!"))
    }
    let sql = "insert into queries(team_id,project_id,project_name,team_member,query) values (?,?,?,?,?)";
    db.query(sql,[team_id,project_id,project_name,team_member,query],(error,result) => {
      if(error)return next(error);
      res.send("query added successfully!");
    })
  }
  catch(error)
  {
    next(error);
  }
})



module.exports = router;
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

    // Step 1: Check if user is in a confirmed team
    const checkConfirmedSQL = "SELECT team_id FROM team_requests WHERE from_reg_num = ? AND team_conformed = 1";

    db.query(checkConfirmedSQL, [from_reg_num], (err1, result1) => {
      if (err1) return next(err1);

      if (result1.length > 0 && result1[0].team_id) {
        const teamId = result1[0].team_id;

        // Step 2: Fetch all team members with that team_id
        const fetchTeamSQL = "SELECT * FROM team_requests WHERE team_id = ?";
        db.query(fetchTeamSQL, [teamId], (err2, teamMembers) => {
          if (err2) return next(err2);

          res.json({
            teamConformationStatus: 1,
            teamMembers,
            pendingInvitations: []
          });
        });

      } else {
        // Step 3: Not confirmed, fetch invitations sent by the user
        const fetchInvitesSQL = `
          SELECT * FROM team_requests 
          WHERE from_reg_num = ? AND team_conformed = 0
        `;

        db.query(fetchInvitesSQL, [from_reg_num], (err3, invites) => {
          if (err3) return next(err3);

          // Filter out accepted members from pending invitations
          const pendingInvitations = invites.filter(invite => invite.status !== 'accept');
          const teamMembers = invites.filter(invite => invite.status === 'accept');

          res.json({
            teamConformationStatus: 0,
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

// it gets all the projects available -> it has to be filtered in the frontend 
router.get("/student/projects",(req,res,next) => {
    try{
      let sql = "select * from projects where status = 'available'";
      db.query(sql,(error,result) => {
        if(error) return next(error);
        res.send(result);
      })
    }
    catch(error)
    {
      next(error);
    }
})

// sets the project to the respective team when they pick a project
router.post("/student/set_projectId_to_team",(req,res,next) => {
  try{
    let {project_id,team_id} = req.body;
    let sql = "insert into team_requests(project_id) values(?) where team_id = ?";
    db.query(sql,[project_id,team_id],(error,result) => {
      if(error) next(error);
      else
      {
        res.send("Project_Id correctly inserted into the Given team_Id");
      }
    })
  }
  catch(error)
  {
    next(error);
  }
})

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

router.get("/student/getTeamDetails/:reg_num", (req, res, next) => {
  try {
    const reg_nums = req.params.reg_num;
    let sql = "SELECT * FROM team_requests WHERE (from_reg_num = ? OR to_reg_num = ?) AND Team_conformed = 1";

    db.query(sql, [reg_nums, reg_nums], (err, results) => {
      if (err) {
       next(err);
      }
      res.status(200).json({ teamDetails: results });
    });
  } catch (error) {
    next(error);
  }
});




module.exports = router;
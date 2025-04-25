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

// accept or reject request -> inside notification
router.patch("/student/team_request/:status/:to_reg_num/:from_reg_num",(req,res,next) => {
    try{
      const fromreg = req.params.from_reg_num;
      const toreg = req.params.to_reg_num;
      const status = req.params.status;
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

// it where the he sent invitations and where his team is conformed
router.post("/student/fetch_team_status_and_invitations", (req, res, next) => {
  try {
    const { emailId } = req.body;

    const sql1 = "SELECT team_conformed FROM team_requests WHERE emailId = ?";
    const sql2 = "SELECT * FROM team_requests WHERE emailId = ? AND team_conformed = 0";

    db.query(sql1, [emailId], (error1, result1) => {
      if (error1) return next(error1);

      db.query(sql2, [emailId], (error2, result2) => {
        if (error2) return next(error2);

        res.send({
          teamConformationStatus: result1[0]?.team_conformed ?? null,
          pendingInvitations: result2
        });
      });
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

// make project status -> ongoing
router.post("/student/:status/:projectId",(req,res,next) => {
    try{
      let status = req.params.status; // ongoing || completed 
      let projectId = req.params.projectId;
      let sql = "insert into projects(status) values(?) where project_id = ?";
      db.query(sql,[status,projectId],(error,result) => {
        if(error) return next(error);
        res.send("project status updated successfully!");
      })
    }
    catch(error)
    {
       next(error);
    }
})



module.exports = router;
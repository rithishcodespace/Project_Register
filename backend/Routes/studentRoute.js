const express = require("express");
const { route } = require("./teacherRoute");
const createError = require("http-errors");
const verifyAccessToken = require("../utils/verifyAccessToken");
const router = express.Router();
const db = require("../db");

// adds the connection request in the db -> invite button
router.post("/student/join_request",(req,res,next) => {
    try{
      let {team_id,name,emailId,reg_num,dept,from_reg_num,to_reg_num} = req.body;
      if(team_id.trim() == "" || name.trim() == "" || emailId.trim() == "" || reg_num.trim() == "" || dept.trim() == "" || from_reg_num.trim() == "" || to_reg_num.trim() == "")return next(createError.BadRequest());
      let sql = "insert into team_requests(team_name,name,emailId,reg_num,dept,from_reg_num,to_reg_num) values (?,?,?,?,?,?,?)";
      let values = [team_id,name,emailId,reg_num,dept,from_reg_num,to_reg_num];
      db.query(sql,(error,values,result) => {
        if(error) next(error);
        res.send("request added successfully!");
      })
    }
    catch(error)
    {
        next(error.message);
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
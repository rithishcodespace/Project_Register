const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const verifyAccessToken = require("../utils/verifyAccessToken");
const db = require("../db");

router.post("/teacher/addproject",(req,res,next) => {
    try{
      const {project_id,project,cluster,description,phase_1_requirement,phase_1_deadline,phase_2_requirement,phase_2_deadline,phase_3_requirement,phase_3_deadline,phase_4_requirement,phase_4_deadline,phase_5_requirement,phase_5_deadline} = req.body;
      if (!project_id || !project || !cluster || !description) {
        return res.status(400).json({ message: "Required fields are missing." });
      }
      let sql = "INSERT INTO projects (project_id, project_name, cluster, description, phase_1_requirements, phase_1_deadline, phase_2_requirements, phase_2_deadline, phase_3_requirements, phase_3_deadline, phase_4_requirements, phase_4_deadline, phase_5_requirements, phase_5_deadline) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
      const values = [project_id,project,cluster,description,phase_1_requirement,phase_1_deadline,phase_2_requirement,phase_2_deadline,phase_3_requirement,phase_3_deadline,phase_4_requirement,phase_4_deadline,phase_5_requirement,phase_5_deadline];
      db.query(sql,values,(error,result) => {
        if(error) return next(error);
        res.send("project added successfully!");
      }) 
    }
    catch(error){
      next(error.message);
    }
})

router.get("/teacher/fetch_all_projects",(req,res,next) => {
  try{
    let sql = "select * from projects";
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

router.get("/teacher/getprojects",(req,res,next) => {
  try{
    let sql = "select * from projects";
    db.query(sql,(error,result) => {
      if(error)return next(error);
      console.log(result);
      res.send(result);

    })
  }
  catch(error)
  {
    next(error.message);
  }
})

router.get("/teacher/get_projects_by_cluster/:cluster",(req,res,next) => {
  try{
    let cluster = req.params.cluster;
    let sql = "select * from projects where cluster = ?";
    db.query(sql,[cluster],(error,result) => {
      if(error)return next(error);
      else res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

router.get("/teacher/get_projects_by_id/:projectId",(req,res,next) => {
  try{
    let {projectId} = req.params;
    let sql = "select * from projects where project_id = ?";
    db.query(sql,[projectId],(error,result) => {
      if(error)return next(error);
      else{
        if (project.length === 0) {
          return res.status(404).json({ message: "Project not found" });
        }  
         res.send(result);
      }
    })
  }
  catch(error)
  {
    next(error);
  }
})

module.exports = router;
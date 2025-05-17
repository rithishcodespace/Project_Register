const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const verifyAccessToken = require("../utils/verifyAccessToken");
const db = require("../db");

router.post("/teacher/addproject",(req,res,next) => {
    try{
      const {project_id,project,cluster,description,phase_1_requirement,phase_2_requirement,phase_3_requirement,phase_4_requirement,phase_5_requirement,phase_6_requirement,phase_7_requirement,phase_8_requirement,phase_9_requirement,phase_10_requirement,phase_11_requirement,phase_12_requirement} = req.body;
      if (!project_id || !project || !cluster || !description || !phase_1_requirement || !phase_2_requirement || !phase_3_requirement || !phase_4_requirement || !phase_5_requirement || !phase_6_requirement || !phase_7_requirement || !phase_8_requirement || !phase_9_requirement || !phase_10_requirement || !phase_11_requirement|| !phase_12_requirement) {
        return res.status(400).json({ message: "Required fields are missing." });
      }
      let sql = "INSERT INTO projects (project_id,project,cluster,description,phase_1_requirement,phase_2_requirement,phase_3_requirement,phase_4_requirement,phase_5_requirement,phase_6_requirement,phase_7_requirement,phase_8_requirement,phase_9_requirement,phase_10_requirement,phase_11_requirement,phase_12_requirement) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
      const values = [project_id,project,cluster,description,phase_1_requirement,phase_2_requirement,phase_3_requirement,phase_4_requirement,phase_5_requirement,phase_6_requirement,phase_7_requirement,phase_8_requirement,phase_9_requirement,phase_10_requirement,phase_11_requirement,phase_12_requirement];
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

router.get("/teacher/get_projects_by_id/:projectId", (req, res, next) => {
  try {
    const { projectId } = req.params;
    const sql = "SELECT * FROM projects WHERE project_id = ?";
    db.query(sql, [projectId], (error, result) => {
      if (error) return next(error);
      if (result.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.send(result);
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
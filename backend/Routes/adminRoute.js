const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const db = require("../db");

// add users

router.post("/admin/adduser",(req,res,next) => {
   try{
     let sql = "insert into users(name,emailId,password,role,dept,reg_num,phone_number) values(?,?,?,?,?,?,?)";
     const values = [req.body.name,req.body.emailId,req.body.password,req.body.role,req.body.dept,req.body.reg_num,req.body.phone_number];
     db.query(sql,values,(error,result) => {
        if(error) next(error);
        res.send("user added successfully by admin!");
     })
   }
   catch(error)
   {
     next(error);
   }
})

// remove users

router.delete("/admin/removeuser/:emailId/:reg_num/:role",(req,res,next) => {
  try{
    const{emailId,reg_num,role} = req.params;
    if(!emailId || !reg_num || !role)return createError.BadRequest("parameters are misssing!");
    let sql = "delete from users where emailId = ? and reg_num = ? and role = ?";
    db.query(sql,[emailId,reg_num,role],(error,result) => {
      if(error) return next(error);
      res.send("user deleted successfully !")
    })
  }
  catch(error)
  {
    next(error);
  }
})

// delete projects
router.delete("admin/delete_project/:project_id",(req,res,next) => {
  try{
    const{project_id} = req.body;
    if(!project_id)return next(error);
    let sql = "delete from projects where project_id = ?"
    db.query(sql,[project_id],(error,result) => {
      if(error)return next(error);
      res.send("project deleted successfully!");
    })
  }
  catch(error)
  {
    next(error);
  }
})

// edit project
router.patch("/admin/edit_project/:project_id", (req, res, next) => {
  try {
    const { project_id } = req.params; 
    if (!project_id) return next(createError.BadRequest("Project ID is missing"));
    const { project, cluster, description, phase_1_requirement, phase_1_deadline, phase_2_requirement, phase_2_deadline, phase_3_requirement, phase_3_deadline, phase_4_requirement, phase_4_deadline, phase_5_requirement, phase_5_deadline } = req.body;
    if (!project || !cluster || !description) return res.status(400).json({ message: "Required fields are missing." });
    db.query(
  `UPDATE projects SET project_name=?, cluster=?, description=?, phase_1_requirements=?, phase_1_deadline=?, phase_2_requirements=?, phase_2_deadline=?, phase_3_requirements=?, phase_3_deadline=?, phase_4_requirements=?, phase_4_deadline=?, phase_5_requirements=?, phase_5_deadline=? WHERE project_id=?`,
  [project, cluster, description, phase_1_requirement, phase_1_deadline, phase_2_requirement, phase_2_deadline, phase_3_requirement, phase_3_deadline, phase_4_requirement, phase_4_deadline, phase_5_requirement, phase_5_deadline, project_id],(error, result) => {
    if (error) {
      return next(error);
    } else if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found." });
    } else {
      return res.send("Project updated successfully!");
    }
  }
  );
  } 
  catch (error) 
  {
     next(error);
  }
});

// fetches the users based on the given role

router.get("/fetchUsers/:role",(req,res,next) => {
  try{
     const{role} = req.params;
     if(!role)return next(createError.BadRequest("role not found!"));
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

// adds timeline to the timeline table

router.post("/admin/addTimeLine",(req,res,next) => {
  try{
    const{name,start_date,end_date} = req.body;
    if(!name.trim() || !start_date || end_date)
    {
      return next(createError.BadRequest("name or start_date or end_date is undefined!"));
    }
    let sql = "insert into timeline values (?,?,?)";
    db.query(sql,[name,start_date,end_date],(error,result) => {
      if(error)return next(error);
      res.send("Timeline added successfully to the timeline table!!");
    })
  }
  catch(error)
  {
    next(error);
  }
})

// Add this in your router file, e.g., routes/projects.js

router.get("/teacher/student_progress/:cluster", (req, res, next) => {
  try {
    const { cluster } = req.params;
    if (!cluster) return res.status(400).json({ message: "Cluster is required" });

    const sql = `
      SELECT name, reg_num, phase, progress
      FROM student_progress
      WHERE cluster = ?
    `;

    db.query(sql, [cluster], (error, results) => {
      if (error) return next(error);
      res.json(results);
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
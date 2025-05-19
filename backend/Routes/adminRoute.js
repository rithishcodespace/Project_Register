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
router.delete("/admin/delete_project/:project_id",(req,res,next) => {
  try{
    const{project_id} = req.params;
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

/// Assuming you have: const express = require('express');
// and db is your MySQL connection pool or client.

router.patch("/admin/edit_project/:old_project_id", (req, res, next) => {
  try {
    const { old_project_id } = req.params;
    const { new_project_id, project_name, cluster, description } = req.body;

    // Validate required fields
    if (!new_project_id || !project_name || !cluster || !description) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // First check: if user is trying to change project_id to a new one,
    // verify the new_project_id does not already exist in DB
    if (new_project_id !== old_project_id) {
      const checkSql = `SELECT project_id FROM projects WHERE project_id = ?`;
      db.query(checkSql, [new_project_id], (checkErr, checkResult) => {
        if (checkErr) {
          console.error("Error checking new project ID:", checkErr);
          return res.status(500).json({ message: "Database error during ID check." });
        }

        if (checkResult.length > 0) {
          // Conflict: new project ID already exists
          return res.status(409).json({ message: `Project ID '${new_project_id}' already exists.` });
        }

        // If not exists, proceed to update
        performUpdate();
      });
    } else {
      // project_id is not changed, just update other fields
      performUpdate();
    }

    function performUpdate() {
      const updateSql = `
        UPDATE projects
        SET project_id = ?, project_name = ?, cluster = ?, description = ?
        WHERE project_id = ?`;

      db.query(updateSql, [new_project_id, project_name, cluster, description, old_project_id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("DB update error:", updateErr);

          // Check for foreign key or duplicate key errors
          if (updateErr.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Duplicate project ID. Update failed." });
          }
          if (updateErr.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ message: "Project is referenced elsewhere. Cannot update project ID." });
          }

          return res.status(500).json({ message: "Database error during update." });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: "Project not found." });
        }

        res.json({ message: "Project updated successfully!" });
      });
    }

  } catch (error) {
    console.error("Unexpected error:", error);
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


// fetches the timelines

router.get("/admin/get_timelines",(req,res,next) => {
  try{
   let sql = "select * from timeline";
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

// deletes the timeline

router.delete("/admin/remove_timeline/:id",(req,res,next) => {
  try{
    const{id} = req.params;
    if(!id)return next(createError.BadRequest("id not found!"));
    let sql = "delete from timeline where id = ?";
    db.query(sql,[id],(error,result) => {
      if(error)return next(createError);
      res.send(`${id}st timeline successfully deleted from timelines!`);
    })
  }
  catch(error)
  {
    next(error)
  }
})

// updates the timeline

router.patch("/admin/update_timeline_id/:id",(req,res,next) => {
  try{
     const{id} = req.params;
     const{name,start_date,end_date} = req.body;
     if(!name || !start_date || !end_date)return next(createError.BadRequest("req.body is missing!"))
     if(!id)return next(error);
     let sql = "UPDATE timeline SET name = ?, start_date = ?, end_date = ? WHERE id = ?";
     db.query(sql,[name,start_date,end_date,id],(error,result) => {
      if(error)return next(error);
      res.send(`${id} successfully updated to ${start_date} and ${end_date}`);
     })
  }
  catch(error)
  {
    next(error);
  }
})

// fetches the team_progress based on the project_id

router.get("/admin/fetch_progress_by_project_id/:project_id",(req,res,next) => {
  try{
    const{project_id} = req.params;
    if(!project_id)return next(createError.BadRequest("project_id not found!"));
    let sql = "select * from team_requests where project_id = ?";
    db.query(sql,[project_id],(error,result) => {
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
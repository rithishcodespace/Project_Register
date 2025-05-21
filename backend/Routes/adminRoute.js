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
        if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
        res.send("user added successfully by admin!");
     })
   }
   catch(error)
   {
     next(error);
   }
})

// fetch users based on role

router.get("/admin/get_users/:role",(req,res,next) => {
  try{
    const{role} = req.params;
    const validRoles = ['student','admin','sub_expert','guide','teacher'];
    if (!role || !validRoles.includes(role)) {
      return next(createError.BadRequest("Invalid or missing user role!"));
    }
    let sql = "select * from users where role = ? and available = true";
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

// remove users

router.delete("/admin/removeuser/:emailId/:reg_num/:role",(req,res,next) => {
  try{
    const{emailId,reg_num,role} = req.params;
    if(!emailId || !reg_num || !role)return createError.BadRequest("parameters are misssing!");
    let sql = "delete from users where emailId = ? and reg_num = ? and role = ?";
    db.query(sql,[emailId,reg_num,role],(error,result) => {
      if(error) return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
      res.send("user deleted successfully !")
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
    if(!name.trim() || !start_date || !end_date)
    {
      return next(createError.BadRequest("name or start_date or end_date is undefined!"));
    }
    let time1 = new Date(start_date);
    let time2 = new Date(end_date);
    if(time1 > time2)return next(createError.BadRequest("Invalid time range!"));
    let sql = "INSERT INTO timeline (name, start_date, end_date) VALUES (?, ?, ?)";
    db.query(sql,[name,start_date,end_date],(error,result) => {
      if(error)return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
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
    if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
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
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
      res.send(`${id}st timeline successfully deleted from timelines!`);
    })
  }
  catch(error)
  {
    next(error)
  }
})

// updates the timeline -> doubt with cron job

router.patch("/admin/update_timeline_id/:id",(req,res,next) => {
  try{
     const{id} = req.params;
     const{name,start_date,end_date} = req.body;
     if(!name || !start_date || !end_date)return next(createError.BadRequest("req.body is missing!"))
     if(!id)return next(error);
     let sql = "UPDATE timeline SET name = ?, start_date = ?, end_date = ? WHERE id = ?";
     db.query(sql,[name,start_date,end_date,id],(error,result) => {
      if(error)return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
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
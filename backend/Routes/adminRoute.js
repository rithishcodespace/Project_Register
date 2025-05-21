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

// get project through project_id

router.get("/admin/getproject_by_team_id/:project_id",(req,res,next) => {
  try{
   const{project_id} = req.params;
   if(!project_id)return next("team_id not found");
   let sql = "select * from projects where project_id = ?";
   db.query(sql,[project_id],(error,result) => {
    if(error)return next(error);
    return res.send(result);
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
    start_date = time1.toISOString().split('T')[0];
    end_date = time2.toISOString().split('T')[0];
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

// updates the timeline -> whole timeline (not team_specific)

router.patch("/admin/update_timeline_id/:id",(req,res,next) => {
  try{
     const{id} = req.params;
     let{start_date,end_date} = req.body;
     if(!start_date || !end_date)return next(createError.BadRequest("req.body is missing!"))
     let date1 = new Date(start_date);
     let date2 = new Date(end_date);
     date1.setHours(0,0,0,0);
     date2.setHours(0,0,0,0);
     if(date1 > date2)return next(createError.BadRequest("Invalid date"))
     start_date = date1.toISOString().split('T')[0];
     end_date = date2.toISOString().split('T')[0];
     if(!id)return next(createError.BadRequest("Timeline ID is missing in URL.")); 
     let sql = "UPDATE timeline SET start_date = ?, end_date = ?, cron_executed = false WHERE id = ?";
     db.query(sql,[start_date,end_date,id],(error,result) => {
      if(error)return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
      res.status(200).json({
        message: "Timeline updated successfully.",
        id,
        start_date,
        end_date
      });
     })
  }
  catch(error)
  {
    next(error);
  }
})

// updates timeline team-specific -> either guide or expert not accepted

router.patch("/admin/update_team_timeline/:team_id", (req, res, next) => {
  try {
    const { team_id } = req.params;
    let { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return next(createError.BadRequest("Start and end dates are required."));
    }

    start_date = new Date(start_date);
    end_date = new Date(end_date);
    start_date.setHours(0, 0, 0, 0);
    end_date.setHours(0, 0, 0, 0);

    if (start_date > end_date) {
      return next(createError.BadRequest("Start date cannot be after end date."));
    }

    start_date = start_date.toISOString().split('T')[0];
    end_date = end_date.toISOString().split('T')[0];

    const sql = `
      UPDATE timeline 
      SET start_date = ?, end_date = ?, cron_executed = false 
      WHERE team_id = ? AND name = 'project timeline'
    `;

    db.query(sql, [start_date, end_date, team_id], (error, result) => {
      if (error) return next(error);
      if (result.affectedRows === 0) {
        return next(createError.BadRequest("No timeline found for the team."));
      }

      res.status(200).json({
        message: "Team-specific timeline updated successfully.",
        team_id,
        start_date,
        end_date
      });
    });
  } catch (error) {
    next(error);
  }
});

// updates the deadline only for specific week -> not updated weekly log

// router.patch()


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

// updates the weekly deadlines for a specific team -> for a single week ->  did'not updated weekly logs
router.patch("/admin/update_deadline/:week/:team_id",(req,res,next) => {
  try{
    const{week,team_id} = req.params;
    let{newDeadline} = req.body;
    if(!week || !team_id || !newDeadline)return next(createError.BadGateway("week or team_id or newDeadline not found!"));
    // validating date and week
    newDeadline = new Date(newDeadline);
    let today = new Date();
    today.setHours(0,0,0,0) //removes the time
    newDeadline.setHours(0,0,0,0);
     const allowedWeeks = [
      "week_1", "week_2", "week_3", "week_4", "week_5",
      "week_6", "week_7", "week_8", "week_9", "week_10",
      "week_11", "week_12"
    ];
    if (!allowedWeeks.includes(week)) {
      return next(createError.BadRequest("Invalid week column name!"));
    }
    if(today > newDeadline)return next(createError.BadRequest("Invalid date!"));
    newDeadline = newDeadline.toISOString().split('T')[0];

    // checks if deadlines exists - both guide and expert should accepte request
    let sql1 = "select * from weekly_logs_deadlines where team_id = ?";
    db.query(sql1,[team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.BadRequest(`deadlines not exist!`)); 
      let sql = `update weekly_logs_deadlines set \`${week}\` = ? where team_id = ?`;
      db.query(sql,[newDeadline,team_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("some rows are not affected!"));
        res.status(200).json({"message":`${week} deadline updated to ${newDeadline}`});
      })
    })
  }
  catch(error)
  {
    next(error);
  }
})


module.exports = router;
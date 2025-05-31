const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const db = require("../db");
const userAuth = require("../middlewares/userAuth")

//210
//
router.post("/admin/adduser",userAuth,(req,res,next) => {
   try{
     const{name,emailId,password,role,dept,reg_num,phone_number,semester,mentor_name,mentor_reg_num,mentor_emailId} = req.body;
     if(!name || !emailId || !password || !role || !dept || !reg_num){ // not checking semester since it might be null other than students
      return next(createError.BadRequest("data is missing!"));
     }
     const normalRole = role.toLowerCase();
     const safeSemester = normalRole === "student" ? semester : null;
     const safePhone_number = phone_number ? phone_number : null;
     const validRoles = ['student','admin','staff'];
     if(!validRoles.includes(normalRole)){
       return next(createError.BadRequest("invalid role!"));
     }
     if (normalRole === "student") {
      let validSem = [5, 7];
      if (!validSem.includes(semester)) {
        return next(createError.BadRequest("Invalid semester for student!"));
      }
     }
     let sql = "insert into users(name,emailId,password,role,dept,reg_num,phone_number,semester) values(?,?,?,?,?,?,?,?)";
     const values = [name,emailId,password,normalRole,dept,reg_num,safePhone_number,safeSemester];
     db.query(sql,values,(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
        if(role == 'student')
        {
          if(!mentor_emailId || !mentor_name || !mentor_reg_num)return next(createError.BadRequest('mentor details are missing!'));
          // check if mentor exist
          let sql1 = "select * from users where role = 'staff' and reg_num = ? and name = ?";
          db.query(sql1,[mentor_reg_num,mentor_name],(error,check) => {
            if(error)return next(error);
            if(check.length === 0)return next(createError.NotFound('mentor not found!'));
            let sql2 = "insert into mentor_mentee (mentee_name,mentee_reg_num,mentee_emailId,mentee_sem,mentor_name,mentor_reg_num,mentor_emailId) values(?,?,?,?,?,?,?)";
            db.query(sql2,[name,reg_num,emailId,safeSemester,mentor_name,mentor_reg_num,mentor_emailId],(error,result) => {
              if(error)return next(error);
              if(result.affectedRows === 0)return next('some rows are not affected!');
              return res.send("user added successfully with mentor admin!");

            })
          })
        }
        else{
          res.send("user added successfully admin!");
        }
     })
   }
   catch(error)
   {
     next(error);
   }
})

// get project through project_id

// router.get("/admin/getproject_by_team_id/:project_id",userAuth,(req,res,next) => {
//   try{
//    const{project_id} = req.params;
//    if(!project_id)return next("project_id not found");
//    let sql = "select * from projects where project_id = ?";
//    db.query(sql,[project_id],(error,result) => {
//     if(error)return next(error);
//     return res.send(result);
//    })
//   }
//   catch(error)
//   {
//     next(error);
//   }
// })

// fetch users based on role

router.get("/admin/get_users/:role",userAuth,(req,res,next) => {
  try{
    const{role} = req.params;
    const validRoles = ['student','admin','staff'];
    const safeRole = role.toLowerCase();
    if (!validRoles.includes(safeRole)) {
      return next(createError.BadRequest("Invalid role!"))
    }
    let sql = "select * from users where role = ? and available = true";
    db.query(sql,[safeRole],(error,result) => {
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

router.delete("/admin/removeuser/:emailId/:reg_num/:role",userAuth,(req,res,next) => {
  try{
    const{emailId,reg_num,role} = req.params;
    if(!emailId || !reg_num || !role)return createError.BadRequest("parameters are misssing!");
    const validRoles = ['student','admin','staff'];
    const safeRole = role.toLowerCase();
    if(!validRoles.includes(safeRole))return next(createError.BadRequest("invalid role!"));
    let sql = "delete from users where emailId = ? and reg_num = ? and role = ?";
    db.query(sql,[emailId,reg_num,safeRole],(error,result) => {
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

router.post("/admin/addTimeLine",userAuth,(req,res,next) => {
  try{
    let{name,start_date,end_date} = req.body;
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

router.get("/admin/get_timelines",userAuth,(req,res,next) => {
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

router.delete("/admin/remove_timeline/:id",userAuth,(req,res,next) => {
  try{
    const{id} = req.params;
    if(!id)return next(createError.BadRequest("id not found!"));
    let sql = "delete from timeline where id = ?";
    db.query(sql,[id],(error,result) => {
      if (error) return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
      res.send(`${id}st timeline successfully deleted from timelines!`);
    })
  }
  catch(error)
  {
    next(error)
  }
})

// updates the whole timeline -> whole timeline (not team_specific)

router.patch("/admin/update_timeline_id/:id",userAuth,(req,res,next) => {
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

// updates whole timeline [team-specific]
router.patch("/admin/update_team_timeline/:team_id/:timelinename",userAuth, (req, res, next) => { 
  try {
    const { team_id,timelinename } = req.params;
    let { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return next(createError.BadRequest("Start and end dates are required."));
    }

    if(!team_id || !timelinename)return next(createError.BadRequest('some fields are missing!'))

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
      WHERE team_id = ? AND name = ?
    `;

    db.query(sql, [start_date, end_date, team_id], (error, result) => {
      if (error) return next(error);
      if (result.affectedRows === 0) {
        return next(createError.BadRequest("No timeline found for the team."));
      }

      res.status(200).json({
        message: "Team-specific timeline updated successfully.",
        "team_id":team_id,
        "start_date":start_date,
        "end_date":end_date
      });
    });
  } catch (error) {
    next(error);
  }
});


// updates the weekly deadlines for a specific team -> for a single week(all weeks wont be updated) ->  did'not updated weekly logs
router.patch("/admin/update_deadline/:week/:team_id",userAuth,(req,res,next) => {
  try{
    const{week,team_id} = req.params;
    let{newDeadline} = req.body;
    if(!week || !team_id || !newDeadline)return next(createError.BadRequest("week, team_id, or newDeadline is missing!"));
    // validating date and week
    newDeadline = new Date(newDeadline);
    let today = new Date();
    today.setHours(0,0,0,0) //removes the time
    newDeadline.setHours(0,0,0,0);
     const allowedWeeks = [
      "week1", "week2", "week3", "week4", "week5",
      "week6", "week7", "week8", "week9", "week10",
      "week11", "week12"
    ];
    if (!allowedWeeks.includes(week)) {
      return next(createError.BadRequest("Invalid week column name!"));
    }
    if(today > newDeadline)return next(createError.BadRequest("Invalid date!"));
    const year = newDeadline.getFullYear();
    const month = String(newDeadline.getMonth() + 1).padStart(2, '0');
    const day = String(newDeadline.getDate()).padStart(2, '0');
    newDeadline = `${year}-${month}-${day}`;

    // checks if deadlines exists -> to update
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

// // assign or update -> guide or expert for a paritcular team 
router.patch("/admin/assign_guide_expert/:team_id/:role", (req, res, next) => {
  try {
    const { team_id, role } = req.params;
    const { guideOrexpert_reg_num } = req.body;

    if (!team_id || !guideOrexpert_reg_num || !role) {
      return next(createError.BadRequest("Missing team_id, role, or registration number."));
    }

    const validRoles = ['sub_expert', 'guide'];
    if (!validRoles.includes(role)) {
      return next(createError.BadRequest("Invalid role!"));
    }
    
    // checks whether the person already acts as expert or mentor or guide for this particular team
    let checkSql = "SELECT * FROM teams WHERE team_id = ? AND (guide_reg_num = ? OR sub_expert_reg_num = ?)";
    db.query(checkSql,[team_id,guideOrexpert_reg_num,guideOrexpert_reg_num],(error,result) => {
      if(error)return next(error);
      if(result.length >= 1)return next(createError.BadRequest('This staff already acts as guide or expert or mentor for this particular team!'));
      //updating
      let updateSql = `update teams set ${role}_reg_num = ? where team_id = ?`;
      db.query(updateSql,[guideOrexpert_reg_num,team_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest('Reg_num not updated!'));
        res.send(`${team_id} teams ${role} has updated as ${guideOrexpert_reg_num}`);
      })  
    })
  } catch (error) {
    next(error);  
  }
});

// // gets all projects 

// router.get("/admin/get_all_projects", (req, res, next) => {
//   try {
//     let sql = "SELECT team_id FROM team_requests";
//     db.query(sql, (error, result) => {
//       if (error) return next(error);

//       if (result.length === 0) {
//         return next(createError.NotFound("project not found!"))
//       }

//       res.send(result);
//     });
//   } catch (error) {
//     next(error);

//   }
// });


module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");

// gets the request recevied by the expert

router.get("/expert/getrequests/:id",(req,res,next) => {
    try{
        let {id} = req.params;
        let sql = "select * from sub_expert_requests where to_id = ? and status = 'interested'";
        db.query(sql,[id],(error,result) => {
            if(error)return next(error);
            if(result.length == 0)res.send("No request found!");
            else{
                res.send(result);
            }
        })
    }
    catch(error)
    {
       next(error);
    }
})

// update status -> accept or reject // from id => project_id

router.patch("/expert/accept_reject/:status/:project_id/:my_id",(req,res,next) => {
    try{
      const {status,project_id,my_id} = req.params;
       // Validate status
      if (status !== "accept" && status !== "reject") 
      {
        return res.status(400).send("Invalid status");
      }
      // accepts || rejects
      let sql1 = "update sub_expert_requests set status = ? where to_id = ? and from_id = ? and status = 'interested'";
      db.query(sql1,[status,my_id,project_id],(error,result) => {
        if(error)return next(error);
        else{
            if(status == "accept")
            {
                // no of mentoring projects
                let sql2 = "select * from sub_expert_requests where to_id = ? and status = 'accept'"; // to_id -> logged_sub_expert_id
                db.query(sql2,[my_id],(error,result) => {
                    if(error)return next(error);
                    else{
                        const expertingTeams = result.length;
                        if(expertingTeams < 4)res.send("status updated successfully!");
                        else{
                            let sql3 = "delete from sub_experts where id = ?";
                            db.query(sql3,[my_id],(error,result) => {
                                if(error)return next(error);
                                else{
                                    let sql4 = "delete from sub_expert_requests where to_id = ? and status = 'interested'";
                                    db.query(sql4,[my_id],(error,result) => {
                                        if(error)return next(error);
                                        else{
                                            res.send("status updated successfully! by removing the expert from sub_experts and sub_expert_requests");
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
            
        }
      }) 
    }
    catch(error)
    {
      next(error);
    }
})

// adds new expert
router.post("/expert/add_sub_expert",(req,res,next) => {
    try{
       const {id,name,emailId,phone,dept} = req.body;
       if (!id || !name || !emailId || !phone || !dept)
       {
         return res.status(400).json({ message: "All fields are required" });
       }
       let sql = "insert into sub_experts(id, name, emailId, phone, dept) values (?,?,?,?,?)";
       db.query(sql,[id,name,emailId,phone,dept],(error,result) => {
        if(error)return next(error);
        else{
            res.send("sub_expert added to db!");
        }
       })
    }
    catch(error)
    {
       next(error);
    }
})

// sends request to expert
router.post("/expert/sent_request_to_expert",(req,res,next) => {
    try{
      const {id,name,emailId,phone,dept,from_id,to_id,status} = req.body;  // to details
      if (!id || !name || !emailId || !phone || !dept || !from_id || !to_id || !status) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let sql = "insert into sub_expert_requests values(?,?,?,?,?,?,?,?)";
      db.query(sql,[id,name,emailId,phone,dept,from_id,to_id,status],(error,result) => {
        if(error)return next(error);
        else{
            res.send("request sent successfully to the expert!");
        }
      })
    }
    catch(error)
    {
        next(error);
    }
})

// fetches team details, i am acting as the subject expert 
router.get("/sub_expert/fetch_teams/:expert_id",(req,res,next) => {
    try{
      const{expert_id} = req.params;
      if(!expert_id)
      {
        return next(createError.BadRequest("expert id not found!"));
    }
    let sql = "select * from sub_expert_requests where to_id = ? and status = 'accept'";
    db.query(sql,[expert_id],(error,result) => {
        if(error)return next(error);
        if(result.length == 0)res.send("No Teams found!");
        res.send(result);
    })
    }
    catch(error)
    {
       next(error);
    }
})

// adding review details in scheduled reviews
router.post("/sub_expert/add_review_details",(req,res,next) => {
    try{
      const{project_id,project_name,team_lead,review_date,start_time} = req.body;
      if(!project_id || !project_name || !team_lead || !review_date || !start_time)
      {
        return next(createError.BadRequest("data is missing!"));
      }
      let sql = "insert into scheduled_reviews(project_id,project_name,team_lead,review_date,start_time) values(?,?,?,?,?)";
      db.query(sql,[project_id,project_name,team_lead,review_date,start_time],(error,result) => {
        if(error) return next(error);
        res.send("review details added successfully!");
      })
    }
    catch(error)
    {
      next(error);
    }
})

// marks attendance
router.patch("/sub_expert/mark_attendance/:team_id",(req,res,send) => {
    try{
      const{team_id} = req.params;
      if(!team_id) return next(createError.BadRequest("team_id is missing!"));
      let sql = "update scheduled_reviews set attendance = 'present' where team_id = ?";
      db.query(sql,[team_id],(error,result) => {
        if(error) return next(error);
        res.send("attendance marked successfully!");
      })
    }
    catch(error)
    {
      next(error);
    }
})

// add marks and remarks
router.post("sub_expert/add_marks_remarks",(req,res,send) => {
  try{
    const{mark,remark} = req.body;
    if(!mark || !remark)
    {
      return next(createError.BadRequest("mark or remark missing!"));
    }
    let sql = "insert into scheduled_reviews(mark,remark) values(?,?)";
    db.query(sql,[mark,remark],(error,result,next) => {
      if(error)return next(error);
      res.send("marks and remarks added successfully!");
    })
  }
  catch(error)
  {
    next(error);
  }
})



module.exports = router;
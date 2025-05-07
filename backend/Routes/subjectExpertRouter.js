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
      db.query(sql,[id,name,emailId,phone,dept,from_id,to_id,status],(error,result,next) => {
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


module.exports = router;
const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const db = require("../db");

// gets the request recevied by the mentor

router.get("/guide/getrequests/:id",(req,res,next) => {
    try{
        let {id} = req.params;
        let sql = "select * from guide_requests where to_id = ? and status = 'interested'";
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

// update status -> accept or reject

router.patch("/guide/accept_reject/:status/:project_id/:my_id",(req,res,next) => {
    try{
      const {status,project_id,my_id} = req.params;
       // Validate status
      if (status !== "accept" && status !== "reject") 
      {
        return res.status(400).send("Invalid status");
      }
      // accepts || rejects
      let sql1 = "update guide_requests set status = ? where to_id = ? and from_id = ? and status = 'interested'";
      db.query(sql1,[status,my_id,project_id],(error,result) => {
        if(error)return next(error);
        else{
            if(status == "accept")
            {
                // no of mentoring projects
                let sql2 = "select * from guide_requests where to_id = ? and status = 'accept'"; // to_id -> logged_mentor_id
                db.query(sql2,[my_id],(error,result) => {
                    if(error)return next(error);
                    else{
                        const mentoringTeams = result.length;
                        if(mentoringTeams < 4)res.send("status updated successfully!");
                        else{
                            let sql3 = "delete from guides where id = ?";
                            db.query(sql3,[my_id],(error,result) => {
                                if(error)return next(error);
                                else{
                                    let sql4 = "delete from guide_requests where to_id = ? and status = 'interested'";
                                    db.query(sql4,[my_id],(error,result) => {
                                        if(error)return next(error);
                                        else{
                                            res.send("status updated successfully! by removing the guide from guides and guide_requests");
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

// adds new guide
router.post("/guide/add_guide",(req,res,next) => {
    try{
       const {id,name,emailId,phone,dept} = req.body;
       if (!id || !name || !emailId || !phone || !dept)
       {
         return res.status(400).json({ message: "All fields are required" });
       }
       let sql = "insert into guides(id, name, emailId, phone, dept) values (?,?,?,?,?)";
       db.query(sql,[id,name,emailId,phone,dept],(error,result) => {
        if(error)return next(error);
        else{
            res.send("Guide added to db!");
        }
       })
    }
    catch(error)
    {
       next(error);
    }
})

// sends request to guide
router.post("/guide/sent_request_to_guide",(req,res,next) => {
    try{
      const {id,name,emailId,phone,dept,from_id,to_id,status} = req.body;  // to details
      if (!id || !name || !emailId || !phone || !dept || !from_id || !to_id || !status) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let sql = "insert into guide_requests values(?,?,?,?,?,?,?,?)";
      db.query(sql,[id,name,emailId,phone,dept,from_id,to_id,status],(error,result,next) => {
        if(error)return next(error);
        else{
            res.send("request sent successfully to the guide!");
        }
      })
    }
    catch(error)
    {
        next(error);
    }
})

module.exports = router;
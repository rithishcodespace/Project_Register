const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const nodeMailer = require("nodemailer");
const db = require("../db");

// gets the request recevied by the mentor

router.get("/guide/getrequests/:id",(req,res,next) => {
    try{
        let {id} = req.params;
        let sql = "select * from guide_requests where to_id = ? and status = 'interested'";
        db.query(sql,[id],(error,result) => {
            if(error)return next(error);
            if(result.length == 0)res.send("No request` found!");
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

// sends request to guide
router.post("/guide/sent_request_to_guide",(req,res,next) => {
    try{
      const {id,name,emailId,phone,dept,from_id,to_id,status} = req.body;  // to details
      if (!id || !name || !emailId || !phone || !dept || !from_id || !to_id || !status) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let sql = "insert into guide_requests values(?,?,?,?,?,?,?,?)";
      db.query(sql,[id,name,emailId,phone,dept,from_id,to_id,status],(error,result) => {
        if(error)return next(error);

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'rithishvkv@gmail.com', // -> temporary
            pass: 'ncwbsvgspuplvzzr',
            },
        });

        // Define email options
        const mailOptions = {
            from: 'rithishvkv@gmail.com',
            to: "guides.cs24@bitsathy.ac.in", // guide id -> temporary
            subject: 'Request To Accept Invite',
            text: `Dear Guide,\n\n${name} has requested you to be their guide. Please login to the system to accept or reject the request.\n\nThank you.`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            return console.log('Error:', error);
            }
            console.log('Email sent:', info.response);
        });
        
        res.send("request sent successfully to the guide!");
        
      })
    }
    catch(error)
    {
        next(error);
    }
})

// adds reply to the query

router.patch("/guide/add_reply/:query_id",(req,res,next) => { // after 100 deletes old one
    try{
      const{reply} = req.body;
      const{query_id} = req.params;
      if(!reply) return next(createError.BadRequest("reply not found!"));
      let sql = "UPDATE queries SET reply = ? WHERE query_id = ?;";
      db.query(sql,[reply,query_id],(error,result) => {
        if(error)return next(error);
        res.send("reply added successfully!");
      })
    }
    catch(error)
    {
      next(error);
    }
})

// fecthes the queries received
router.get("/guide/get_queries",(req,res,next) => {
    try{
      let sql = "select * from queries";
      db.query(sql,(error,result) => {
        if(error)return next(error);
        if(result.length == 0)res.send("No queries found!");
        res.send(result);
      })
    }
    catch(error)
    {
       next(error);
    }
})

// fetches team details mentored by me 
router.get("/guide/fetch_mentoring_teams/:guide_id",(req,res,next) => {
    try{
      const{guide_id} = req.params;
      if(!guide_id)
      {
        return next(createError.BadRequest("guide id not found!"));
    }
    let sql = "select * from guide_requests where to_id = ? and status = 'accept'";
    db.query(sql,[guide_id],(error,result) => {
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


module.exports = router;
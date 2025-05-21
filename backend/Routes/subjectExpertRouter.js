const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");
const nodemailer = require("nodemailer")

// gets the request recevied by the expert

router.get("/expert/getrequests/:reg_num",(req,res,next) => {
    try{
        let {reg_num} = req.params;
        let sql = "select * from sub_expert_requests where to_expert_reg_num = ? and status = 'interested'";
        db.query(sql,[reg_num],(error,result) => {
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
router.patch("/sub_expert/accept_reject/:status/:team_id/:my_id", (req, res, next) => {
  try {
    const { status, team_id, my_id } = req.params;
    // Validate status
    if (status !== "accept" && status !== "reject") {
      return res.status(400).send("Invalid status");
    }

    // Update status in guide_requests table based on the action
    let sql1 = "UPDATE sub_expert_requests SET status = ? WHERE to_expert_reg_num = ? AND from_team_id = ? AND status = 'interested'";
    db.query(sql1, [status, my_id, team_id], (error, result) => {
      if (error) return next(error);
      if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
      else {
        if (status === "accept") {
          // Check the number of accepted mentoring projects
          let sql2 = "SELECT * FROM sub_expert_requests WHERE to_expert_reg_num = ? AND status = 'accept'";
          db.query(sql2, [my_id], (error, result) => {
            if (error) return next(error);
            else {
              const mentoringTeams = result.length;
              if (mentoringTeams < 4) {
                // After accepting the request, update the expert in team_requests
                let sql3 = "UPDATE team_requests SET sub_expert_reg_num = ? WHERE team_id = ?";
                db.query(sql3, [my_id, team_id], (error, result) => {
                  if (error) return next(error);
                  if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
                  else {
                    res.send("Status updated successfully and guide assigned!");
                  }
                });
              } else {
                // If the expert already has 4 projects,  delete pending request and make him unavilable
                let sql4 = "update users set available = false where reg_num = ?";
                db.query(sql4, [my_id], (error, result) => {
                  if (error) return next(error);
                  if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
                  else {
                    let sql5 = "DELETE FROM sub_expert_requests WHERE to_expert_reg_num = ? AND status = 'interested'";
                    db.query(sql5, [my_id], (error, result) => {
                      if (error) return next(error);
                      else {
                        res.send("Status updated successfully by removing the expert from guides and guide_requests");
                      }
                    });
                  }
                });
              }
            }
          });
        } else if (status === "reject") {
          // Handle rejection: status already updated in sub_expert_requests
          res.send(`${team_id} rejected successfully!`)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// sends request to expert

router.post("/sub_expert/sent_request_to_expert", (req, res, next) => {
    try {
        const { from_team_id, project_id, project_name, to_expert_reg_num } = req.body;
        if (!from_team_id || !project_id || !project_name || !Array.isArray(to_expert_reg_num) || to_expert_reg_num.length == 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rithishvkv@gmail.com', // -> temporary
                pass: 'ncwbsvgspuplvzzr',
            },
        });

        let errorOccured = false;
        let completedRequests = 0;

        for (let i = 0; i < to_expert_reg_num.length; i++) {
            let sql = "insert into sub_expert_requests (from_team_id, project_id, project_name, to_expert_reg_num) values (?,?,?,?)";
            db.query(sql, [from_team_id, project_id, project_name, to_expert_reg_num[i]], (dbError, result) => {
                if (dbError) {
                    console.error(`DATABASE ERROR: ${dbError}`);
                    errorOccured = true;
                }
                else if(!result || result.affectedRows === 0){
                  console.error(`No rows inserted for guide ${to_expert_reg_num[i]}`);
                  errorOccured = true;
                }
                else {
                    // Define email options
                    const mailOptions = {
                        from: 'rithishvkv@gmail.com',
                        to: "guides.cs24@bitsathy.ac.in", // guide id -> temporary
                        subject: 'Request To Accept Invite',
                        text: `Dear Expert,\n\n${from_team_id} team has requested you to be their expert. Please login to the system to accept or reject the request.\n\nThank you.`,
                    };

                    // Send the email
                    transporter.sendMail(mailOptions, (emailError, info) => {
                        if (emailError) {
                            console.error('Email Error:', emailError);
                            errorOccured = true;
                        } else {
                            console.log('Email sent:', info.response);
                        }

                        // Increment after both DB and Email are done
                        completedRequests++;
                        if (completedRequests === to_expert_reg_num.length) {
                            if (errorOccured) {
                                res.status(500).json({ "message": "Some request failed, check logs!!" });
                            } else {
                                res.send("Request sent successfully to the guide!");
                            }
                        }
                    });
                }
            });
        }
    } catch (error) {
        next(error);
    }
});


// fetches team details, i am acting as the subject expert

router.get("/sub_expert/fetch_teams/:expert_id",(req,res,next) => {
    try{
      const{expert_id} = req.params;
      if(!expert_id)
      {
        return next(createError.BadRequest("expert id not found!"));
    }
    let sql = "select * from sub_expert_requests where to_expert_reg_num = ? and status = 'accept'";
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

// fetching the review requests sent by teams

router.get("/sub_expert/fetch_review_requests/:expert_id",(req,res,next) => {
  try{

  }
  catch(error){
    next(error);
  }
})

// fetching the upcoming reviews -> mark attendence page

router.get("/sub_expert/fetch_upcoming_reviews/:expert_reg_num",(req,res,next) => {
  try{
    const{expert_reg_num} = req.params;
    if(!expert_reg_num)return next(createError.BadRequest("expert reg num missing!"));
    let sql = "SELECT * FROM scheduled_reviews WHERE expert_reg_num = ? AND review_date >= CURRENT_DATE AND attendence IS NULL";
    db.query(sql,[expert_reg_num],(error,result) => {
      if(error)return next(error);
      return res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// conforming the review request by student

router.post("/sub_expert/add_review_details/:request_id/:status",(req,res,next) => {
    try{
      const{project_id,project_name,team_lead,review_date,start_time,venue} = req.body;
      const{request_id,status} = req.params;
      if(!project_id || !project_name || !team_lead || !review_date || !start_time || !venue || !request_id || !status)
      {
        return next(createError.BadRequest("data is missing!"));
      }
      // updating status
      let updatequery = "UPDATE review_requests SET status = ? WHERE request_id = ?";
      db.query(updatequery,[status,request_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("some rows not affected!"));
        if(status === 'accept')
        {
          // inserting into scheduled reivews
          let sql = "insert into scheduled_reviews(project_id,project_name,team_lead,review_date,start_time,venue) values(?,?,?,?,?,?)";
          db.query(sql,[project_id,project_name,team_lead,review_date,start_time,venue],(error,result) => {
            if(error) return next(error);
            if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
            // removing request from the review requests
            let sql1 = "delete from review_requests where request_id = ?";
            db.query(sql1,[request_id],(error,result)=>{
              if(error)return next(error);
              return res.send(`${request_id} :- ${status}ed successfully and inserted into the scheduled reviews`);
            })
          })
        }
        else if(status == 'reject')
        {
          return res.send(`${request_id} :- ${status}ed successfully`)
        }
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
        if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
        res.send("attendance marked successfully!");
      })
    }
    catch(error)
    {
      next(error);
    }
})

// add marks and remarks
router.post("sub_expert/add_marks_remarks/:team_id",(req,res,send) => {
  try{
    const{mark,remark} = req.body;
    const{team_id} = req.params;
    if(!mark || !remark || !team_id)
    {
      return next(createError.BadRequest("mark or remark or team_id missing!"));
    }
    let sql = "insert into scheduled_reviews(mark,remark) values(?,?) where team_id = ?";
    db.query(sql,[mark,remark,team_id],(error,result,next) => {
      if(error)return next(error);
      if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
      res.send("marks and remarks added successfully!");
    })
  }
  catch(error)
  {
    next(error);
  }
})



module.exports = router;
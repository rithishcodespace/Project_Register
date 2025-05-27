const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");
const nodemailer = require("nodemailer");
const userAuth = require("../middlewares/userAuth");

// gets the request recevied by the expert

router.get("/expert/getrequests/:reg_num",userAuth,(req,res,next) => {
    try{
        let {reg_num} = req.params;
        if(!reg_num)return next(createError.BadRequest('reg_num is not defined!'));
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
// my_id -> expert reg_num
router.patch("/sub_expert/accept_reject/:status/:team_id/:semester/:my_id",userAuth, (req, res, next) => {
  try {
    const { status, team_id, my_id, semester } = req.params;
    const {reason} = req.body;
    // Validate status
    if (status !== "accept" && status !== "reject") {
      return res.status(400).send("Invalid status");
    }

    if(!team_id || !my_id || !semester || !reason)return next(createError.BadRequest("data is missing!"));

    // checks whether he acts as guide or mentor to that particular team
    let sql0 = "SELECT * FROM guide_requests WHERE to_guide_reg_num = ? AND from_team_id = ? AND status = 'accept' UNION SELECT * FROM mentor_requests WHERE to_mentor_reg_num = ? AND from_team_id = ? AND status = 'accept';"
    db.query(sql0,[my_id,team_id,my_id,team_id],(error,my_teams) => {
      if(error)return next(error);
      if(my_teams.length > 0)return next(createError.BadRequest('Your are already acting as guide or mentor to this team, so you cant accept or reject this request!'));

      // Update status in guide_requests table based on the action
      let sql1 = "UPDATE sub_expert_requests SET status = ? WHERE to_expert_reg_num = ? AND from_team_id = ? AND status = 'interested'";
      db.query(sql1, [status, my_id, team_id], (error, result) => {
        if (error) return next(error);
        if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
        else {
          if (status === "accept") {
            // Check the number of accepted experting projects
            let sql2 = "SELECT * FROM sub_expert_requests WHERE to_expert_reg_num = ? AND status = 'accept' and team_semester = ?";
            db.query(sql2, [my_id,semester], (error, result) => {
              if (error) return next(error);
              else {
                const mentoringTeams = result.length;
                if (mentoringTeams <= 3) {
                  // After accepting the request, update the expert in teams table
                  let sql3 = "UPDATE teams SET sub_expert_reg_num = ? WHERE team_id = ?";
                  db.query(sql3, [my_id, team_id], (error, result) => {
                    if (error) return next(error);
                    if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
                    else {
                      res.send("Status updated successfully and guide assigned!");
                    }
                  });
                } else {
                  // If the expert already has 3 projects,  delete pending request and make him unavilable
                  let sql4 = "update users set available = false where reg_num = ? and role = 'staff'";
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
            let rejectSql = "update sub_expert_requests set reason = ? where team_id = ?";
            db.query(rejectSql,[reason,team_id],(error,result) => {
              if(error)return next(error);
              if(result.affectedRows === 0)return next(createError.BadRequest('reason not updated in requests table!'));
              res.send(`${team_id} rejected successfully!`)
            })
          }
        }
      });
  
    })

    } catch (error) {
    next(error);
  }
});

// sends request to expert

router.post("/sub_expert/sent_request_to_expert",userAuth, (req, res, next) => {
      try {
        const { semester } = req.params;
        const { from_team_id, project_id, project_name, to_expert_reg_num } = req.body;
    
        if (!from_team_id || !project_id || !project_name || !Array.isArray(to_expert_reg_num) || to_expert_reg_num.length === 0 || !semester || (semester != 5 && semester != 7)) {
          return res.status(400).json({ message: "Some fields are required" });
        }
    
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
        });
    
        let validExperts = [];
        let checked = 0;
    
        to_expert_reg_num.forEach((expertRegNum, idx) => {
          let checkSql = "SELECT team_semester FROM sub_expert_requests WHERE to_expert_reg_num = ? AND status = 'accept'";
          db.query(checkSql, [expertRegNum], (error, results) => {
            if (error) return next(error);
    
            let s5 = 0, s7 = 0;
            for (let r of results) {
              if (r.team_semester === 5) s5++;
              else if (r.team_semester === 7) s7++;
            }
    
            if ((semester == 5 && s5 < 3) || (semester == 7 && s7 < 3)) {
              validExperts.push(expertRegNum);
            }
    
            checked++; // runs on last index
            if (checked === to_expert_reg_num.length) {
              // All guides checked, now proceed to insert requests
              if (validExperts.length === 0) {
                return res.status(400).json({ message: "No eligible guides found" });
              }
    
              let completed = 0;
              let errors = false;
    
              validExperts.forEach((expert) => {
                const insertSql = "INSERT INTO sub_expert_requests (from_team_id, project_id, project_name, to_expert_reg_num,team_semester) VALUES (?, ?, ?, ?)";
                db.query(insertSql, [from_team_id, project_id, project_name, expert,semester], (error, insertResult) => {
                  if (error || insertResult.affectedRows === 0) {
                    console.error("Insert failed for:", expert, error || "No rows inserted");
                    errors = true;
                  }
    
                  let emailQuery = "SELECT emailId FROM users WHERE reg_num = ? AND role = 'staff'";
                  db.query(emailQuery, [expert], (error, emailResult) => {
                    if (error || emailResult.length === 0) {
                      console.error("Email not found for:", expert);
                      errors = true;
                      checkComplete();
                    } else {
                      const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: emailResult[0].emailId,
                        subject: 'Request To Accept Invite',
                        text: `Dear Expert,\n\n${from_team_id} team has requested you to be their sub_expert. Please login to the system to accept or reject the request.\n\nThank you.`,
                      };
    
                      transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                          console.error("Email failed:", err);
                          errors = true;
                        }
                        checkComplete();
                      });
                    }
                  });
    
                  function checkComplete() {
                    completed++;
                    if (completed === validExperts.length) {
                      if (errors) {
                        return res.status(500).json({ message: "Some requests or emails failed." });
                      } else {
                        return res.send("Requests sent successfully to all eligible expert");
                      }
                    }
                  }
                });
              });
            }
          });
        });
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

router.get("/sub_expert/fetch_review_requests/:expert_reg_num",userAuth,(req,res,next) => {
  try{
    const{expert_reg_num} = req.params;
    if(!expert_reg_num)return next(createError.BadRequest("expert id is undefined!"));
    let sql = "select * from review_requests where expert_reg_num = ? and status = 'interested'";
    db.query(sql,[expert_reg_num],(error,result) => {
      if(error)return next(error);
      return res.send(result);
    })
  }
  catch(error){
    next(error);
  }
})


// fetching the upcoming reviews -> mark attendence page

router.get("/sub_expert/fetch_upcoming_reviews/:expert_reg_num",userAuth,(req,res,next) => {
  try{
    const{expert_reg_num} = req.params;
    if(!expert_reg_num)return next(createError.BadRequest("expert reg num missing!"));
    let sql = "SELECT * FROM scheduled_reviews WHERE expert_reg_num = ? AND review_date >= CURRENT_DATE AND attendance IS NULL";
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

router.post("/sub_expert/add_review_details/:request_id/:status/:expert_reg_num/:team_id",userAuth,(req,res,next) => {
    try{
      const{project_id,project_name,team_lead,review_date,start_time} = req.body;
      const{request_id,status,expert_reg_num,team_id} = req.params;
      if(!project_id || !project_name || !team_lead || !review_date || !expert_reg_num || !start_time || !request_id || !status || !team_id)
      {
        return next(createError.BadRequest("data is missing!"));
      }
      const safeStatus = status.toLowerCase();
      const validStatus = ['accept','reject'];
      if(!validStatus.includes(safeStatus))return next(createError.BadRequest('invalid status!'));
      // updating status
      let updatequery = "UPDATE review_requests SET expert_status = ? WHERE request_id = ?";
      db.query(updatequery,[safeStatus,request_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("some rows not affected!"));
        if(safeStatus === 'accept')
        {
          //checking whether guide accepted the review request
          let sql1 = "select guide_status,guide_reg_num from review_requests where request_id = ?";
          db.query(sql1,[request_id],(error,result) => {
            if(error)return next(error);
            if(result.length === 0)return next(createError.BadRequest('guide status not found!'));
            if (result[0].guide_status !== 'accept') {
              return res.send('Expert accepted, but guide has not yet accepted the request!');
            }
            const guide_reg_num = result[0].guide_reg_num;

            // inserting into scheduled reivews
            let sql = "insert into scheduled_reviews(project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id) values(?,?,?,?,?,?,?,?)";
            db.query(sql,[project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id],(error,result) => {
              if(error) return next(error);
              if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
              // removing request from the review requests
              let sql1 = "delete from review_requests where request_id = ?";
              db.query(sql1,[request_id],(error,result)=>{
                if(error)return next(error);
                return res.send(`${request_id} :- ${status}ed successfully and inserted into the scheduled reviews`);
              })
            })
            })
        }
        else if(safeStatus == 'reject')
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
// router.patch("/sub_expert/mark_attendance/:team_id",userAuth,(req,res,send) => {
//     try{
//       const{team_id} = req.params;
//       if(!team_id) return next(createError.BadRequest("team_id is missing!"));
//       let sql = "update scheduled_reviews set attendance = 'present' where team_id = ?";
//       db.query(sql,[team_id],(error,result) => {
//         if(error) return next(error);
//         if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
//         res.send("attendance marked successfully!");
//       })
//     }
//     catch(error)
//     {
//       next(error);
//     }
// })


// adds detaied marks to rubix -> also inserts total mark for the review guide_mark and expert_mark to the scheduled_Review table
// reivew no -> 1 or 2 -> get from input tag
router.post("/sub_expert/add_review_marks_rubix/:team_id/:review_id", userAuth, (req, res, next) => {
  try {
    const { team_id,review_id } = req.params;
    const {review_no,review_date,expert_literature_survey,expert_aim,expert_scope,expert_need_for_study,expert_proposed_methodology,expert_work_plan,expert_oral_presentation,expert_viva_voce_and_ppt,expert_contributions,expert_remark} = req.body;

    if (!review_no || !review_id || !review_date || !literature_survey || !aim || !scope || !need_for_study || !proposed_methodology || !work_plan || !oral_presentation || !viva_voce_and_ppt || !contributions || !remark) {
      return next(createError.BadRequest('Data not found!'));
    }
    if (!team_id) return next(createError.BadRequest("Team_id is null!"));
    if (review_no > 3 || review_no < 1) return next(createError.BadRequest('invalid review month!'));

    let sql = "select * from review_marks where team_id = ? and review_no = ?";
    db.query(sql, [team_id, review_no], (error, result) => {
      if (error) return next(error);
      if (result.length > 0) return next(createError.BadRequest("Review marks already updated!"));

      let sql1 = "select * from weekly_logs_verification where team_id = ?";
      db.query(sql1, [team_id], (error, result) => {
        if (error) return next(error);
        let g_marks = 0;
        for (let i = 1; i <= 4 * review_no; i++) {
          const row = result.find(r => r.week_number == i && r.is_verified);
          if (row) g_marks += 10;
        }

        let e_marks = 0;
        markFields = [literature_survey, aim, scope, need_for_study, proposed_methodology, work_plan, oral_presentation, viva_voce_and_ppt, contributions];
        for (let j = 0; j < 9; j++) {
          e_marks += parseInt(markFields[j], 10);
        }

        let sql2 = "insert into review_marks (review_no,review_date,team_id,literature_survey,aim,scope,need_for_study,proposed_methodology,work_plan,oral_presentation,viva_voce_and_ppt,contributions,total_expert_marks,total_guide_marks) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        db.query(sql2, [review_no, review_date, team_id, literature_survey, aim, scope, need_for_study, proposed_methodology, work_plan, oral_presentation, viva_voce_and_ppt, contributions, e_marks, g_marks], (error, result) => {
          if (error) return next(error);
          if (result.affectedRows === 0) return next('some rows not affected!');
          let mark = e_marks + g_marks;
          let sql3 = "update scheduled_reviews set remark = ?, mark = ? where team_id = ? and review_id = ?";
          db.query(sql3,[remark,mark,team_id,review_id],(error,result) => {
            if(error)return next(error);
            if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
            res.send("marks and remarks added successfully!");
          })
        });
      });
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
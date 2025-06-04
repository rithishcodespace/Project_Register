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
    let sql0 = "SELECT * FROM guide_requests WHERE to_guide_reg_num = ? AND from_team_id = ? AND status = 'accept' UNION SELECT * FROM expert_requests WHERE to_expert_reg_num = ? AND from_team_id = ? AND status = 'accept';"
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

router.post("/sub_expert/sent_request_to_expert/:semester",userAuth, (req, res, next) => {
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
                const insertSql = "INSERT INTO sub_expert_requests (from_team_id, project_id, project_name, to_expert_reg_num,team_semester) VALUES (?, ?, ?, ?, ?  )";
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
        if(result.length == 0) return res.send("No Teams found!");
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
    let sql = "select * from review_requests where expert_reg_num = ? and expert_status = 'interested'";
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
      const{project_id,project_name,team_lead,review_date,start_time,review_no,reason} = req.body;
      const{request_id,status,expert_reg_num,team_id} = req.params;
      if(!project_id || !project_name || !team_lead || !review_date || !expert_reg_num || !start_time || !request_id || !status || !team_id || !review_no)
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
            let sql = "insert into scheduled_reviews(project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id,review_no) values(?,?,?,?,?,?,?,?,?)";
            db.query(sql,[project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id,review_no],(error,result) => {
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
          if(!reason)return next(createError.BadRequest('reason not found!'));
          let rejectSql = "update review_requests set expert_reason = ? where request_id = ?";
          db.query(rejectSql,[reason,request_id],(error,result) => {
            if(error)return next(error);
            if(result.affectedRows === 0)return next(createError.BadRequest('some rows not got affected'));
            return res.send(`${request_id} :- ${status}ed successfully`)

          })
        }
      })
    }
    catch(error)
    {
      next(error);
    }
})

// adds marks for an individual person

router.post('/guide/review/add_marks_to_individual/:expert_reg_num/:reg_num',(req,res,next) => {
  try{
    const{expert_reg_num,reg_num} = req.params;
    const{team_id,review_title,review_date,expert_oral_presentation,expert_viva_voce_and_ppt,expert_contributions,expert_guide_marks,expert_remarks} = req.body;
    if(!review_title || !review_date || !expert_reg_num || !reg_num || !team_id)return next(createError.BadRequest('guide register number or student register number is missing!'));
    if(!expert_oral_presentation || !expert_viva_voce_and_ppt || !expert_contributions || !expert_guide_marks || !expert_remarks){
      return next(createError.BadRequest('data is missing!'));
    }

    const validReview_titles = ['1st_review', '2nd_review', 'optional_review'];
    if (!validReview_titles.includes(review_title)){
      return next(createError.BadRequest('Invalid review title!'));
    }

    const reviewDate = new Date(review_date);
    const currentDate = new Date();
    const diffInMs = currentDate - reviewDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays > 6) {
      return next(createError.Forbidden('Marks can only be entered within 6 days after the review.'));
    }
    
    // check if already added
    const checkSql = "SELECT * FROM review_marks_individual WHERE team_id = ? AND review_date = ? AND review_title = ? and expert_reg_num = ?";
    db.query(checkSql, [team_id, review_date, review_title,expert_reg_num], (error, Checkresult) => {
    if (error) return next(error);
    if (Checkresult.length > 0 && Checkresult[0].total_expert_marks !== null) {
      return next(createError.BadRequest("Review marks already updated!"));
    }

     const total_expert_marks = parseInt(expert_oral_presentation) + parseInt(expert_viva_voce_and_ppt) + parseInt(expert_contributions)

    const fetchGuideSql = `SELECT * FROM review_marks_individual WHERE review_title = ? AND review_date = ? AND team_id = ? and expert_reg_num = ?`;
    db.query(fetchGuideSql, [review_title, review_date, team_id,expert_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.length === 0) {
          // not present so insert
          const insertSql = "insert into review_marks_individual (review_title,review_date,team_id, expert_oral_presentation,expert_viva_voce_and_ppt,expert_contributions,total_marks,total_expert_marks,expert_remarks) values (?,?,?,?,?,?,?,?,?)";
          const values = [
          review_title,
          review_date,
          team_id,
          expert_oral_presentation,
          expert_viva_voce_and_ppt,
          expert_contributions,
          total_expert_marks,
          total_expert_marks, // since we are inserting no guide mark present
          expert_remarks,
        ];
        db.query(insertSql,values,(error,result) => {
          if(error)return next(error);
          if(result.affectedRows === 0)return next(createError.InternalServerError("Failed to insert review marks."));
          return res.send({ message: "expert marks updated successfully!", total_marks: total_expert_marks });
        })
        return;
      }
      const total_guide_marks = result[0].total_guide_marks || 0;
      const total_marks = total_guide_marks + total_expert_marks;

      const updateSql = `
        UPDATE review_marks_team SET
          expert_oral_presentation = ?,
          expert_viva_voce_and_ppt = ?,
          expert_contributions = ?,
          total_expert_marks = ?,
          total_marks = ?,
          expert_remarks = ?
        WHERE review_title = ? AND review_date = ? AND team_id = ? and expert_reg_num = ?
      `;

      const values = [
        expert_oral_presentation,
        expert_viva_voce_and_ppt,
        expert_contributions,
        total_expert_marks,
        total_expert_marks,
        total_marks,
        expert_remarks,
        review_title,
        review_date,
        team_id,
        expert_reg_num
      ];

      db.query(updateSql, values, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
          return next(createError.BadRequest("No matching record found to update."));
        }

        res.send({ message: "Expert marks updated successfully!", total_marks });
      });
    })
  })
  }
  catch(error)
  {
    next(error);
  }
})


// marks attendance -> can be marked withing two days of the review
router.patch("/sub_expert/mark_attendance/:review_id",userAuth,(req,res,next) => {
    try{
      const{review_id} = req.params;
      if(!review_id) return next(createError.BadRequest("review_id is missing!"));
      // validating 2 days
      let sql0 = "select review_date from scheduled_reviews where review_id = ?";
      db.query(sql0,[review_id],(error0,result0) => {
        if(error0)return next(error0);
        if(result0.length === 0)return next(createError.NotFound('review_Date not found!'));
        const review_date = new Date(result0[0].review_date);
        const today = new Date();

        review_date.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        const diffInDays = (today - review_date) / (1000 * 60 * 60 * 24); // convert ms to days

        if (diffInDays > 2) return next(createError.BadRequest('Mark attendance time limit exceeded!'));
        let sql = "update scheduled_reviews set attendance = 'present' where review_id = ?";
        db.query(sql,[review_id],(error,result) => {
          if(error) return next(error);
          if(result.affectedRows === 0)return next(createError.BadRequest("no rows got affected!"));
          res.send("attendance marked successfully!");
        })
      })
    }
    catch(error)
    {
      next(error);
    }
})


// adds detaied marks to rubix -> also inserts total mark for the review guide_mark and expert_mark to the scheduled_Review table
// reivew no -> 1 or 2 -> get from input tag
router.post("/expert/review/add_team_marks/:expert_reg_num", userAuth, (req, res, next) => {
  const {expert_reg_num} = req.params;
  const {
    review_title,
    review_date,
    team_id,
    expert_literature_survey,
    expert_aim,
    expert_scope,
    expert_need_for_study,
    expert_proposed_methodology,
    expert_work_plan,
    expert_remarks
  } = req.body;


  if (
    !review_title || !review_date || !team_id ||
    expert_reg_num == null ||
    expert_literature_survey == null ||
    expert_aim == null ||
    expert_scope == null ||
    expert_need_for_study == null ||
    expert_proposed_methodology == null ||
    expert_work_plan == null ||
    expert_remarks == null)
    {return next(createError.BadRequest("Missing required fields!"));
  }

  const validReview_titles = ['1st_review', '2nd_review', 'optional_review'];
  if (!validReview_titles.includes(review_title))
    return next(createError.BadRequest('Invalid review title!'));

  // marks can be entered within 6 days
  const reviewDate = new Date(review_date);
  const currentDate = new Date();
  const diffInMs = currentDate - reviewDate;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  if (diffInDays > 6) {
    return next(createError.Forbidden('Marks can only be entered within 6 days after the review.'));
  }

  // Check if already added
  const checkSql = "SELECT * FROM review_marks_team WHERE team_id = ? AND review_date = ? AND review_title = ? and expert_reg_num = ?";
  db.query(checkSql, [team_id, review_date, review_title,expert_reg_num], (error, Checkresult) => {
    if (error) return next(error);
    if (Checkresult.length > 0 && Checkresult[0].total_expert_marks !== null) {
      return next(createError.BadRequest("Review marks already updated!"));
    }

    const total_expert_marks =
      parseInt(expert_literature_survey) +
      parseInt(expert_aim) +
      parseInt(expert_scope) +
      parseInt(expert_need_for_study) +
      parseInt(expert_proposed_methodology) +
      parseInt(expert_work_plan);

    const fetchGuideSql = `SELECT * FROM review_marks_team WHERE review_title = ? AND review_date = ? AND team_id = ? and expert_reg_num = ?`;

    db.query(fetchGuideSql, [review_title, review_date, team_id,expert_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.length === 0) {
          // not present so insert
          const insertSql = "insert into review_marks_team (review_title,review_date,team_id,expert_literature_survey,expert_aim,expert_scope,expert_need_for_study, expert_proposed_methodology,expert_work_plan,total_marks,total_expert_marks,expert_remarks) values (?,?,?,?,?,?,?,?,?,?,?,?)";
          const values = [
          review_title,
          review_date,
          team_id,
          expert_literature_survey,
          expert_aim,
          expert_scope,
          expert_need_for_study,
          expert_proposed_methodology,
          expert_work_plan,
          total_expert_marks,
          total_expert_marks, // since we are inserting no guide mark present
          expert_remarks,
        ];
        db.query(insertSql,values,(error,result) => {
          if(error)return next(error);
          if(result.affectedRows === 0)return next(createError.InternalServerError("Failed to insert review marks."));
          return res.send({ message: "Expert marks updated successfully!", total_marks: total_expert_marks });
        })
        return;
      }

      const total_guide_marks = result[0].total_guide_marks || 0;
      const total_marks = total_guide_marks + total_expert_marks;

      const updateSql = `
        UPDATE review_marks_team SET
          expert_literature_survey = ?,
          expert_aim = ?,
          expert_scope = ?,
          expert_need_for_study = ?,
          expert_proposed_methodology = ?,
          expert_work_plan = ?,
          total_expert_marks = ?,
          total_marks = ?,
          expert_remarks = ?
        WHERE review_title = ? AND review_date = ? AND team_id = ?
      `;

      const values = [
        expert_literature_survey,
        expert_aim,
        expert_scope,
        expert_need_for_study,
        expert_proposed_methodology,
        expert_work_plan,
        total_expert_marks,
        total_marks,
        expert_remarks,
        review_title,
        review_date,
        team_id
      ];

      db.query(updateSql, values, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
          return next(createError.BadRequest("No matching record found to update."));
        }

        res.send({ message: "Expert marks updated successfully!", total_marks });
      });
    });
  });
});


// meeting links

router.post('/expert/add_meeting_link/:expert_reg_num/:team_id/:review_no', (req, res, next) => {
  try {
    const { meetingLink, platform, scheduled_at } = req.body;
    const { expert_reg_num, team_id, review_no } = req.params;

    if (!meetingLink || !platform || !expert_reg_num || !team_id || !review_no || !scheduled_at)
      return next(createError.BadRequest('Data is missing!'));

    const sql = 'SELECT * FROM meeting_links WHERE team_id = ? AND review_no = ? and scheduled_at >= current_timestamp';

    db.query(sql, [team_id, review_no], (error, result) => {
      if (error) return next(error);

      if (result.length > 0) {
        return next(createError.BadRequest('Meeting link already exists!'));
      } else {
        // INSERT
        const insertSql = `INSERT INTO meeting_links (team_id, review_no, meeting_link, platform, scheduled_at) VALUES (?, ?, ?, ?, ?)`;

        db.query(insertSql, [team_id, review_no, meetingLink, platform, scheduled_at], (err, insertResult) => {
          if (err) return next(err);
          if (insertResult.affectedRows === 0) return next(createError.BadRequest('Insert failed!'));
          return res.send('Meeting link added successfully!');
        });
      }
    });

  } catch (error) {
    next(error);
  }
});



module.exports = router;
const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const nodemailer = require("nodemailer");
const db = require("../db");
const userAuth = require("../middlewares/userAuth");

// gets the request recevied by the guide

router.get("/guide/getrequests/:reg_num",userAuth,(req,res,next) => {
    try{
        let {reg_num} = req.params;
        if(!reg_num)return next(createError.BadRequest('reg_num is not defined!'));
        let sql = "select * from guide_requests where to_guide_reg_num = ? and status = 'interested'";
        db.query(sql,[reg_num],(error,result) => {
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
router.patch("/guide/accept_reject/:status/:team_id/:semester/:my_id",userAuth, (req, res, next) => {
  try {
    const { status, team_id, my_id,semester } = req.params;
    const {reason} = req.body;

    if (status !== "accept" && status !== "reject") {
      return res.status(400).send("Invalid status");
    }

    if(!team_id || !my_id || !semester || !reason)return next(createError.BadRequest("data is missing!"));

    //checks whether he acts as expert or mentor to that particular team
    let sql = "SELECT * FROM sub_expert_requests WHERE to_expert_reg_num = ? AND from_team_id = ? AND status = 'accept' UNION SELECT * FROM mentor_requests WHERE to_mentor_reg_num = ? AND from_team_id = ? AND status = 'accept'";
    db.query(sql, [my_id,team_id,my_id,team_id], (error, result) => {
      if (error) return next(error);
      if (result.length > 0) return res.status(404).send('Your are already acting as guide or mentor to this team, so you cant accept or reject this request!');

      //Update guide_requests
      let sql1 = "UPDATE guide_requests SET status = ? WHERE to_guide_reg_num = ? AND from_team_id = ? AND status = 'interested'";
      db.query(sql1, [status, my_id, team_id], (error, result) => {
        if (error) return next(error);
        if(result.affectedRows === 0)return res.status(500).send("no rows affected!")

        if (status === "accept") {
          //Count how many teams the guide has
          let sql2 = "SELECT * FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'accept' and team_semester = ?";
          db.query(sql2, [my_id,semester], (error, result) => {
            if (error) return next(error);

            const mentoringTeams = result.length;
            if (mentoringTeams <= 3) {
              // Assign guide to the teams tablew
              let sql3 = "UPDATE teams SET guide_reg_num = ? WHERE team_id = ?";
              db.query(sql3, [my_id, team_id], (error, result) => {
                if (error) return next(error);
                if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
                else {
                      res.send("Status updated successfully and guide assigned!");
                }
              });
            } else {
              //Guide already has 3 projects, mark them as unavailable(false)
              let sql4 = "update users set available = false where reg_num = ?";
              db.query(sql4, [my_id], (error, result) => {
                if (error) return next(error);
                if(result.affectedRows === 0)return res.status(500).send("no rows affected!")

                // remove the requests they got
                let sql5 = "DELETE FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'interested'";
                db.query(sql5, [my_id], (error, result) => {
                  if (error) return next(error);
                  if(result.affectedRows === 0)return res.status(500).send("no rows affected!")
                  res.send("Status updated successfully by removing the guide from guides and guide_requests");
                });
              });
            }
          });
        } else if (status === "reject") {
          // Handle rejection: status already updated in sub_expert_requests
          let rejectSql = "guide_requests set reason = ? where team_id = ?";
            db.query(rejectSql,[reason,team_id],(error,result) => {
              if(error)return next(error);
              if(result.affectedRows === 0)return next(createError.BadRequest('reason not updated in requests table!'));
              res.send(`${team_id} rejected successfully!`)
            })
          
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

  // sends request to guide
  router.post("/guide/sent_request_to_guide/:semester", userAuth, (req, res, next) => {
  try {
    const { semester } = req.params;
    const { from_team_id, project_id, project_name, to_guide_reg_num } = req.body;

    if (!from_team_id || !project_id || !project_name || !Array.isArray(to_guide_reg_num) || to_guide_reg_num.length === 0 || !semester || (semester != 5 && semester != 7)) {
      return res.status(400).json({ message: "Some fields are required" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });

    let validGuides = [];
    let checked = 0;

    to_guide_reg_num.forEach((guideRegNum, idx) => {
      let checkSql = "SELECT team_semester FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'accept'";
      db.query(checkSql, [guideRegNum], (error, results) => {
        if (error) return next(error);

        let s5 = 0, s7 = 0;
        for (let r of results) {
          if (r.team_semester === 5) s5++;
          else if (r.team_semester === 7) s7++;
        }

        if ((semester == 5 && s5 < 3) || (semester == 7 && s7 < 3)) {
          validGuides.push(guideRegNum);
        }

        checked++; // runs on last index
        if (checked === to_guide_reg_num.length) {
          // All guides checked, now proceed to insert requests
          if (validGuides.length === 0) {
            return res.status(400).json({ message: "No eligible guides found" });
          }

          let completed = 0;
          let errors = false;

          validGuides.forEach((guide) => {
            const insertSql = "INSERT INTO guide_requests (from_team_id, project_id, project_name, to_guide_reg_num,team_semester) VALUES (?, ?, ?, ?)";
            db.query(insertSql, [from_team_id, project_id, project_name, guide,semester], (error, insertResult) => {
              if (error || insertResult.affectedRows === 0) {
                console.error("Insert failed for:", guide, error || "No rows inserted");
                errors = true;
              }

              let emailQuery = "SELECT emailId FROM users WHERE reg_num = ? AND role = 'staff'";
              db.query(emailQuery, [guide], (error, emailResult) => {
                if (error || emailResult.length === 0) {
                  console.error("Email not found for:", guide);
                  errors = true;
                  checkComplete();
                } else {
                  const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: emailResult[0].emailId,
                    subject: 'Request To Accept Invite',
                    text: `Dear Guide,\n\n${from_team_id} team has requested you to be their guide. Please login to the system to accept or reject the request.\n\nThank you.`,
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
                if (completed === validGuides.length) {
                  if (errors) {
                    return res.status(500).json({ message: "Some requests or emails failed." });
                  } else {
                    return res.send("Requests sent successfully to all eligible guides!");
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

// conforming review request -> sent by the team, both guide and expert should accept
router.post("/guide/add_review_details/:request_id/:status/:guide_reg_num/:team_id",userAuth,(req,res,next) => {
    try{
      const{project_id,project_name,team_lead,review_date,start_time,review_title} = req.body;
      const{request_id,status,guide_reg_num,team_id} = req.params;
      if(!project_id || !project_name || !team_lead || !review_date || !guide_reg_num || !start_time || !request_id || !status || !team_id || !review_title)
      {
        return next(createError.BadRequest("data is missing!"));
      }
      const safeStatus = status.toLowerCase();
      const validStatus = ['accept','reject'];
      if(!validStatus.includes(safeStatus))return next(createError.BadRequest('invalid status!'));
      // updating status
      let updatequery = "UPDATE review_requests SET guide_status = ? WHERE request_id = ?";
      db.query(updatequery,[safeStatus,request_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("some rows not affected!"));
        if(safeStatus === 'accept')
        {
          // checking whether expert accepted the review request
          let sql1 = "select expert_status,expert_reg_num from review_requests where request_id = ?";
          db.query(sql1,[request_id],(error,result) => {
            if(error)return next(error);
            if(result.length === 0)return next(createError.BadRequest('expert status not found!'));
            if (result[0].expert_status !== 'accept') {
              return res.send('Guide accepted, but expert has not yet accepted the request!');
            }
            const expert_reg_num = result[0].expert_reg_num;

            // inserting into scheduled reivews
            let sql = "insert into scheduled_reviews(project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id,review_title) values(?,?,?,?,?,?,?,?,?)";
            db.query(sql,[project_id,project_name,team_lead,review_date,start_time,expert_reg_num,guide_reg_num,team_id,review_title],(error,result) => {
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

// fetching the upcoming reviews -> mark attendence page

router.get("/guide/fetch_upcoming_reviews/:guide_reg_num",userAuth,(req,res,next) => {
  try{
    const{guide_reg_num} = req.params;
    if(!guide_reg_num)return next(createError.BadRequest("guide reg num missing!"));
    let sql = "SELECT * FROM scheduled_reviews WHERE guide_reg_num = ? AND review_date >= CURRENT_DATE AND attendance IS NULL";
    db.query(sql,[guide_reg_num],(error,result) => {
      if(error)return next(error);
      return res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// fetching the review requests sent by teams

router.get("/guide/fetch_review_requests/:guide_reg_num",userAuth,(req,res,next) => {
  try{
    const{guide_reg_num} = req.params;
    if(!guide_reg_num)return next(createError.BadRequest("guide id is undefined!"));
    let sql = "select * from review_requests where guide_reg_num = ? and status = 'interested' and current_timestamp() <= reveiw_date";
    db.query(sql,[guide_reg_num],(error,result) => {
      if(error)return next(error);
      return res.send(result);
    })
  }
  catch(error){
    next(error);
  }
})

// adds detaied marks to rubix -> also inserts total mark for the review guide_mark and expert_mark to the scheduled_Review table
// reivew no -> 1 or 2 -> get from input tag

router.post("/guide/review/add_team_marks/:guide_reg_num", userAuth, (req, res, next) => {
  const { guide_reg_num } = req.params;
  const {
    review_title,
    review_date,
    team_id,
    guide_literature_survey,
    guide_aim,
    guide_scope,
    guide_need_for_study,
    guide_proposed_methodology,
    guide_work_plan,
    guide_remarks
  } = req.body;

  if (
    !review_title || !review_date || !team_id ||
    guide_reg_num == null ||
    guide_literature_survey == null ||
    guide_aim == null ||
    guide_scope == null ||
    guide_need_for_study == null ||
    guide_proposed_methodology == null ||
    guide_work_plan == null ||
    guide_remarks == null
  ) {
    return next(createError.BadRequest("Missing required fields!"));
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
  const checkSql = "SELECT * FROM review_marks_team WHERE team_id = ? AND review_date = ? AND review_title = ?";
  db.query(checkSql, [team_id, review_date, review_title], (error, result) => {
    if (error) return next(error);
    if (result.length > 0 && result[0].total_guide_marks !== null) {
      return next(createError.BadRequest("Review marks already updated!"));
    }

    const total_guide_marks =
      parseInt(guide_literature_survey) +
      parseInt(guide_aim) +
      parseInt(guide_scope) +
      parseInt(guide_need_for_study) +
      parseInt(guide_proposed_methodology) +
      parseInt(guide_work_plan);

    const fetchExpertSql = `SELECT * FROM review_marks_team WHERE review_title = ? AND review_date = ? AND team_id = ? and guide_reg_num = ?`;

    db.query(fetchExpertSql, [review_title, review_date, team_id,guide_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.length === 0) {
          // not present so insert
          const insertSql = "insert into review_marks_team (review_title,review_date,team_id,guide_literature_survey,guide_aim,guide_scope,guide_need_for_study, guide_proposed_methodology,guide_work_plan,total_marks,total_guide_marks,guide_remarks) values (?,?,?,?,?,?,?,?,?,?,?,?)";
          const values = [
          review_title,
          review_date,
          team_id,
          guide_literature_survey,
          guide_aim,
          guide_scope,
          guide_need_for_study,
          guide_proposed_methodology,
          guide_work_plan,
          total_guide_marks,
          total_guide_marks, // since we are inserting no guide mark present
          guide_remarks,
        ];
        db.query(insertSql,values,(error,result) => {
          if(error)return next(error);
          if(result.affectedRows === 0)return next(createError.InternalServerError("Failed to insert review marks."));
          return res.send({ message: "Guide marks updated successfully!", total_marks: total_expert_marks });
        })
        return;
      }

      const total_expert_marks = result[0].total_expert_marks || 0;
      const total_marks = total_guide_marks + total_expert_marks;

      const updateSql = `
        UPDATE review_marks_team SET
          guide_literature_survey = ?,
          guide_aim = ?,
          guide_scope = ?,
          guide_need_for_study = ?,
          guide_proposed_methodology = ?,
          guide_work_plan = ?,
          total_guide_marks = ?,
          total_marks = ?,
          guide_remarks = ?
        WHERE review_title = ? AND review_date = ? AND team_id = ?
      `;

      const values = [
        guide_literature_survey,
        guide_aim,
        guide_scope,
        guide_need_for_study,
        guide_proposed_methodology,
        guide_work_plan,
        total_guide_marks,
        total_marks,
        guide_remarks,
        review_title,
        review_date,
        team_id
      ];

      db.query(updateSql, values, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
          return next(createError.BadRequest("No matching record found to update."));
        }

        res.send({ message: "Guide marks updated successfully!", total_marks });
      });
    });
  });
});

// adds marks to a seperate individual

router.post('/guide/review/add_marks_to_individual/:guide_reg_num/:reg_num',(req,res,next) => {
  try{
    const{guide_reg_num,reg_num} = req.params;
    const{team_id,review_title,review_date,guide_oral_presentation,guide_viva_voce_and_ppt,guide_contributions,total_guide_marks,guide_remarks} = req.body;
    if(!review_title || !review_date || !guide_reg_num || !reg_num || !team_id)return next(createError.BadRequest('guide register number or student register number is missing!'));
    if(!guide_oral_presentation || !guide_viva_voce_and_ppt || !guide_contributions || !total_guide_marks || !guide_remarks){
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
    const checkSql = "SELECT * FROM review_marks_individual WHERE team_id = ? AND review_date = ? AND review_title = ? and guide_reg_num = ?";
    db.query(checkSql, [team_id, review_date, review_title,guide_reg_num], (error, Checkresult) => {
    if (error) return next(error);
    if (Checkresult.length > 0 && Checkresult[0].total_guide_marks !== null) {
      return next(createError.BadRequest("Review marks already updated!"));
    }

     const total_guide_marks = parseInt(guide_oral_presentation) + parseInt(guide_viva_voce_and_ppt) + parseInt(guide_contributions)

    const fetchExpertSql = `SELECT * FROM review_marks_individual WHERE review_title = ? AND review_date = ? AND team_id = ? and guide_reg_num = ?`;
    db.query(fetchExpertSql, [review_title, review_date, team_id,guide_reg_num], (err, result) => {
      if (err) return next(err);
      if (result.length === 0) {
          // not present so insert
          const insertSql = "insert into review_marks_individual (review_title,review_date,team_id, guide_oral_presentation,guide_viva_voce_and_ppt,guide_contributions,total_marks,total_guide_marks,guide_remarks) values (?,?,?,?,?,?,?,?,?)";
          const values = [
          review_title,
          review_date,
          team_id,
          guide_oral_presentation,
          guide_viva_voce_and_ppt,
          guide_contributions,
          total_guide_marks,
          total_guide_marks, // since we are inserting no guide mark present
          guide_remarks,
        ];
        db.query(insertSql,values,(error,result) => {
          if(error)return next(error);
          if(result.affectedRows === 0)return next(createError.InternalServerError("Failed to insert review marks."));
          return res.send({ message: "Guide marks updated successfully!", total_marks: total_expert_marks });
        })
        return;
      }
      const total_expert_marks = result[0].total_expert_marks || 0;
      const total_marks = total_guide_marks + total_expert_marks;

      const updateSql = `
        UPDATE review_marks_team SET
          guide_oral_presentation = ?,
          guide_viva_voce_and_ppt = ?,
          guide_contributions = ?,
          total_guide_marks = ?,
          total_marks = ?,
          guide_remarks = ?
        WHERE review_title = ? AND review_date = ? AND team_id = ? and guide_reg_num = ?
      `;

      const values = [
        guide_oral_presentation,
        guide_viva_voce_and_ppt,
        guide_contributions,
        total_guide_marks,
        total_guide_marks,
        total_marks,
        guide_remarks,
        review_title,
        review_date,
        team_id,
        guide_reg_num
      ];

      db.query(updateSql, values, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
          return next(createError.BadRequest("No matching record found to update."));
        }

        res.send({ message: "Guide marks updated successfully!", total_marks });
      });
    })
  })
  }
  catch(error)
  {
    next(error);
  }
})


// adds reply to the query

router.patch("/add_reply/:query_id",userAuth,(req,res,next) => { // after 100 deletes old one
    try{
      const{reply} = req.body;
      const{query_id} = req.params;
      if(!reply) return next(createError.BadRequest("reply not found!"));
      let sql = "UPDATE queries SET reply = ? WHERE query_id = ?;";
      db.query(sql,[reply,query_id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.BadRequest("rows are not affected!"));
        res.send("reply added successfully!");
      })
    }
    catch(error)
    {
      next(error);
    }
})

// fecthes the queries received
router.get("/guide/get_queries/:guide_reg_num",userAuth,(req,res,next) => {
    try{
      const{guide_reg_num} = req.params;
      if(!guide_reg_num)return next(createError.BadRequest("reg_num not found!"));
      let sql = "select * from queries where guide_reg_num = ?";
      db.query(sql,[guide_reg_num],(error,result) => {
        if(error)return next(error);
        if(result.length == 0)return res.send("No queries found!");
        res.send(result);
      })
    }
    catch(error)
    {
       next(error);
    }
})

// fetches team details mentored by me -> 1st
router.get("/guide/fetch_guiding_teams/:guide_id",userAuth,(req,res,next) => {
    try{
      const{guide_id} = req.params;
      if(!guide_id)
      {
        return next(createError.BadRequest("guide id not found!"));
      }
    let sql = "select * from guide_requests where to_guide_reg_num = ? and status = 'accept'";
    db.query(sql,[guide_id],(error,teams) => {
        if(error)return next(error);
        if(teams.length == 0)return res.send("No Teams found!");
        res.send(result);
    })
    }
    catch(error)
    {
       next(error);
    }
})

// fetches the no of weeks verified -> particular team_id

router.get('/guide/no_of_weeks_verified/:team_id',(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest('team_id is not defined!'));
    let sql = "SELECT MAX(week_number) AS max_week FROM weekly_logs_verification WHERE team_id = ?"
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.NotFound(`no have been verified for the team :-${team_id}`));
      return res.send(result[0].max_week);
    })
  }
  catch(error)
  {   
    next(error);
  }
})

// fetches the pending verifications that needs to be done by me -> gives only team_id
// finds the team_id that is ready for weekly_log verification

router.get('/guide/fetching_pending_verifications/:guide_reg_num',(req,res,next) => {
  try{
    const{guide_reg_num} = req.params;
    if(!guide_reg_num)return next(createError.BadRequest('guide_reg_num not found!'));
    let sql = "select team_id from weekly_logs_verification where guide_reg_num = ? and is_verified = false";
    db.query(sql,[guide_reg_num],(error,team_id) => {
      if(error)return  next(error);
      if(team_id.length === 0)return res.send('No pending teams to be verified!');
      res.send(team_id);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// finds the latest week and gives the progress entered by each member
// fetches the progress submitted by the particular team

router.get('/guide/gets_the_progress_updated_team_members/:team_id',(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest('team_id not found!'));
    let sql = "SELECT MAX(week_number) AS latest_week FROM weekly_logs_verification WHERE team_id = ? and is_verified = false";
    db.query(sql,[team_id],(error,week_number) => {
      if(error)return next(error);
      if(week_number.length === 0)return next(createError.BadRequest('week_no not found!'));

      let sql1 = `select week${week_number[0].latest_week}_progress from teams where team_id = ?`;
      db.query(sql1,[team_id],(error,result) => {
        if(error)return next(error);
        if(result.length === 0)return next(createError.NotFound('progress not found!'));
        return res.send(result);
      })
    })
  }
  catch(error)
  {
    next(error);
  }
})

// verify weekly logs -> 3rd

router.patch("/guide/verify_weekly_logs/:guide_reg_num/:week/:team_id",userAuth, (req, res, next) => {
  try {
    const { guide_reg_num, team_id, week } = req.params;
    const { remarks } = req.body;

    if (!guide_reg_num || !team_id || !remarks || !week)
      return next(createError.BadRequest("guide_reg_num, team_id, week, or remarks is missing!"));

    const weekNum = parseInt(week);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 12)
      return next(createError.BadRequest("Invalid week number!"));

    const sql = `SELECT guide_reg_num, week${weekNum}_progress AS week_progress FROM team_requests WHERE team_id = ?`;
    db.query(sql, [team_id], (error, result) => {
      if (error) return next(error);
      if (result.length === 0)
        return next(createError.NotFound("Team not found"));
      if (result[0].guide_reg_num !== guide_reg_num)
        return res.status(403).json({ message: "Guide is not assigned to this team" });

      // Check if already verified
      const checkSql = `SELECT * FROM weekly_logs_verification WHERE team_id = ? AND week_number = ?`;
      db.query(checkSql, [team_id, weekNum], (error, found) => {
        if (error) return next(error);
        if (found.length > 0)
          return next(createError.Conflict(`Week ${weekNum} has already been verified`));

        const verifiedAt = new Date();
        const insertSql = `INSERT INTO weekly_logs_verification (team_id, week_number, is_verified, verified_by, verified_at, remarks) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(insertSql, [team_id, weekNum, true, guide_reg_num, verifiedAt, remarks], (error, result) => {
          if (error) return next(error);
          if (result.affectedRows === 0)
            return next(createError.BadRequest("Failed to verify week progress"));

          return res.send(`Week ${weekNum} successfully verified by ${guide_reg_num}`);
        });
      });
    });
  } catch (error) {
    next(error);
  }
});



// checks if already updated
router.get("/guide/checks_already_guide_updated_weekly_progress/:team_id/:week",(req,res,next) => {
  try{
    const{team_id,week} = req.params;
    if(!team_id || !week)return next(createError.BadRequest("data is missing!"));
    let sql = "select is_verified from weekly_logs_verification where team_id = ? and week = ?";
    db.query(sql,[team_id,week],(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error)
  }
})

//fetches all deadlines for a team
router.get("/guide/fetchDeadlines/:team_id",(req,res,next) => {
  try{
    const{team_id} = req.params;
    if(!team_id)return next(createError.BadRequest("team_id not found!"));
    let sql = "select * from weekly_logs_deadlines where team_id = ?";
    db.query(sql,[team_id],(error,result) =>{
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

// meeting link
// -> review number should come from frontend data =x= from the user input

router.post('/guide/add_meeting_link/:guide_reg_num/:team_id/:review_no', (req, res, next) => {
  try {
    const { meetingLink, platform, scheduled_at } = req.body;
    const { guide_reg_num, team_id, review_no } = req.params;

    if (!meetingLink || !platform || !guide_reg_num || !team_id || !review_no || !scheduled_at)
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
const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const nodemailer = require("nodemailer");
const db = require("../db");
const userAuth = require("../middlewares/userAuth");

// gets the request recevied by the mentor

router.get("/guide/getrequests/:reg_num",userAuth,(req,res,next) => {
    try{
        let {reg_num} = req.params;
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
router.patch("/guide/accept_reject/:status/:team_id/:my_id",userAuth, (req, res, next) => {
  try {
    const { status, team_id, my_id } = req.params;

    if (status !== "accept" && status !== "reject") {
      return res.status(400).send("Invalid status");
    }

    if (!team_id || !my_id) {
      return res.status(400).json({ error: 'Invalid team_id or reg_num' });
    }

    // Step 1: Get project_id
    let sql = "SELECT project_id FROM team_requests WHERE team_id = ?";
    db.query(sql, [team_id], (error, result) => {
      if (error) return next(error);
      if (result.length === 0) return res.status(404).send("Project not found");

      const project_id = result[0].project_id;

      // Step 2: Update guide_requests
      let sql1 = "UPDATE guide_requests SET status = ? WHERE to_guide_reg_num = ? AND from_team_id = ? AND status = 'interested'";
      db.query(sql1, [status, my_id, team_id], (error, result) => {
        if (error) return next(error);
        if(result.affectedRows === 0)return res.status(500).send("no rows affected!")

        if (status === "accept") {
          // Step 3: Count how many projects the guide has
          let sql2 = "SELECT * FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'accept'";
          db.query(sql2, [my_id], (error, result) => {
            if (error) return next(error);

            const mentoringTeams = result.length;
            if (mentoringTeams < 4) {
              // Step 4: Assign guide to team_requests
              let sql3 = "UPDATE team_requests SET guide_reg_num = ? WHERE team_id = ?";
              db.query(sql3, [my_id, team_id], (error, result) => {
                if (error) return next(error);
                if(result.affectedRows === 0)return res.status(500).send("no rows affected!")

                // Step 5: Assign guide to projects
                let sql4 = "UPDATE projects SET guide_reg_num = ? WHERE project_id = ?";
                db.query(sql4, [my_id, project_id], (error, result) => {
                  if (error) return next(error);
                  res.send("Status updated successfully and guide assigned!");
                });
              });
            } else {
              // Step 6: Guide already has 4 projects, mark them as unavailable(false)
              let sql4 = "update users set available = false where reg_num = ?";
              db.query(sql4, [my_id], (error, result) => {
                if (error) return next(error);
                if(result.affectedRows === 0)return res.status(500).send("no rows affected!")

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
          res.send(`${team_id} rejected successfully!`)
          
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

  // sends request to guide
  router.post("/guide/sent_request_to_guide",userAuth, (req, res, next) => {
      try {
          const { from_team_id, project_id, project_name, to_guide_reg_num } = req.body;
          if (!from_team_id || !project_id || !project_name || !Array.isArray(to_guide_reg_num) || to_guide_reg_num.length == 0) {
              return res.status(400).json({ message: "All fields are required" });
          }

          // Create a transporter
          const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: process.env.EMAIL_USER, // -> temporary
                  pass: process.env.EMAIL_PASS
              },
          });

          let errorOccured = false;
          let completedRequests = 0;

          // Loop for each guide
          for (let i = 0; i < to_guide_reg_num.length; i++) {
              let sql = "INSERT INTO guide_requests (from_team_id, project_id, project_name, to_guide_reg_num) VALUES (?,?,?,?)";
              db.query(sql, [from_team_id, project_id, project_name, to_guide_reg_num[i]], (error, result) => {
                  if (error) {
                      console.error(`DATABASE ERROR: ${error}`);
                      errorOccured = true;
                  }
                  else if(!result || result.affectedRows === 0){
                    console.error(`No rows inserted for guide ${to_guide_reg_num[i]}`);
                    errorOccured = true;
                  }

                          
                  let getGuideRegNum = "select emailId from users where reg_num = ? and role = 'guide'";
                  db.query(getGuideRegNum,[to_guide_reg_num[i]],(error,result) => {
                    if(error)return next(error);
                    if(result.length === 0)return next(createError.BadRequest("no regnum found!"));
                    let guideEmail = result[0].emailId;
                       // Define email options
                  const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: guideEmail,// guide id -> temporary
                      subject: 'Request To Accept Invite',
                      text: `Dear Guide,\n\n${from_team_id} team has requested you to be their guide. Please login to the system to accept or reject the request.\n\nThank you.`,
                  };

                  // Send the email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Email Error:', error);
                        errorOccured = true;
                    } else {
                        console.log('Email sent:', info.response);
                    }

                    // Track completed requests
                    completedRequests++;

                    // When all requests are done
                    if (completedRequests === to_guide_reg_num.length) {
                        if (errorOccured) {
                            return res.status(500).json({ "message": "Some requests failed, check logs!" });
                        } else {
                            res.send("Request sent successfully to the given guide!");
                        }
                    }
                });
                  })
            });
        }

    } catch (error) {
        next(error);
    }
});
  

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
router.get("/guide/fetch_mentoring_teams/:guide_id",userAuth,(req,res,next) => {
    try{
      const{guide_id} = req.params;
      if(!guide_id)
      {
        return next(createError.BadRequest("guide id not found!"));
    }
    let sql = "select * from guide_requests where to_guide_reg_num = ? and status = 'accept'";
    db.query(sql,[guide_id],(error,result) => {
        if(error)return next(error);
        if(result.length == 0)return res.send("No Teams found!");
        res.send(result);
    })
    }
    catch(error)
    {
       next(error);
    }
})

// fetches the team progress through project_id -> 2nd

router.get("/guide/fetch_progress_by_project_id/:project_id",userAuth,(req,res,next) => {
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

// to check whether guide verified that week
router.get("/guide/check_week_verified/:week/:team_id",(req,res,next) => {
  try{
    const{week,team_id} = req.params;
    if(!week || !team_id)return next(createError.BadRequest("week is null!"));
    let sql = "select * from weekly_logs_verification where week_number = ? and team_id = ?";
    db.query(sql,[week,team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.NotFound("result not found!"));
      res.send(result);
    })
  }
  catch(error){
      next(error);
  }
})


module.exports = router;
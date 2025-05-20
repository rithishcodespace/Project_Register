const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const nodemailer = require("nodemailer");
const db = require("../db");

// gets the request recevied by the mentor

router.get("/guide/getrequests/:reg_num",(req,res,next) => {
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
router.patch("/guide/accept_reject/:status/:team_id/:my_id", (req, res, next) => {
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

                let sql5 = "DELETE FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'interested'";
                db.query(sql5, [my_id], (error, result) => {
                  if (error) return next(error);
                  res.send("Status updated successfully by removing the guide from guides and guide_requests");
                });
              });
            }
          });
        } else if (status === "reject") {
            
          // counts the number of teams he guides
            let sql4 = "SELECT COUNT(*) AS total FROM guide_requests WHERE to_guide_reg_num = ? AND status = 'accept'";
            db.query(sql4,[my_id],(error,result) => {
              if(error)return next(error);

              const mentoringTeams = result[0].total;
              
              //make available or unavailable based on the count of mentoring teams

              let sql5 = "UPDATE users SET available = ? WHERE reg_num = ?";
              const isAvailable = mentoringTeams < 4 ? 1 : 0;
              db.query(sql5,[isAvailable,my_id],(error,result) => {
                if(error)return next(error);
                res.send("Request rejected and availability updated.");
              })
            })
          
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

// sends request to guide
router.post("/guide/sent_request_to_guide", (req, res, next) => {
    try {
        const { from_team_id, project_id, project_name, to_guide_reg_num } = req.body;
        if (!from_team_id || !project_id || !project_name || !Array.isArray(to_guide_reg_num) || to_guide_reg_num.length == 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rithishvkv@gmail.com', // -> temporary
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

                // Define email options
                const mailOptions = {
                    from: 'rithishvkv@gmail.com',
                    to: "rithishcodespace@gmail.com", // guide id -> temporary
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
            });
        }

    } catch (error) {
        next(error);
    }
});


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
router.get("/guide/get_queries/:guide_reg_num",(req,res,next) => {
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
router.get("/guide/fetch_mentoring_teams/:guide_id",(req,res,next) => {
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

router.get("/guide/fetch_progress_by_project_id/:project_id",(req,res,next) => {
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

router.patch("/guide/verify_weekly_logs/:guide_reg_num/:team_id",(req,res,next) => {
  try{
    const{guide_reg_num,team_id} = req.params;
    if(!guide_reg_num || !team_id)return next(createError.BadRequest("guide_reg_num or team_id is missing!"));
    // verifying whether he is the correct guide by logged_in_guide_reg_num === guide_reg_num in the db
    let sql = "select guide_reg_num from team_requests where team_id = ?";
    db.query(sql,[team_id],(error,result) => {
      if(error)return next(error);
      if(result.length === 0)return next(createError.NotFound("guide not found in team_requests table"));
      if(result[0].guide_reg_num !== guide_reg_num)return res.status(403).json({"message":"guide register is invalid or not same"});
      let sql1 = "update team_requests set guide_verified = guide_verified + 1 where team_id = ?";
      db.query(sql1,[team_id],(error,result) => {
        if(error)return next(error);
        res.send("team_progress successfully verified by mentor!");
      })
    })
  }
  catch(error)
  {
    next(error);
  }
})



module.exports = router;
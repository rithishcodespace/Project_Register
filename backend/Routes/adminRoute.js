const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const db = require("../db");

router.post("/admin/adduser",(req,res,next) => {
   try{
     let sql = "insert into users(emailId,password,role) values(?,?,?)";
     const values = [req.body.emailId,req.body.password,req.body.role];
     db.query(sql,values,(error,result) => {
        if(error) next(error);
        res.send("user added successfully by admin!");
     })
   }
   catch(error)
   {
     next(error);
   }
})

module.exports = router;
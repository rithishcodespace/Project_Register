const express = require("express");
const router = express.Router();
const verifyAccessToken = require("../utils/verifyAccessToken");
const createError = require("http-errors");
const db = require("../db");

router.get("/profile/view",verifyAccessToken,(req,res) => {
    try{
      let sql = "select * from users where id = ?";
      const values = [req.payload.id]; //it get request the body will be empty,in verifyAccessToken middleware i added payload to this middleware
      db.query(sql,values,(error,result) => {
        if(error) return(next(error.message));
        else{
            res.status(200).send(result);
        }
      })
    }
    catch(error)
    {
      next(error.message);
    }
})

module.exports = router;
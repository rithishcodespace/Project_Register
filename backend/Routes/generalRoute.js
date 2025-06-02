const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require('http-errors'); 


// get logged in user information
router.get('/user/get_my_information/:reg_num',(req,res,next) => {
    try{
      const{reg_num} = req.params;
      if(!reg_num)return next(createError.BadRequest('Reg_num not found!'));
    }
    catch(error)
    {
        next(error);
    }
})

module.exports = router;
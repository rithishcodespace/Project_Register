const express = require("express");
const router = express.Router();
const createError = require('http-errors');
const db = require('../db')
const userAuth = require('../middlewares/userAuth')

//gets all the reg_num and names of mentees

router.get('/mentor/fetch_mentees/:mentor_reg_num',(req,res,next) => {
    try{
       const{mentor_reg_num} = req.params;
       if(!mentor_reg_num)return next(createError.BadRequest('mentor register number not found!'));
       let sql = "select * from mentors_mentees where mentor_reg_num = ?";
       db.query(sql,[mentor_reg_num],(error,result) =>{
        if(error)return next(error);
        if(result.length === 0)return next(createError.NotFound('mentees not found!'));
        res.send(result);
       })
    }
    catch(error)
    {
        next(error);
    }
})

module.exports = router;
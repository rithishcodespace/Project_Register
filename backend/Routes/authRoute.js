require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");
const validate = require("../utils/validator");
const jwt = require("jsonwebtoken");
const client = require("../utils/redis");
const bcrypt = require("bcrypt");
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/auth/login",(req,res,next) => {
   const{emailId,password} = req.body;
   try{
     if(!emailId || !password) throw createError.BadRequest();
     validate(emailId,password);
     let sql = "select * from users where emailId = ?";
     const values = [emailId];
     db.query(sql,values,async(error,result) => {
        if(error)return next(error);
        if(result.length === 0)return next(createError.Conflict("user does not exist"));
        const user = result[0];
        // const isMatch = await bcrypt.compare(password,user.password);
        // if(!isMatch) next(createError.Unauthorized("EmailId/Password invalid"));
        if(password != user.password)return next(createError.Unauthorized('Username/Password invalid'));

        // generating tokens
        const accessToken = jwt.sign({id:user.id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1hr"});
        const refreshToken = jwt.sign({id:user.id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});

        try{ // storing in redis

          await client.set(user.id.toString(), refreshToken,{
            'EX': 604800 // 7 days
          })

          res.status(200).json({
            message:"user logged in successfull",
            "accessToken" : accessToken,
            "refreshToken" : refreshToken 
          })
        }
        catch(redisError)
        {
            console.log(redisError.message);
            next(createError.InternalServerError());
        }
     })

   }
   catch(error)
   {
     next(error);
   }
})

router.post("/auth/refresh-token",async(req,res,next) => {
   try{
    const{refreshToken} = req.body;
    if(!refreshToken) return next(createError.BadRequest("Refresh token is required"));

    const userId = await verifyRefreshToken(refreshToken);
    // creating tokens
    const newAccessTokens = jwt.sign({id:userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
    const newRefreshTokens = jwt.sign({id:userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});
    // setting in redis
    await client.set(userId.toString(),newRefreshTokens,{EX: 604800})
    res.status(200).json({
        message:"new Refresh token successfully generated",
        "newAccessToken":newAccessTokens,
        "newRefreshToken":newRefreshTokens
    })
   }
   catch(error)
   {
     next(error);
   }
})

router.post("/auth/role",(req,res,next) => {
  try{
    let sql = "select role from users where emailId = ?";
    const values = [req.body.emailId];
    db.query(sql,values,(error,result) => {
      if(error)return next(error);
      res.send(result);
    })
  }
  catch(error)
  {
    next(error);
  }
})

router.delete("/auth/logout",async(req,res,next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw createError.BadRequest("Refresh token is required");
          
        const userId = await verifyRefreshToken(refreshToken);
        await client.del(userId); // deletes the refresh token in redis 
        res.status(200).send("User logged out successfully");
    }
    catch (error) {
        next(error);
    }
})

router.post("/auth/google-login", async (req, res, next) => {
  const { token } = req.body;
  console.log("Token received on backend:", req.body.token);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1054001837515-sj8nrurh5djljlaghguetc7hl9did3oe.apps.googleusercontent.com",
    });
    

    const payload = ticket.getPayload();
    const { email, name } = payload;

    db.query("SELECT * FROM users WHERE emailId = ?", [email], (err, result) => {
      if (err) return next(err);

      let user = result[0];
      if (!user) {
        db.query("INSERT INTO users (emailId, fullName) VALUES (?, ?)", [email, name], (err, insertResult) => {
          if (err) return next(err);
          user = { id: insertResult.insertId, emailId: email };
          return generateTokens(user);
        });
      } else {
        generateTokens(user);
      }

      function generateTokens(user) {
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        clientRedis.set(user.id.toString(), refreshToken, { EX: 604800 });

        res.status(200).json({ accessToken, refreshToken });
      }
    });
  } catch (err) {
    console.error("Google login failed:", err);
    next(createError.Unauthorized("Invalid Google token"));
  }
});

module.exports = router;
require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");
const validate = require("../utils/validator");
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/userAuth");
// const client = require("../utils/redis");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/auth/login",(req,res,next) => {
   const{emailId,password} = req.body;
   console.log(emailId +" " + password) ;
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
        // const accessToken = jwt.sign({id:user.id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1hr"});
        // const refreshToken = jwt.sign({id:user.id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});
        const token = jwt.sign(
        {
          id: user.id,
          role: user.role, 
          name: user.name, 
          email: user.emailId 
        },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "7d" 
        }
      );
      console.log("Generated JWT Token:", token); 
      console.log("Secret Key:", process.env.TOKEN_SECRET);

       // Set the cookie with secure and samesite settings
        res.cookie("token", token, {
          httpOnly: true,       // Makes it inaccessible to JavaScript (secure)
          secure: false,        // Set to false for localhost (development)
          sameSite: "lax",      // Allows cookies for same-site and top-level navigation
          maxAge: 60 * 60 * 1000 // 1 hour (in milliseconds)
        });

        try{ // storing in redis

          // await client.set(user.id.toString(), refreshToken,{
          //   'EX': 604800 // 7 days
          // })

          res.status(200).json({
            message:"user logged in successfull",
            // "accessToken" : accessToken,
            // "refreshToken" : refreshToken,
            "id": result[0].id,
            "emailId" : result[0].emailId,
            "password" : result[0].password,
            "role" : result[0].role,
            "project_id" : result[0].project_id,
            "reg_num" : result[0].reg_num,
            "name" : result[0].name,
            "dept" : result[0].dept,
            "project_type":result[0].project_type
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
       res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
        res.status(200).send("User logged out successfully");
    }
    catch (error) {
        next(error);
    }
})

// google review
// In /auth/google-login route

router.post("/auth/google-login", async (req, res) => {
  const { token } = req.body;
  console.log("Received token:", token);

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    // ✅ Verify token using Google OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const decoded = ticket.getPayload();
    console.log("Verified Google user:", decoded);

    // ✅ Now lookup your user in DB
    db.query("SELECT * FROM student WHERE emailId = ?", [decoded.email], async (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found in system" });
      }

      const user = result[0];

      // ✅ Sign your JWT
      const jwtToken = jwt.sign(
        {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.emailId,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "User logged in successfully",
        ...user,
      });
    });
  } catch (err) {
    console.error("Google token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
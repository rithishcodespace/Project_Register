const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../db");

const userAuth = (req, res, next) => {
  try {
    console.log("Cookies Received:", req.cookies); // Debugging Line
    
    const token = req.cookies.token; // Directly access the cookie
    if (!token) return next(createError.BadRequest("token is missing!!"));

    const decodedMessage = jwt.verify(token, process.env.TOKEN_SECRET);

    // Querying database with callback
    let sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [decodedMessage.id], (error, result) => {
      if (error) return next(error);

      if (result.length === 0) {
        return next(createError.Unauthorized("User does not exist!"));
      }

      req.user = decodedMessage.id;
      next();
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createError.Unauthorized("Invalid token!"));
    }
    if (error.name === "TokenExpiredError") {
      return next(createError.Unauthorized("Token has expired!"));
    }
    next(error);
  }
};

module.exports = userAuth;

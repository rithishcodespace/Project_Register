require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host:process.env.HOST,
    user:process.env.USERNAME,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})

pool.getConnection((error,connection)=>{
    if(error) console.log("Error connecting to db",error.message);
    else{
        console.log("Db connected successfully");
        connection.release();
    }
})

module.exports = pool;
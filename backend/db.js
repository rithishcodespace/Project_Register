require("dotenv").config();
const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host:process.env.HOST,
//     user:"udtsew0rkylshtup",
//     password:"ULuzxXyKviVBJpp3fy1I",
//     database:"bqly6rxcvhm6rp6wxr9z",
//     waitForConnections:true,
//     connectionLimit:10, 
//     queueLimit:0
// })

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Mathan@2007",
    database:"project_registor",
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})



pool.getConnection((error,connection)=>{
    if(error) console.log("Error    connecting to db",error.message);
    else{
        console.log("Db connected successfully");
        connection.release();
    }
})

module.exports = pool;
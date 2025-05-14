require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
<<<<<<< HEAD
    password:"prakashbit",
=======
    password:"Rithish@2006",
>>>>>>> 3cb98c50d529fae7893bcaae6c5c83c471c569a0
    database:"project_registor",
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})

// const pool = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"Mathan@2007",
//     database:"project_registor",
//     waitForConnections:true,
//     connectionLimit:10, 
//     queueLimit:0
// })



pool.getConnection((error,connection)=>{
    if(error) console.log("Error    connecting to db",error.message);
    else{
        console.log("Db connected successfully");
        connection.release();
    }
})

module.exports = pool;
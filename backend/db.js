require("dotenv").config();
const mysql = require("mysql2");

const pool1 = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Rithish@2006",
    database:"demo",
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Mathan@2007",
    database:"project_registor",
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})

const pool3 = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Prakash@2007",
    database:"project_registor",
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
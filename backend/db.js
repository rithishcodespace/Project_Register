require("dotenv").config();
const mysql = require("mysql2");

    const pool = mysql.createPool({
        host:"localhost",
        user:"root",
        password:"Rithish@2006",
        database:"demo",
        waitForConnections:true,
        connectionLimit:10, 
        queueLimit:0
    })

<<<<<<< HEAD
// const pool = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"Mathan@2007",
//     database:"project_registor",
//     waitForConnections:true,
//     connectionLimit:10, 
//     queueLimit:0
// })

// const pool = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"prakashbit",
//     database:"project_registor",
//     waitForConnections:true,
//     connectionLimit:10, 
//     queueLimit:0
// })
=======
const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Mathan@2007",
    database:"project_registor",
    waitForConnections:true,
    connectionLimit:10, 
    queueLimit:0
})
>>>>>>> 012ba34cba267258e67fa62f1572258f54688a52

// const pool = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"prakashbit",
//     database:"project_registor",
//     waitForConnections:true,
//     connectionLimit:10, 
//     queueLimit:0
// })

pool.getConnection((error,connection)=>{
    if(error) console.log("Error connecting to db",error.message);
    else{
        console.log("Db connected successfully");
        connection.release();
    }
})

module.exports = pool;
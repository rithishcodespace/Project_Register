require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const createError = require("http-errors");
const morgan = require("morgan");
const PORT = process.env.PORT;
const authRoute = require("./Routes/authRoute");
const profileRoute = require("./Routes/profile");

app.use(express.json());
app.use(morgan('dev')); //development build
app.use(cors());

app.use("/",authRoute);
app.use("/",profileRoute);

app.use((req,res,next) => {
    next(createError.NotFound("api do not found"));
})

app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.send({
        error:{
            status: error.status || 500,
            message: error.message
        }
    })
})

app.listen(PORT,() => console.log(`server running successfully on http://localhost:${PORT}`));


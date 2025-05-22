require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const createError = require("http-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT;
const authRoute = require("./Routes/authRoute");
const teacherRoute = require("./Routes/teacherRoute");
const studentRoute = require("./Routes/studentRoute");
const adminRouter = require("./Routes/adminRoute");
const guideRouter = require("./Routes/guideRoute");
const subjectExpertRouter = require("./Routes/subjectExpertRouter");
const uploadRouter = require("./Routes/uploadRoute");
const path = require("path");
const cronJob = require("./utils/cronJobs");


app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); //development build
app.use(cors({
    origin: "http://localhost:5173", // Vite's default port
    credentials: true, // accepts cookie's from frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

app.use("/",authRoute);
app.use("/",teacherRoute);
app.use("/",studentRoute);
app.use("/",adminRouter);
app.use("/",guideRouter);
app.use("/",subjectExpertRouter);
app.use("/",uploadRouter);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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


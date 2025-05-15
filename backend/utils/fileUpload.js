// File upload configuration (Multer setup)

const multer = require("multer");
const path = require("path"); // gives the path of my current directory
const fs = require("fs"); // for creating or deleting files, folders in my system

require("dotenv").config(); 

const STORAGE_TYPE = process.env.STORAGE_TYPE || "LOCAL"; 
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads"; 
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) * 1024 * 1024 || 10 * 1024 * 1024; // 10MB 

// checks whether the uploads folder exists, if not creates one
const uploadDir = path.join(__dirname, `../${UPLOAD_DIR}`);
if (STORAGE_TYPE === "LOCAL") {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
}

// Multer Configuration for PDF/PPT Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    // saying that, the uploaded files will be stored in the server's (computer's) disk storage
    if (STORAGE_TYPE === "LOCAL") {
      cb(null, uploadDir);
    } else {
      // Here we can add cloud storage logic (like AWS S3 or Clever Cloud MinIO)
      cb(new Error("Cloud storage not configured yet"));
    }
  },
  filename: (req, file, cb) => { 
    // creates unique file names to avoid conflicts
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File Filter (PDF, PPT, PPTX)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PPT, and PPTX files are allowed"));
  }
};

// Multer Upload Configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }, // controlled by ENV (10MB default)
}).fields([
  { name: "outcome", maxCount: 1 },
  { name: "report", maxCount: 1 },
  { name: "ppt", maxCount: 1 },
]);

module.exports = upload;  

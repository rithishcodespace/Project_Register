const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const upload = require("../utils/fileUpload");
const pool = require("../db");

// Upload files for a team
router.post("/upload-files", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed. " + err.message });
    }

    const { team_id, project_id } = req.body;

    if (!team_id || !project_id) {
      return res.status(400).json({ error: "Team ID and Project ID are required" });
    }

    const fileType = Object.keys(req.files)[0]; // Can be outcome, report, or ppt
    const filePath = req.files[fileType] ? req.files[fileType][0].path : null;

    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const [existingRecord] = await pool.query(
        "SELECT * FROM project_files WHERE team_id = ? AND project_id = ?",
        [team_id, project_id]
      );

      if (existingRecord.length > 0) {
        await pool.query(
          `UPDATE project_files SET ${fileType} = ?, uploaded_at = CURRENT_TIMESTAMP WHERE team_id = ? AND project_id = ?`,
          [filePath, team_id, project_id]
        );
      } else {
        await pool.query(
          "INSERT INTO project_files (team_id, project_id, outcome, report, ppt) VALUES (?, ?, ?, ?, ?)",
          [
            team_id,
            project_id,
            fileType === "outcome" ? filePath : null,
            fileType === "report" ? filePath : null,
            fileType === "ppt" ? filePath : null,
          ]
        );
      }

      res.status(200).json({ message: "File uploaded successfully", file: filePath });
    } catch (dbError) {
      res.status(500).json({ error: "Database Error: " + dbError.message });
    }
  });
});

// Fetch uploaded files for a specific team and project
router.get("/files/:team_id/:project_id", async (req, res) => {
  const { team_id, project_id } = req.params;

  try {
    const [result] = await pool.query(
      "SELECT outcome, report, ppt FROM project_files WHERE team_id = ? AND project_id = ?",
      [team_id, project_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "No files found for this team and project" });
    }

    const filePaths = result[0];
    const fileURLs = Object.entries(filePaths).reduce((acc, [type, path]) => {
      if (path) {
        acc.push({
          type,
          url: `${req.protocol}://${req.get("host")}/${path.replace(/\\/g, "/")}`
        });
      }
      return acc;
    }, []);

    res.status(200).json({ files: fileURLs });
  } catch (error) {
    res.status(500).json({ error: "Database Error: " + error.message });
  }
});

module.exports = router;

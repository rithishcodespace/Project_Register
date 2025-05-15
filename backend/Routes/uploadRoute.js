const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const pool = require("../db");

router.post("/upload-files", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
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
      // Check if a record for this team and project already exists
      const [existingRecord] = await pool.query(
        "SELECT * FROM project_files WHERE team_id = ? AND project_id = ?",
        [team_id, project_id]
      );

      if (existingRecord.length > 0) {
        // Update the existing record with the uploaded file path
        await pool.query(
          `UPDATE project_files SET ${fileType} = ?, uploaded_at = CURRENT_TIMESTAMP WHERE team_id = ? AND project_id = ?`,
          [filePath, team_id, project_id]
        );

        res.status(200).json({
          message: `${fileType} file uploaded and updated successfully`,
          file: filePath,
        });
      } else {
        // Create a new record if it does not exist
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

        res.status(200).json({
          message: "File uploaded and record created successfully",
          file: filePath,
        });
      }
    } catch (dbError) {
      console.error(dbError);
      res.status(500).json({ error: "Database Error" });
    }
  });
});

module.exports = router;

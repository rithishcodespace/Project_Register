// Separate route for file uploads

const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const pool = require("../db");

// Route for PDF/PPT Upload
router.post("/upload-files", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { team_id, project_id } = req.body;

    if (!team_id || !project_id) {
      return res.status(400).json({ error: "Team ID and Project ID are required" });
    }

    const files = {
      outcome: req.files.outcome ? req.files.outcome[0].path : null,
      report: req.files.report ? req.files.report[0].path : null,
      ppt: req.files.ppt ? req.files.ppt[0].path : null,
    };

    try {
      // Save file paths to database
      const [result] = await pool.query(
        "INSERT INTO project_files (team_id, project_id, outcome, report, ppt) VALUES (?, ?, ?, ?, ?)",
        [team_id, project_id, files.outcome, files.report, files.ppt]
      );

      res.status(200).json({
        message: "Files uploaded and saved successfully",
        files,
        recordId: result.insertId,
      });
    } catch (dbError) {
      console.error(dbError);
      res.status(500).json({ error: "Database Error" });
    }
  });
});

module.exports = router;

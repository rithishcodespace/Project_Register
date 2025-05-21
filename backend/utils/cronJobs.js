const cron = require("node-cron");
const db = require("../db");
const generateWeeklyDeadlines = require("../utils/generateWeeklyDeadlines");

cron.schedule("0 0 * * *", () => { // runs every day on midnight 00:00 AM
  console.log("Checking if project start date has reached...");

  const timelineQuery = `SELECT start_date FROM timeline WHERE name = 'project timeline' AND cron_executed = false LIMIT 1;`;

  db.query(timelineQuery, (err, result) => {
    if (err) return console.error("Timeline query error:", err);
    if (result.length === 0) return console.log("No 'project timeline' date set or already executed");

    const startDate = new Date(result[0].start_date);
    const today = new Date();

    startDate.setHours(0, 0, 0, 0); // it removes the time part and need to be used only while compaing
    today.setHours(0, 0, 0, 0);

    if (today >= startDate) {
      console.log("Project start date reached. Generating deadlines...");

      // fetches the conformed and project_inserted teams from team_request that do not appear in the weekly_deadlines_logs
      const teamQuery = `
                     SELECT DISTINCT tr.team_id, tr.project_id
                     FROM team_requests tr
                     WHERE tr.team_conformed = true 
                     AND tr.project_id IS NOT NULL
                     AND NOT EXISTS (
                     SELECT 1 
                     FROM weekly_logs_deadlines wld 
                     WHERE wld.team_id = tr.team_id AND wld.project_id = tr.project_id
                   );

      `;

      db.query(teamQuery, (err, teams) => {
        if (err) return console.error("Team fetch error:", err);
        if (teams.length === 0) return console.log("No confirmed teams found");

        teams.forEach(({ team_id, project_id }) => {
          const deadlines = generateWeeklyDeadlines(startDate); // already formatted

          // it inserts the deadlines into the deadlines table ,if it already exists it updates that row
          const insertSQL = `
            INSERT INTO weekly_logs_deadlines
              (team_id, project_id, week_1, week_2, week_3, week_4, week_5, week_6,
               week_7, week_8, week_9, week_10, week_11, week_12)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              week_1 = VALUES(week_1), week_2 = VALUES(week_2), week_3 = VALUES(week_3),
              week_4 = VALUES(week_4), week_5 = VALUES(week_5), week_6 = VALUES(week_6),
              week_7 = VALUES(week_7), week_8 = VALUES(week_8), week_9 = VALUES(week_9),
              week_10 = VALUES(week_10), week_11 = VALUES(week_11), week_12 = VALUES(week_12)
          `;

          const values = [team_id, project_id, ...deadlines];

          db.query(insertSQL, values, (err) => {
            if (err) return console.error(`Insert error for team ${team_id}:`, err);
            console.log(`Deadlines set for team ${team_id}`);
          });
        });

        // make sure this matches the SELECT name
        const updateTimeline = `UPDATE timeline SET cron_executed = true WHERE name = 'project timeline'`;
        db.query(updateTimeline, (err) => {
          if (err) console.error("Error updating timeline:", err);
          else console.log("Timeline marked as executed.");
        });
      });
    } else {
      console.log("Project start date not reached yet.");
    }
  });
});

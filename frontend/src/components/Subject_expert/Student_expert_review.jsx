import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function Student_expert_review() {
  const [projects, setProjects] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [timers, setTimers] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState({});
  const [markedAbsent, setMarkedAbsent] = useState({});
  const selector = useSelector((Store) => Store.userSlice);

  useEffect(() => {
    fetchReviewRequests();
  }, []);

  const fetchReviewRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:1234/sub_expert/fetch_review_requests/${selector.reg_num}`
      );
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch review requests:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeReview) {
        const now = Date.now();
        const elapsed = Math.floor((now - activeReview.startTime) / 1000);
        const projectId = activeReview.projectId;

        setTimers((prev) => ({
          ...prev,
          [projectId]: elapsed,
        }));

        if (elapsed >= 60 && !attendanceMarked[projectId]) {
          markAttendance(projectId);
        }
      }

      const now = new Date();
      projects.forEach((project) => {
        const scheduled = new Date(project.review_date); // adjust field name
        const diff = now - scheduled;

        if (
          diff > 2 * 60 * 60 * 1000 &&
          !attendanceMarked[project.team_id] &&
          !markedAbsent[project.team_id]
        ) {
          setMarkedAbsent((prev) => ({
            ...prev,
            [project.team_id]: true,
          }));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReview, attendanceMarked, markedAbsent, projects]);

  const markAttendance = async (teamId) => {
    try {
      await axios.patch(
        `http://localhost:1234/sub_expert/mark_attendance/${teamId}`
      );
      setAttendanceMarked((prev) => ({
        ...prev,
        [teamId]: true,
      }));
      console.log("Attendance marked for team", teamId);
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    }
  };

  const handleStartReview = (projectId, scheduledDate) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffInMs = now - scheduled;

    if (diffInMs > 2 * 60 * 60 * 1000) {
      alert("Review cannot be started. You are marked absent.");
      return;
    }

    setActiveReview({
      projectId,
      startTime: Date.now(),
    });
    setTimers((prev) => ({
      ...prev,
      [projectId]: 0,
    }));
  };

  const handleStopReview = () => {
    setActiveReview(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center text-black mb-6">
        Review Projects
      </h2>

      {projects.map((project) => {
        const isActive = activeReview?.projectId === project.team_id;
        const timerValue = timers[project.team_id] || 0;
        const isPresent = attendanceMarked[project.team_id];
        const isAbsent = markedAbsent[project.team_id];

        const scheduledDate = new Date(project.review_date);
        const now = new Date();
        const diffInMs = now - scheduledDate;

        const showBeforeTime = diffInMs < 0;

        return (
          <div
            key={project.team_id}
            className="mb-6 p-6 bg-white rounded shadow-lg border"
          >
            <h3 className="text-xl font-semibold">{project.project_title}</h3>
            <p className="text-gray-700 mt-1">
              <strong>Team Lead:</strong> {project.team_lead}
            </p>
            <p className="text-gray-700 mt-1">
              <strong>Scheduled Time:</strong>{" "}
              {scheduledDate.toLocaleString()}
            </p>

            <div className="mt-4">
              <p className="font-medium text-gray-800">
                Timer: {formatTime(timerValue)}
              </p>
              <p className="text-green-600 font-semibold mt-2">
                {isPresent && "✅ Attendance Marked"}
              </p>
              {!isPresent && isAbsent && (
                <p className="text-red-600 font-semibold mt-2">Absent</p>
              )}
              {!isPresent && !isAbsent && showBeforeTime && (
                <p className="text-yellow-600 font-semibold mt-2">
                  Review time has not started yet
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() =>
                  handleStartReview(project.team_id, project.review_date)
                }
                disabled={isActive || isAbsent || showBeforeTime}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                Start Review
              </button>
              <button
                onClick={handleStopReview}
                disabled={!isActive}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                Stop Review
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Student_expert_review;

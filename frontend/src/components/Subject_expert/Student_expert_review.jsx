import React, { useState, useEffect } from "react";

const sampleProjects = [
  {
    id: 1,
    projectName: "Smart Attendance System",
    teamLead: "Keerthana M",
    scheduledDate: "2025-05-09T11:13", // For testing: May 8, 2025, 2 PM
  },
  {
    id: 2,
    projectName: "AI-Based Traffic Control",
    teamLead: "Rahul S",
    scheduledDate: "2025-05-08T18:00", // For testing
  },
];

function Student_expert_review() {
  const [projects, setProjects] = useState(sampleProjects);
  const [activeReview, setActiveReview] = useState(null);
  const [timers, setTimers] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState({});
  const [markedAbsent, setMarkedAbsent] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeReview) {
        const now = Date.now();
        const elapsed = Math.floor((now - activeReview.startTime) / 1000);
        setTimers((prev) => ({
          ...prev,
          [activeReview.projectId]: elapsed,
        }));

        // Mark attendance after 60 seconds
        if (elapsed >= 60 && !attendanceMarked[activeReview.projectId]) {
          setAttendanceMarked((prev) => ({
            ...prev,
            [activeReview.projectId]: true,
          }));
        }
      }

      const now = new Date();
      projects.forEach((project) => {
        const scheduled = new Date(project.scheduledDate);
        const diff = now - scheduled;

        // If more than 2 hours passed and not marked present
        if (
          diff > 2 * 60 * 60 * 1000 &&
          !attendanceMarked[project.id] &&
          !markedAbsent[project.id]
        ) {
          setMarkedAbsent((prev) => ({
            ...prev,
            [project.id]: true,
          }));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReview, attendanceMarked, markedAbsent, projects]);

  const handleStartReview = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    const now = new Date();
    const scheduled = new Date(project.scheduledDate);

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
        const isActive = activeReview?.projectId === project.id;
        const timerValue = timers[project.id] || 0;
        const isPresent = attendanceMarked[project.id];
        const isAbsent = markedAbsent[project.id];

        const scheduledDate = new Date(project.scheduledDate);
        const now = new Date();
        const diffInMs = now - scheduledDate;

        const showBeforeTime = diffInMs < 0;
        const isTooLate = diffInMs > 2 * 60 * 60 * 1000;

        return (
          <div
            key={project.id}
            className="mb-6 p-6  bg-white rounded shadow-lg border"
          >
            <h3 className="text-xl font-semibold bg-white">{project.projectName}</h3>
            <p className="text-gray-700  bg-white mt-1">
              <strong className=" bg-white ">Team Lead:</strong> {project.teamLead}
            </p>
            <p className="text-gray-700 bg-white  mt-1">
              <strong className=" bg-white ">Scheduled Time:</strong>{" "}
              {scheduledDate.toLocaleString()}
            </p>

            <div className="mt-4 bg-white ">
              <p className="font-medium bg-white  text-gray-800">
                Timer: {formatTime(timerValue)}
              </p>
              <p className="text-green-600 bg-white  font-semibold mt-2">
                {isPresent && "✅ Attendance Marked"}
              </p>
              {!isPresent && isAbsent && (
                <p className="text-red-600  bg-white font-semibold mt-2">
                   Absent
                </p>
              )}
              {!isPresent && !isAbsent && showBeforeTime && (
                <p className="text-yellow-600 bg-white  font-semibold mt-2">
                  Review time has not started yet
                </p>
              )} 
            </div>

            <div className="mt-4 flex bg-white  gap-4">
              <button
                onClick={() => handleStartReview(project.id)}
                disabled={isActive || isAbsent || showBeforeTime}
                className="px-4 py-2 bg-green-500  text-white rounded hover:bg-green-600 disabled:bg-gray-400"
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

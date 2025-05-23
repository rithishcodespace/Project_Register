// import React, { useState, useEffect } from "react";
// import instance from "../../utils/axiosInstance";
// import { useSelector } from "react-redux";

// function Student_expert_review() {
//   const [projects, setProjects] = useState([]);
//   const [activeReview, setActiveReview] = useState(null);
//   const [timers, setTimers] = useState({});
//   const [attendanceMarked, setAttendanceMarked] = useState({});
//   const [markedAbsent, setMarkedAbsent] = useState({});
//   const selector = useSelector((Store) => Store.userSlice);

//   useEffect(() => {
//     fetchReviewRequests();
//   }, []);

//   const fetchReviewRequests = async () => {
//     try {
//       const res = await instance.get(
//         `/sub_expert/fetch_upcoming_reviews/${selector.reg_num}`
//       );
//       setProjects(res.data);
//     } catch (error) {
//       console.error("Failed to fetch review requests:", error);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (activeReview) {
//         const now = Date.now();
//         const elapsed = Math.floor((now - activeReview.startTime) / 1000);
//         const projectId = activeReview.projectId;
//         setTimers((prev) => ({ ...prev, [projectId]: elapsed }));
//         if (elapsed >= 60 && !attendanceMarked[projectId]) {
//           markAttendance(projectId);
//         }
//       }

//       const now = new Date();
//       projects.forEach((project) => {
//         const scheduled = new Date(`${project.review_date}T${project.start_time}`);
//         const diff = now - scheduled;
//         if (
//           diff > 2 * 60 * 60 * 1000 &&
//           !attendanceMarked[project.project_id] &&
//           !markedAbsent[project.project_id]
//         ) {
//           setMarkedAbsent((prev) => ({
//             ...prev,
//             [project.project_id]: true,
//           }));
//         }
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [activeReview, attendanceMarked, markedAbsent, projects]);

//   const markAttendance = async (projectId) => {
//     try {
//       await instance.patch(`/sub_expert/mark_attendance/${projectId}`);
//       setAttendanceMarked((prev) => ({ ...prev, [projectId]: true }));
//     } catch (error) {
//       console.error("Failed to mark attendance:", error);
//     }
//   };

//   const handleStartReview = (projectId, scheduledDate, startTime) => {
//     const now = new Date();
//     const scheduled = new Date(`${scheduledDate}T${startTime}`);
//     if (now - scheduled > 2 * 60 * 60 * 1000) {
//       alert("Review cannot be started. You are marked absent.");
//       return;
//     }
//     setActiveReview({ projectId, startTime: Date.now() });
//     setTimers((prev) => ({ ...prev, [projectId]: 0 }));
//   };

//   const handleStopReview = () => {
//     setActiveReview(null);
//   };

//   const formatTime = (seconds) => {
//     if (seconds < 0) return "00:00";
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {projects.length === 0 ? (
//           <div className="text-center text-gray-600">
//             <p>No upcoming reviews available.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {projects.map((project) => {
//               const projectId = project.project_id;
//               const isActive = activeReview?.projectId === projectId;
//               const timerValue = timers[projectId] || 0;
//               const isPresent = attendanceMarked[projectId];
//               const isAbsent = markedAbsent[projectId];

//               const datePart = new Date(project.review_date).toLocaleDateString();
//               const timePart = project.start_time;

//               const now = new Date();
//               const scheduled = new Date(`${project.review_date}T${project.start_time}`);
//               const diffInMs = now - scheduled;
//               const isBeforeScheduledTime = diffInMs < 0;

//               return (
//                 <div
//                   key={projectId}
//                   className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
//                 >
//                   <div className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-3 gap-4">
//                     <div className="sm:col-span-2">
//                       <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
//                         {project.project_name}
//                       </h3>
//                       <p className="mt-2 text-gray-600 truncate">
//                         <span className="font-medium">Team Lead:</span>{" "}
//                         {project.team_lead}
//                       </p>
//                       <p className="mt-1 text-gray-600">
//                         <span className="font-medium">Scheduled:</span> {datePart}{" "}
//                         <span className="text-gray-500">at</span> {timePart}
//                       </p>
//                     </div>

//                     <div className="flex flex-col items-start sm:items-end space-y-3">
//                       <div className="flex items-center space-x-2">
//                         <span className="font-medium">Timer:</span>
//                         <span className="text-lg font-mono" aria-live="polite">
//                           {formatTime(timerValue)}
//                         </span>
//                       </div>

// <<<<<<< HEAD
//       <div className="mt-4 bg-white">
//         <p className="bg-white font-medium text-gray-800">
//           Timer: {formatTime(timerValue)}
//         </p>
//         <p className="text-green-600 bg-white font-semibold mt-2">
//           {isPresent && " Attendance Marked"}
//         </p>
//         {!isPresent && isAbsent && (
//           <p className="text-red-600 bg-white font-semibold mt-2">Absent</p>
//         )}
//         {!isPresent && !isAbsent && showBeforeTime && (
//           <p className="text-yellow-600 font-semibold mt-2">
//             Review time has not started yet
//           </p>
//         )}
//       </div>

//       <div className="mt-4 flex gap-4">
//         <button
//           onClick={() => handleStartReview(projectId, project.review_date)}
//           disabled={isActive || isAbsent || showBeforeTime}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
//         >
//           Start Review
//         </button>
//         <button
//           onClick={handleStopReview}
//           disabled={!isActive}
//           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
//         >
//           Stop Review
//         </button>
//       </div>
//     </div>
//   );
// })}

// =======
//                       {isPresent && (
//                         <span
//                           role="status"
//                           aria-label="Attendance marked"
//                           className="inline-block px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
//                         >
//                           ✅ Attendance
//                         </span>
//                       )}
//                       {!isPresent && isAbsent && (
//                         <span
//                           role="status"
//                           aria-label="Marked absent"
//                           className="inline-block px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full"
//                         >
//                           🚫 Absent
//                         </span>
//                       )}
//                       {!isPresent && !isAbsent && isBeforeScheduledTime && (
//                         <span
//                           role="status"
//                           aria-label="Review not started"
//                           className="inline-block px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full"
//                         >
//                           ⏳ Not Started
//                         </span>
//                       )}

//                       <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
//                         <button
//                           onClick={() =>
//                             handleStartReview(projectId, project.review_date, project.start_time)
//                           }
//                           disabled={isActive || isAbsent || isBeforeScheduledTime}
//                           aria-label={`Start review for ${project.project_name}`}
//                           className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
//                         >
//                           Start
//                         </button>
//                         <button
//                           onClick={handleStopReview}
//                           disabled={!isActive}
//                           aria-label={`Stop review for ${project.project_name}`}
//                           className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
//                         >
//                           Stop
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
// >>>>>>> bf9afa7f4598a90379899fd9289a4521016b4d89
//     </div>
//   );
// }

// export default Student_expert_review;
// <<<<<<< HEAD


// =======
// >>>>>>> bf9afa7f4598a90379899fd9289a4521016b4d89

import React from 'react'

function Student_expert_review() {
  return (
    <div>Student_expert_review</div>
  )
}

export default Student_expert_review
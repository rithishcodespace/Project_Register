import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProjectFileUpload from "./ProjectFileUpload";
import instance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

const Progress_Update = () => {
  const { reg_num } = useSelector((state) => state.userSlice);
  const teamSelector = useSelector((state) => state.teamSlice);
  const statusSelector = useSelector((state) => state.teamStatusSlice);

  const [description, setDescription] = useState("");
  const [canUpdate, setCanUpdate] = useState(true);
  const [alreadyUpdated, setAlreadyUpdated] = useState(false);
  const [allWeeksCompleted, setAllWeeksCompleted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState("");
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState("");
  const [deadlines, setDeadlines] = useState({});
  const [loading, setLoading] = useState(true);

  const [reviewHistory, setReviewHistory] = useState([]);

  const fetchReviewHistory = async () => {
  try {
    const teamId = teamSelector[0].team_id;
    
    if (!teamId) return;

    const response = await instance.get(`/student/get_review_history/${teamId}`);
    if (typeof response.data !== "string") {
      setReviewHistory(response.data);
      console.log("hai"+reviewHistory.status)
    }
  } catch (error) {
    console.error("Failed to fetch review history:", error);
  }
};


  const handleSubmit = async () => {
    try {
      let response = await instance.post(
        `/student/update_progress/${nextWeekToUpdate}/${reg_num}/${teamSelector[0].team_id}`,
        { progress: description }
      );
      if (response.data === 'YOU HAVE ALREADY SUBMITTED YOUR PROGRESS FOR THIS WEEK!') {
        alert('YOU HAVE ALREADY SUBMITTED YOUR PROGRESS FOR THIS WEEK!');
       
        setDescription("");
      } else if (response.status === 200) {
        alert("Progress submitted");
    
        setDescription("");
      }
    } catch (error) {
      console.error("Progress submission failed:", error);
    }
  };

  const determineWeekFromDate = async (deadlineData, teamId) => {
    const today = new Date();

    for (let i = 1; i <= 12; i++) {
      const weekKey = `week${i}`;
      const deadlineStr = deadlineData[weekKey];
      if (!deadlineStr) continue;

      const deadlineDate = new Date(deadlineStr);
      if (today <= deadlineDate) {
        setCurrentWeek(`Week ${i}`);
        setNextWeekToUpdate(weekKey);
        setCanUpdate(true);
        return;
      }
    }

    // If all deadlines are past
    setAllWeeksCompleted(true);
  };

  const fetchDeadlinesAndDetermineWeek = async () => {
    try {
      const teamId = teamSelector[0]?.team_id;
      if (!teamId) return;
      console.log(teamId)

      const response = await instance.get(`/guide/fetchDeadlines/${teamId}`);
      const deadlineData = response.data[0];
      setDeadlines(deadlineData);
      await determineWeekFromDate(deadlineData, teamId);
    } catch (error) {
      console.error("Failed to fetch deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviousWeekStatus = () => {
  if (!nextWeekToUpdate || !reviewHistory.length) return null;

  const weekNum = parseInt(nextWeekToUpdate.replace("week", ""));
  if (isNaN(weekNum) || weekNum <= 1) return null;

  const prevWeek = `week${weekNum - 1}`;
  const prevReview = reviewHistory.find(entry => entry.week_number === prevWeek);

  return prevReview?.status || null;
};



useEffect(() => {
  fetchReviewHistory(); 
  fetchDeadlinesAndDetermineWeek();
}, []);


  if (loading) {
    return (
      <div className="text-center mt-10 text-blue-600 font-semibold">
        Fetching your progress status...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-4xl font-semibold text-center text-gray-900 mb-8">Progress Update</h1>
      <Link
  to="/student/week"
  className="text-blue-600 hover:underline font-medium"
>
  View Weekly Logs History
</Link>
      

      {allWeeksCompleted ? (
        <ProjectFileUpload
          teamId={teamSelector[0]?.team_id}
          reg_num={reg_num}
          project_id={statusSelector?.project_id}
        />
      ) : canUpdate ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold bg-white text-gray-800 mb-3">{currentWeek}</h2>

               {getPreviousWeekStatus() !== "accept" && (
        <div className="text-yellow-600 font-medium mb-4">
        You can only submit if last week's progress was <b>accepted</b>.
        <br />
        Last week's status: <b>{getPreviousWeekStatus() || "not submitted"}</b>.
      </div>
    )}

              <p className="text-sm text-gray-500 mb-4 bg-white">
                Deadline: <span className="bg-white font-medium text-gray-700">{deadlines[nextWeekToUpdate] || "N/A"}</span>
              </p>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={6}
                placeholder="Describe your weekly progress here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="mt-6 text-right bg-white">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-600 transition font-semibold shadow-lg"
                >
                  Submit Progress
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-10 text-red-600 font-semibold">
              No active deadline or previous week not verified yet.
            </div>
          // )}
      )}
    </div>
  );
};

export default Progress_Update;

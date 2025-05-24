import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProjectFileUpload from "./ProjectFileUpload";
import instance from "../../utils/axiosInstance";

const Progress_Update = () => {
  const { reg_num } = useSelector((state) => state.userSlice);
  const teamSelector = useSelector((state) => state.teamSlice);

  const [description, setDescription] = useState("");
  const [canUpdate, setCanUpdate] = useState(true);
  const [alreadyUpdated, setAlreadyUpdated] = useState(false);
  const [allWeeksCompleted, setAllWeeksCompleted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState("");
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState("");
  const [deadlines, setDeadlines] = useState({});
  const [loading, setLoading] = useState(true);

  const handleSubmit = async () => {
    try {
      let response = await instance.post(
        `/student/update_progress/${nextWeekToUpdate}/${reg_num}/${teamSelector[0].team_id}`,
        { progress: description }
      );
      if (response.data === 'YOU HAVE ALREADY SUBMITTED YOUR PROGRESS FOR THIS WEEK!') {
        alert('YOU HAVE ALREADY SUBMITTED YOUR PROGRESS FOR THIS WEEK!');
        setAlreadyUpdated(true);
        setDescription("");
      } else if (response.status === 200) {
        alert("Progress submitted");
        setAlreadyUpdated(true);
        setDescription("");
      }
    } catch (error) {
      console.error("Progress submission failed:", error);
    }
  };

  const checkIfAlreadyVerified = async (teamId, weekKey) => {
    try {
      const response = await instance.get(
        `/guide/checks_already_guide_updated_weekly_progress/${teamId}/${weekKey}`
      );

      if (response.data.length > 0 && response.data[0].is_verified === 1) {
        setAlreadyUpdated(false);
        setCanUpdate(false);
      } else {
        setAlreadyUpdated(false);
        setCanUpdate(true);
      }
    } catch (error) {
      console.error("Failed to check guide verification status:", error);
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
        await checkIfAlreadyVerified(teamId, weekKey);
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

  useEffect(() => {
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

      {allWeeksCompleted ? (
        <ProjectFileUpload
          teamId={teamSelector[0]?.team_id}
          reg_num={reg_num}
          project_id={teamSelector[0]?.project_id}
        />
      ) : (
        <>
          {alreadyUpdated ? (
            <div className="flex justify-center mt-6">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-6 rounded-xl shadow-md w-full max-w-2xl">
                <div className="flex items-start space-x-4">
                  <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                  </svg>
                  <div>
                    <p className="text-lg font-semibold">Progress Already Verified</p>
                    <p className="mt-1 text-sm">
                      Your progress for <span className="font-semibold">{currentWeek}</span> has already been verified by the guide. No changes allowed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : canUpdate ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold bg-white text-gray-800 mb-3">{currentWeek}</h2>
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
          )}
        </>
      )}
    </div>
  );
};

export default Progress_Update;

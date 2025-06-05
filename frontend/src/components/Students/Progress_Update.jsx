import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProjectFileUpload from "./ProjectFileUpload";
import instance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

const Progress_Update = () => {
  const { reg_num } = useSelector((state) => state.userSlice);
  const teamSelector = useSelector((state) => state.teamSlice);

  const [description, setDescription] = useState("");
  const [canUpdate, setCanUpdate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [currentWeek, setCurrentWeek] = useState("");
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState("");
  const [deadlines, setDeadlines] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [previousWeekStatus, setPreviousWeekStatus] = useState(null);

  const determineWeekFromDate = async (deadlineData) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    let i = 1;

    for (; i <= 12; i++) {
      const weekKey = `week${i}`;
      const deadlineStr = deadlineData[weekKey];
      if (!deadlineStr) continue;

      if (deadlineStr >= todayStr) {
        setCurrentWeek(`Week ${i}`);
        setNextWeekToUpdate(weekKey);
        setCurrentWeekIndex(i);
        break;
      }
    }

    if (i > 12) {
      setCanUpdate(false);
    }
  };

  const fetchDeadlinesAndDetermineWeek = async () => {
    try {
      const teamId = teamSelector[0]?.team_id;
      if (!teamId) return;
      const response = await instance.get(`/guide/fetchDeadlines/${teamId}`);
      const deadlineData = response.data[0];
      setDeadlines(deadlineData);
      await determineWeekFromDate(deadlineData);
    } catch (error) {
      console.error("Failed to fetch deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewHistory = async () => {
    try {
      const teamId = teamSelector[0].team_id;
      const response = await instance.get(`/student/get_review_history/${teamId}`);

      if (typeof response.data !== "string") {
        const data = response.data;
        setReviewHistory(data);

        const currentWeekNum = currentWeekIndex;
        const previousWeekKey = currentWeekNum > 1 ? currentWeekNum - 1 : null;

        const previousReview = data.find((entry) => entry.week_number === previousWeekKey);
        const currentReview = data.find((entry) => entry.week_number === currentWeekNum);

        if (previousReview?.status) setPreviousWeekStatus(previousReview.status);

        if (currentReview) {
          if (currentReview.status === "reject") {
            setCanEdit(true);
            setCanUpdate(false);
            setDescription(currentReview.progress);
          } else {
            setCanEdit(false);
            setCanUpdate(false);
          }
        } else {
          if (currentWeekNum === 1 || previousReview?.status === "accept") {
            setCanUpdate(true);
            setCanEdit(false);
          } else {
            setCanUpdate(false);
            setCanEdit(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch review history:", error);
    }
  };

  const handleSubmit = async () => {
    const teamId = teamSelector[0].team_id;
    try {
      await instance.post(
        `/student/update_progress/${nextWeekToUpdate}/${reg_num}/${teamId}`,
        { progress: description }
      );
      alert("Progress submitted successfully!");
      setCanUpdate(false);
      setCanEdit(false);
      setDescription("");
      fetchReviewHistory(); // Refresh status
    } catch (error) {
      alert("Failed to submit progress.");
      console.error(error);
    }
  };

  const handleEdit = async () => {
    const teamId = teamSelector[0].team_id;
    try {
      await instance.patch(
        `/student/edit_submitted_progress/${teamId}/${nextWeekToUpdate}_progress/${reg_num}`,
        { newProgress: description }
      );
      alert("Progress updated successfully!");
      setCanEdit(false);
      setCanUpdate(false);
      setDescription("");
      fetchReviewHistory(); // Refresh status
    } catch (error) {
      alert("Failed to edit progress.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDeadlinesAndDetermineWeek();
  }, []);

  useEffect(() => {
    if (currentWeekIndex !== null) {
      fetchReviewHistory();
    }
  }, [currentWeekIndex]);

  if (loading) {
    return <div className="text-center mt-10 text-blue-600 font-semibold">Fetching your progress status...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-4xl font-semibold text-center text-gray-900 mb-8">Progress Update</h1>
      <Link to="/student/week" className="text-blue-600 hover:underline font-medium">
        View Weekly Logs History
      </Link>

      {(!canUpdate && !canEdit && !loading) && (
        <div className="text-center mt-6 text-green-600 font-semibold">
          You have already submitted your progress for this week.
        </div>
      )}

      {(canUpdate || canEdit) ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{currentWeek}</h2>
          <p className="text-sm text-gray-500 mb-2">
            Deadline:{" "}
            <span className="font-medium text-gray-700">
              {deadlines[nextWeekToUpdate] || "N/A"}
            </span>
          </p>
          {previousWeekStatus && currentWeekIndex !== 1 && (
            <p className="text-sm text-gray-600 mb-4">
              Previous Week Status:{" "}
              <span className="font-semibold text-gray-800">
                {previousWeekStatus}
              </span>
            </p>
          )}
          <textarea
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={6}
            placeholder="Describe your weekly progress here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="mt-6 text-right">
            {canEdit ? (
              <button
                onClick={handleEdit}
                className="bg-yellow-500 text-white px-6 py-2 rounded-xl hover:bg-yellow-600 transition font-semibold shadow-lg"
              >
                Update Rejected Progress
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-600 transition font-semibold shadow-lg"
              >
                Submit Progress
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mt-10 text-red-600 font-semibold">
          Cannot update progress now. Either all weeks are completed, or previous week's review not accepted.
        </div>
      )}
    </div>
  );
};

export default Progress_Update;
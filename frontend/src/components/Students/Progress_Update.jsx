import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Progress_Update = () => {
  const { reg_num } = useSelector((State) => State.userSlice);
  const [deadlines, setDeadlines] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [description, setDescription] = useState("");
  const [canUpdate, setCanUpdate] = useState(false);
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState(null);
  const userselector = useSelector((State) => State.userSlice);
  const teamselector = useSelector((State) => State.teamSlice);

  useEffect(() => {
    fetchTeamId();
  }, []);

  const fetchTeamId = async () => {
    try {
      const res = await axios.get(`/student/getTeamDetails/${reg_num}`);
      console.log(reg_num);
      
      if (res.data.length > 0) {
        const team_id = res.data[0].team_id;
        setTeamId(team_id);
        fetchDeadlines(team_id);
        fetchVerifications(team_id);
      }
    } catch (err) {
      console.error("Error fetching team ID:", err);
    }
  };

  const fetchDeadlines = async (team_id) => {
    try {
      const res = await axios.get(`/student/fetchDeadlines/${teamselector[0].team_id}`);
      if (res.data.length > 0) {
        setDeadlines(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching deadlines:", err);
    }
  };

  const fetchVerifications = async (team_id) => {
    try {
      const res = await axios.get(`/guide/view_verification_status/${teamselector[0].team_id}`);
      if (res.data.length > 0) {
        setVerifications(res.data);
        decideNextWeek(res.data);
      }
    } catch (err) {
      console.error("Error fetching verifications:", err);
    }
  };

  const decideNextWeek = (verifications) => {
    const verifiedWeeks = verifications
      .filter((v) => v.is_verified === 1)
      .map((v) => v.week_number);

    const nextWeek = Math.max(...verifiedWeeks, 0) + 1;
    const today = new Date().toISOString().split("T")[0];
    const deadlineDate = deadlines[`week${nextWeek}`];

    if (deadlineDate && deadlineDate === today) {
      setCanUpdate(true);
      setNextWeekToUpdate(`week${nextWeek}`);
      setCurrentWeek(`Week ${nextWeek}`);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return toast.error("Description is required.");
    }

    try {
      const res = await axios.post(
        `/student/update_progress/${nextWeekToUpdate}/${reg_num}/${teamId}`,
        {
          progress: description,
        }
      );

      if (res.data.includes("email sent")) {
        toast.success("Progress updated and email sent to guide.");
      } else {
        toast.success("Progress updated successfully.");
      }

      setDescription("");
      fetchVerifications(teamId);
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Failed to update progress.");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Progress Update</h1>

      {canUpdate ? (
        <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-2">{currentWeek}</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deadline: {deadlines[nextWeekToUpdate]}
          </p>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={5}
            placeholder="Enter your weekly progress description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Submit Progress
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-600 font-medium">
          No active deadline today or previous week not verified yet.
        </p>
      )}
    </div>
  );
};

export default Progress_Update;

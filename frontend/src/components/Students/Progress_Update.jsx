import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import instance from "../../utils/axiosInstance";
import ProjectFileUpload from "./ProjectFileUpload";

const Progress_Update = () => {
  const { reg_num } = useSelector((State) => State.userSlice);
  const [deadlines, setDeadlines] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [description, setDescription] = useState("");
  const [canUpdate, setCanUpdate] = useState(false);
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState(null);
  const [alreadyUpdated, setAlreadyUpdated] = useState(false);
  const [allWeeksCompleted, setAllWeeksCompleted] = useState(false);
  let teamselector = useSelector((State) => State.teamSlice);


  async function checkAlreadyUpdatedProgress(week){
    let response = await instance.get(`/student/gets_progress_of_mine/${week}/${reg_num}`);
    if(response.status === 200 && response.data != null)setAlreadyUpdated(true);
  }

  useEffect(() => {
    fetchTeamId();
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchDeadlines(teamId);
      fetchVerifications(teamId);
    }
  }, [teamId]);

  // Call decideNextWeek only when both deadlines and verifications are loaded
  useEffect(() => {
    if (
      Object.keys(deadlines).length > 0 &&
      Array.isArray(verifications) &&
      verifications.length > 0
    ) {
      decideNextWeek(verifications);
    }
  }, [deadlines, verifications]);

  const fetchTeamId = async () => {
    try {
      const res = await instance.get(`/student/getTeamDetails/${reg_num}`);
      console.log("Team Details Response:", res.data);
      if (res.data.length > 0) {
        const team_id = res.data[0].team_id;
        setTeamId(team_id);
      } else {
        console.warn("No team data found.");
      }
    } catch (err) {
      console.error("Error fetching team ID:", err);
    }
  };

  const fetchDeadlines = async (team_id) => {
    try {
      const res = await instance.get(`/student/fetchDeadlines/${team_id}`);
      console.log("Deadlines Response:", res.data);
      if (res.data.length > 0) {
        setDeadlines(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching deadlines:", err);
    }
  };

  const fetchVerifications = async (team_id) => {
    console.log("Fetching verifications for team:", team_id);
    try {
      const res = await instance.get(
        `/student/check_week_verified/${team_id}`
      );
      console.log("Verifications Response:", res.data);
      if (res.status === 200 && Array.isArray(res.data)) {
        setVerifications(res.data);
      } else {
        setVerifications([]);
      }
    } catch (err) {
      console.error("Error fetching verifications:", err);
      setVerifications([]);
    }
  };

  const decideNextWeek = (verifications) => {
    console.log("decideNextWeek called");
    const verifiedWeeks = verifications
      .filter((v) => v.is_verified === 1)
      .map((v) => v.week_number);

    const nextWeek = Math.max(...verifiedWeeks, 0) + 1;
    const today = new Date().toISOString().split("T")[0];

    const deadlineDate = deadlines[`week${nextWeek}`];
    const prevDeadline = deadlines[`week${nextWeek - 1}`];

    console.log("Verified weeks:", verifiedWeeks);
    console.log("Next week to update:", nextWeek);
    console.log("Today:", today);
    console.log("Deadline date:", deadlineDate);
    console.log("Previous deadline:", prevDeadline);

    if(verifiedWeeks >= 12)setAllWeeksCompleted(true);

    setCurrentWeek(`Week ${nextWeek}`);
    setNextWeekToUpdate(`week${nextWeek}`);

    if (
      deadlineDate &&
      prevDeadline &&
      new Date(today) > new Date(prevDeadline) &&
      new Date(today) <= new Date(deadlineDate)
    ) {
      setCanUpdate(true);
       checkAlreadyUpdatedProgress(nextWeek);
    } else {
      setCanUpdate(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return toast.error("Description is required.");
    }

    try {
      const res = await instance.post(
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

    {allWeeksCompleted ? (
      <ProjectFileUpload teamId={teamId} reg_num={reg_num} project_id = {teamselector[0].project_id}/>
    ) : (
      <>
        {alreadyUpdated && (
          <div className="flex items-center justify-center mt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-5 rounded-xl shadow-lg w-full max-w-2xl">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <svg
                    className="w-7 h-7 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold">Progress Already Submitted</p>
                  <p className="mt-1 text-sm text-yellow-700">
                    You've already updated your progress for{" "}
                    <span className="font-semibold text-yellow-900">{currentWeek}</span>.
                    You may wait for the next week's window to open.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {canUpdate && !alreadyUpdated ? (
          <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-2">{currentWeek}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Deadline: {deadlines[nextWeekToUpdate] || "N/A"}
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
        ) : null}

        {!canUpdate && !alreadyUpdated && (
          <div className="text-center text-red-600 font-medium">
            {currentWeek && nextWeekToUpdate ? (
              <>
                Cannot update {currentWeek} yet.
                <br />
                Deadline is <strong>{deadlines[nextWeekToUpdate] || "not set"}</strong>.
              </>
            ) : (
              "No active deadline or previous week not verified yet."
            )}
          </div>
        )}
      </>
    )}
  </div>
);
}

export default Progress_Update;

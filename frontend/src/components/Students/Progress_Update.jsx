import React, { useState,useEffect } from "react";
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
  const [currentWeek, setCurrentWeek] = useState("Week 3");
  const [nextWeekToUpdate, setNextWeekToUpdate] = useState("week3");
  const [deadlines, setDeadlines] = useState({ week3: "2025-06-15" });

  const handleSubmit = () => {
    setAlreadyUpdated(true);
    setDescription("");
    alert("Progress submitted (frontend only)");
  };

  async function findCurrentWeek()
  {
    // gets all the verification of a particular team
    let response = await instance.get(`/guide/check_week_verified/${teamSelector[0].team_id}`);
    if(response.status === 200)
    {
      if(response.data.length === 0){
        setCurrentWeek(0);
      }
      else{
          response.data.forEach(element => {
          if(element.is_verified == 0){
            setCurrentWeek(element.week_number);
          }
      });
          // edge case req did not go to the gudie -> so that week wont be in the db
          setCurrentWeek(response.data.length)
      }
    }
    // checks whether the determined week is in the given within deadline
    let response1 = await instance.get(`/guide/fetchDeadlines/${teamSelector[0].team_id}`);
    if(response1.status === 200){
      response.data[0].forEach((weeks) => {
        
      })
    }
    
  }

  useEffect(() => {
    findCurrentWeek();
  },[])

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Progress Update</h1>

      {allWeeksCompleted ? (
        <ProjectFileUpload
          teamId="sample_team"
          reg_num={reg_num}
          project_id={teamSelector[0]?.project_id}
        />
      ) : (
        <>
          {alreadyUpdated && (
            <div className="flex justify-center mt-6">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-6 rounded-xl shadow-md w-full max-w-2xl">
                <div className="flex items-start space-x-4">
                  <svg
                    className="w-6 h-6 text-yellow-600 mt-1"
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
                  <div>
                    <p className="text-lg font-semibold">Progress Already Submitted</p>
                    <p className="mt-1 text-sm">
                      You've already updated your progress for <span className="font-semibold">{currentWeek}</span>.
                      Please wait for the next week's window to open.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {canUpdate && !alreadyUpdated ? (
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
                  className="bg-gradient-to-r bg-white from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-600 transition font-semibold shadow-lg"
                >
                  Submit Progress
                </button>
              </div>
            </div>
          ) : !alreadyUpdated ? (
            <div className="text-center mt-10 text-red-600 font-semibold">
              {currentWeek && nextWeekToUpdate ? (
                <>
                  Cannot update {currentWeek} yet.<br />
                  Deadline is <strong>{deadlines[nextWeekToUpdate] || "not set"}</strong>.
                </>
              ) : (
                "No active deadline or previous week not verified yet."
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Progress_Update;

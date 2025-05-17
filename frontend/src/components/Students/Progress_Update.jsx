import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProjectProgress = () => {
  const student = JSON.parse(localStorage.getItem('studentData'));
  const reg_num = student?.reg_num;
  const selector = useSelector((state) => state.userSlice);

  const [contribution, setContribution] = useState('');
  const [progress, setProgress] = useState('');
  const [phase, setPhase] = useState('');
  const [week, setWeek] = useState(0);
  const [canUpdate, setCanUpdate] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEligibility = async () => {
    try {
      const res = await axios.get(`http://localhost:1234/student/check_phase_eligibility/${selector.reg_num}`);
      setPhase(res.data.allowedPhase);
      setWeek(res.data.weekNumber);
      setCanUpdate(res.data.canUpdate);
      if (!res.data.isSaturday) {
        setMessage("Updates are allowed only on Saturdays");
      } else if (res.data.alreadyUpdated) {
        setMessage("You’ve already submitted this phase this week");
      }
    } catch (err) {
      setMessage("Error fetching update permission");
    }
  };

  const handleUpdate = async () => {
    if (!canUpdate) return;

    try {
      const res = await axios.post(
        `http://localhost:1234/student/update_progress/${phase}/${selector.reg_num}`,
        { contribution, progress },
        { withCredentials: true }
      );
      setMessage(res.data);
    } catch (err) {
      setMessage(err.response?.data || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center mb-4">Weekly Progress Update</h2>

      <div className="mb-4">
        <label className="block font-semibold">Current Phase</label>
        <input type="text" value={phase.replace('_progress', '').toUpperCase()} disabled className="w-full border p-2 rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Your Contribution (%)</label>
        <input type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Overall Phase Progress (%)</label>
        <input type="number" value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <button
        onClick={handleUpdate}
        disabled={!canUpdate}
        className={`w-full py-2 mt-2 text-white rounded ${canUpdate ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
      >
        {canUpdate ? "Submit Update" : "Not Allowed"}
      </button>

      {message && <p className="text-center mt-4 text-red-600 font-medium">{message}</p>}
    </div>
  );
};

export default ProjectProgress;

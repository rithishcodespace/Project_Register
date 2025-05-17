import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const phaseLabels = [
  'phase1_progress',
  'phase2_progress',
  'phase3_progress',
  'phase4_progress',
  'phase5_progress',
  'phase6_progress',
  'phase7_progress',
  'phase8_progress',
  'phase9_progress',
  'phase10_progress',
  'phase11_progress',
  'phase12_progress',
];

const ProjectProgress = () => {
  const student = JSON.parse(localStorage.getItem('studentData'));
  const regNum = student?.reg_num;
  const email = student?.emailId;

  const [phase, setPhase] = useState('phase1_progress');
  const [contribution, setContribution] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [data, setData] = useState([]);
  const [studentPhases, setStudentPhases] = useState({});

  const handleUpdateProgress = async () => {
    try {
      const response = await axios.post(
        `http://localhost:1234/student/update_progress/${phase}/${regNum}`,
        { contribution },
        { withCredentials: true }
      );
      setResponseMessage(response.data);
      fetchTeamData();
      fetchStudentProgress();
    } catch (error) {
      console.error(error);
      setResponseMessage('Error updating progress');
    }
  };

  const fetchTeamData = async () => {
    try {
      const res = await axios.get('http://localhost:1234/student/team_progress');
      setData(res.data);
    } catch (error) {
      console.error('Failed to load team data');
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:1234/student/my_progress/${regNum}`);
      setStudentPhases(res.data); // { phase1_progress: 100, ... }
    } catch (error) {
      console.error('Failed to fetch student progress');
    }
  };

  useEffect(() => {
    fetchTeamData();
    fetchStudentProgress();
  }, []);

  const getAvailablePhases = () => {
    for (let i = 0; i < phaseLabels.length; i++) {
      if (!studentPhases[phaseLabels[i]] || studentPhases[phaseLabels[i]] < 100) {
        return [phaseLabels[i]]; // Only allow current phase until it's 100%
      }
    }
    return [];
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Update Project Progress</h2>
      <div className="max-w-3xl bg-white mx-auto p-5 rounded-lg">
        {/* Phase Selector */}
        <div className="mb-4 bg-white ">
          <label className="block text-lg bg-white  font-medium"> Phase</label>
          <select
            value={phase}
            disabled
            onChange={(e) => setPhase(e.target.value)}
            className="p-2 border bg-white  border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {getAvailablePhases().map((p) => (
              <option key={p} value={p}>{p.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Contribution Input */}
        <div className="mb-4 bg-white ">
          <label className="block bg-white  text-lg font-medium">Contribution (%)</label>
          <input
            type="number"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className="p-2 border bg-white  border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Register Number Hidden but Used */}
        <div className="mb-4 bg-white ">
          <label className="block bg-white  text-lg font-medium">Description</label>
          <textarea
            type="text"
            value={regNum}
            className="p-2 border border-gray-300 rounded-lg w-full bg-white "
          />
        </div>

        {/* Submit Button */}
        <div className="text-center bg-white  mb-4">
          <button
            onClick={handleUpdateProgress}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Update Progress
          </button>
        </div>

        {/* Response Message */}
        {responseMessage && (
          <p className="text-center  bg-white font-semibold text-red-600">{responseMessage}</p>
        )}

        {/* Chart */}
        <h3 className="text-xl font-semibold text-center bg-white  mt-8 mb-4">Team Contributions</h3>
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ProjectProgress = () => {
  const [phase, setPhase] = useState('phase1_progress');
  const [regNum, setRegNum] = useState('');
  const [contribution, setContribution] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [data, setData] = useState([]);

  const handleUpdateProgress = async () => {
    try {
      let token = localStorage.getItem("accessToken");
      const response = await axios.post(`http://localhost:1234/student/update_progress/${phase}/${regNum}`,{
        "contribution":contribution
      },
      {
        headers:{
          Authorization : `Bearer ${token}`
        }
      }
      );
      setResponseMessage(response.data);

      // Optionally refresh chart data
      fetchTeamData();
    } catch (error) {
      console.error(error);
      setResponseMessage('Error updating progress',error);
    }
  };

  const fetchTeamData = async () => {
    try {
      const res = await axios.get('http://localhost:1234/student/team_progress');
      setData(res.data); // Should return array like: [{ name: "Madhan", value: 40 }, ...]
    } catch (error) {
      console.error('Failed to load team data');
    }
  };

  useEffect(() => {
    fetchTeamData(); // Load once on mount
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Update Project Progress</h2>

      {/* Phase Selector */}
      <div className="mb-4">
        <label className="block text-lg font-medium">Select Phase:</label>
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          
        >
          <option value="phase1_progress">Phase 1</option>
          <option value="phase2_progress">Phase 2</option>
          <option value="phase3_progress">Phase 3</option>
          <option value="phase4_progress">Phase 4</option>
          <option value="phase5_progress">Phase 5</option>
        </select>
      </div>

      {/* Registration Number */}
      <div className="mb-4">
        <label className="block text-lg font-medium">Registration Number:</label>
        <input
          type="text"
          value={regNum}
          onChange={(e) => setRegNum(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Contribution */}
      <div className="mb-6">
        <label className="block text-lg font-medium">Contribution (%):</label>
        <input
          type="number"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Submit Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleUpdateProgress}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Update Progress
        </button>
      </div>

      {/* Response Message */}
      {responseMessage && (
        <p className="text-center font-semibold text-red-600">{responseMessage}</p>
      )}

      {/* Chart */}
      <h3 className="text-xl font-semibold text-center mt-8 mb-4">Team Contributions</h3>
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
  );
};

export default ProjectProgress;

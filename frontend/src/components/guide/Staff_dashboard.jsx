import React, { useState } from 'react';
import { Users, Check, ClipboardList, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sampleData = {
  guide: {
    S5: [
      { from_team_id: 'S5G1', project_id: 'P101', project_name: 'AI Chatbot', status: 'accept', weeks_verified: 8 },
      { from_team_id: 'S5G2', project_id: 'P102', project_name: 'IoT Automation', status: 'accept', weeks_verified: 5 },
      { from_team_id: 'S5G3', project_id: 'P103', project_name: 'Attendance Tracker', status: 'pending', weeks_verified: 2 },
    ],
    S7: [
      { from_team_id: 'S7G1', project_id: 'P201', project_name: 'Smart Farming', status: 'accept', weeks_verified: 9 },
      { from_team_id: 'S7G2', project_id: 'P202', project_name: 'BlockChain Ledger', status: 'accept', weeks_verified: 7 },
      { from_team_id: 'S7G3', project_id: 'P203', project_name: 'E-Voting System', status: 'pending', weeks_verified: 3 },
    ]
  },
  subject_expert: {
    S5: [
      { from_team_id: 'S5SE1', project_id: 'P104', project_name: 'Smart Cart', status: 'accept' },
      { from_team_id: 'S5SE2', project_id: 'P105', project_name: 'Gesture Control', status: 'accept' },
      { from_team_id: 'S5SE3', project_id: 'P106', project_name: 'Digital Diary', status: 'pending' },
    ],
    S7: [
      { from_team_id: 'S7SE1', project_id: 'P204', project_name: 'Smart Dustbin', status: 'accept' },
      { from_team_id: 'S7SE2', project_id: 'P205', project_name: 'Medical Assistant', status: 'accept' },
      { from_team_id: 'S7SE3', project_id: 'P206', project_name: 'Crime Detection', status: 'pending' },
    ]
  }
};

const Staff_dashboard = () => {
  const navigate = useNavigate();

  const handleTeamClick = (team) => {
    // Simulate navigation to a detail page
    navigate(`team-details/${team.from_team_id}`, { state: { team } });
  };

  const renderTable = (teams, role, semester) => (
    <div className="mt-6 bg-white p-4 rounded-xl shadow">
      <h3 className="text-lg font-bold mb-3 text-gray-800">
        {role.toUpperCase()} - Semester {semester}
      </h3>
      <table className="w-full table-auto text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Team ID</th>
            <th className="p-2">Project ID</th>
            <th className="p-2">Project Name</th>
            {role === 'guide' && <th className="p-2">Weeks Verified</th>}
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, idx) => (
            <tr
              key={team.from_team_id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleTeamClick(team)}
            >
              <td className="p-2">{team.from_team_id}</td>
              <td className="p-2">{team.project_id}</td>
              <td className="p-2">{team.project_name}</td>
              {role === 'guide' && <td className="p-2">{team.weeks_verified} / 12</td>}
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-sm rounded-full font-medium ${
                    team.status === 'accept' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {team.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex-1 text-center">Welcome, Staff</h1>
        <button className="p-2 rounded-full relative hover:bg-gray-100">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card icon={<Users className="text-purple-600" size={28} />} label="Total Mentored Groups" value={6} />
        <Card icon={<ClipboardList className="text-blue-600" size={28} />} label="Subject Expert Groups" value={6} />
        <Card icon={<Check className="text-green-600" size={28} />} label="Verified Groups" value={4} />
      </div>

      {/* Guide S5/S7 */}
      {renderTable(sampleData.guide.S5, 'guide', '5')}
      {renderTable(sampleData.guide.S7, 'guide', '7')}

      {/* Subject Expert S5/S7 */}
      {renderTable(sampleData.subject_expert.S5, 'subject_expert', '5')}
      {renderTable(sampleData.subject_expert.S7, 'subject_expert', '7')}
    </div>
  );
};

const Card = ({ icon, label, value }) => (
  <div className="flex items-center bg-white shadow p-4 rounded-lg space-x-3">
    <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default Staff_dashboard;

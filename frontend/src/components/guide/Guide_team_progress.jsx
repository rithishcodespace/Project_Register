import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockTeams = [
  { id: 1, projectTitle: 'Smart Attendance System' },
  { id: 2, projectTitle: 'AI Chatbot for Students' },
  { id: 3, projectTitle: 'E-Voting App' },
  { id: 4, projectTitle: 'Online Lab Journal' },
];

function Guide_team_progress() {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-3xl text-center font-bold mb-6">Team Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white p-5 rounded-xl shadow-md cursor-pointer hover:bg-purple-50"
            onClick={() => navigate(`/guide/team_progress/${team.id}`)}
          >
            <h3 className="text-xl font-semibold text-purple-600">{team.projectTitle}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guide_team_progress;

import React from 'react';
import { useLocation } from 'react-router-dom';

const TeamDetails = () => {
  const { state } = useLocation();
  const team = state?.team;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Team Details - {team?.from_team_id}</h2>
      <div className="bg-white p-4 rounded shadow-md space-y-3">
        <p><strong>Project ID:</strong> {team?.project_id}</p>
        <p><strong>Project Name:</strong> {team?.project_name}</p>
        {team?.weeks_verified !== undefined && (
          <p><strong>Weeks Verified:</strong> {team?.weeks_verified} / 12</p>
        )}
        <p>
          <strong>Status:</strong>{' '}
          <span className={`px-2 py-1 text-sm rounded ${
            team?.status === 'accept' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {team?.status}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TeamDetails;

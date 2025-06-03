import React from 'react';
import { useParams } from 'react-router-dom';

function Team_Details() {
  const { teamId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Team Details</h1>
      <p className="mt-4 text-lg">Team ID: <span className="font-mono text-blue-600">{teamId}</span></p>
    </div>
  );
}

export default Team_Details;

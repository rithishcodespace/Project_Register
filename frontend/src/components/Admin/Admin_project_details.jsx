import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Admin_project_details() {
  const { team_id } = useParams();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeamDetails() {
      try {
        const res = await fetch(`http://localhost:1234/admin/fetch_team_details/${team_id}`);
        if (!res.ok) throw new Error("Failed to fetch team details");
        const data = await res.json();
        setTeamDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if(team_id) fetchTeamDetails();
  }, [team_id]);

  if (loading) return <p>Loading team details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!teamDetails) return <p>No details found for team {team_id}</p>;

  return (
    <div>
      <h2>Details for Team ID: {team_id}</h2>
      <p>Project Name: {teamDetails.project_name}</p>
      <p>Team Members:</p>
      <ul>
        {teamDetails.members && teamDetails.members.map((member, index) => (
          <li key={index}>{member.name} - {member.role}</li>
        ))}
      </ul>
      {/* Render other details based on what your backend sends */}
    </div>
  );
}

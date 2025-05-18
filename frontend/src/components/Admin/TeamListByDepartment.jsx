import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function TeamListByDepartment() {
  const { department } = useParams();  // get the department param from URL
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // If you want to fetch projects/teams by department:
        // Make sure your backend has an API endpoint that accepts `department`
        const res = await fetch(`http://localhost:1234/student/projects`, {
            
            
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departments: [department] }),
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
         console.log("Team Details Data:", data);
        
        setProgressData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if(department) fetchData();
  }, [department]); 

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!progressData || progressData.length === 0) return <p>No data found for {department}</p>;

  return (
     <div>
    <h2>Teams or Projects for Department: {department}</h2>
    <ul>
      {progressData.map((item) => (
        <li key={item.team_id || item.project_id || `item-${index}`}>
          <Link to={`/admin/team_progress/${item.team_id}`}>
            {item.project_name || item.team_name || 'Unnamed Project'}
          </Link>
        </li>
      ))}
    </ul>
  </div>
  );
}

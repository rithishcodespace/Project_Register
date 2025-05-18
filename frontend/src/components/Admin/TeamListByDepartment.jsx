import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function TeamListByDepartment() {
  const { department } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`http://localhost:1234/student/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ departments: [department] }),
        });

        if (!res.ok) throw new Error("Failed to fetch project data");
        const data = await res.json();
        console.log("Fetched projects:", data);
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (department) fetchProjects();
  }, [department]);

  if (loading) return <p className="text-center mt-10">Loading data...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!projects || projects.length === 0) return <p className="text-center mt-10">No data found for {department}</p>;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Projects for {department}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Link
            to={`/admin/team_progress/${project.project_id}`}
            key={index}
            className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <h2 className="text-xl bg-white font-semibold mb-2">{project.project_name}</h2>
            <p className="text-sm mb-2 bg-white text-gray-600">{project.description}</p>
            <p className="text-sm text-gray-500 bg-white mb-4">Project ID: {project.project_id}</p>
            <div className="text-sm">
              <p className="bg-white"><strong className="bg-white">Phase 1:</strong> {project.phase_1_requirements}</p>
              <p className="bg-white"><strong className="bg-white">Phase 2:</strong> {project.phase_2_requirements}</p>
              <p className="bg-white"><strong className="bg-white">Phase 3:</strong> {project.phase_3_requirements}</p>
              <p className="bg-white"><strong className="bg-white">Phase 4:</strong> {project.phase_4_requirements}</p>
              <p className="bg-white"><strong className="bg-white">Phase 5:</strong> {project.phase_5_requirements}</p>
              <p className="bg-white"><strong className="bg-white">Phase 6:</strong> {project.phase_6_requirements}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

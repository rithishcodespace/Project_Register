import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  async function fetchProjects() {
    try {
      let token = localStorage.getItem("accessToken");
      let response = await axios.get("http://localhost:1234/student/projects", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log(response.data);
        setProjectData(response.data);
      } else {
        alert("Error fetching data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong");
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRowClick = (projectId) => {
    const selected = projectData.find(proj => proj.project_id === projectId);
    setSelectedProject(selected);
    setViewModalOpen(true);
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Posted Projects</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-2xl shadow-md border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-purple-100 text-purple-800 text-left text-sm">
              <th className="py-2 px-4 w-64 text-xl">Project Name</th>
              <th className="py-2 px-4 w-64 text-xl">Cluster</th>
              <th className="py-2 px-4 w-80 text-xl">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projectData.map((proj, i) => (
              <tr
                key={i}
                onClick={() => handleRowClick(proj.project_id)}
                className="bg-white transition hover:scale-[1.01] cursor-pointer"
              >
                <td className="py-2 px-4">{proj.project_name}</td>
                <td className="py-2 px-4">{proj.cluster}</td>
                <td className="py-2 px-4">{proj.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {viewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Project Details</h3>

            <p><strong>Name:</strong> {selectedProject.project_name}</p>
            <p><strong>Cluster:</strong> {selectedProject.cluster}</p>
            <p><strong>Description:</strong> {selectedProject.description}</p>

            {/* Showing all Phases */}
            <div className="mt-4">
              <h4 className="text-lg font-bold text-purple-600 mb-2">Project Phases</h4>
              <div className="space-y-2 text-sm">
                {selectedProject.phase_1_requirements && (
                  <div>
                    <p><strong>Phase 1 Requirements:</strong> {selectedProject.phase_1_requirements}</p>
                    <p><strong>Phase 1 Deadline:</strong> {selectedProject.phase_1_deadline}</p>
                  </div>
                )}
                {selectedProject.phase_2_requirements && (
                  <div>
                    <p><strong>Phase 2 Requirements:</strong> {selectedProject.phase_2_requirements}</p>
                    <p><strong>Phase 2 Deadline:</strong> {selectedProject.phase_2_deadline}</p>
                  </div>
                )}
                {selectedProject.phase_3_requirements && (
                  <div>
                    <p><strong>Phase 3 Requirements:</strong> {selectedProject.phase_3_requirements}</p>
                    <p><strong>Phase 3 Deadline:</strong> {selectedProject.phase_3_deadline}</p>
                  </div>
                )}
                {selectedProject.phase_4_requirements && (
                  <div>
                    <p><strong>Phase 4 Requirements:</strong> {selectedProject.phase_4_requirements}</p>
                    <p><strong>Phase 4 Deadline:</strong> {selectedProject.phase_4_deadline}</p>
                  </div>
                )}
                {selectedProject.phase_5_requirements && (
                  <div>
                    <p><strong>Phase 5 Requirements:</strong> {selectedProject.phase_5_requirements}</p>
                    <p><strong>Phase 5 Deadline:</strong> {selectedProject.phase_5_deadline}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project_Details;

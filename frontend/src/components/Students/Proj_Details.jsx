import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Proj_Details = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;

  const selector = useSelector((store) => store.userSlice);

  const handleTakeProject = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.patch(`http://localhost:1234/student/ongoing/${project.project_name}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        alert("Project chosen successfully!");

        const newResponse = await axios.patch(
          `http://localhost:1234/student/assgin_project_id/${project.project_id}/${selector.reg_num}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (newResponse.status === 200) {
          console.log("project_id is successfully inserted into db!");
          navigate(-1); // go back to previous page
        }
      }
    } catch (error) {
      console.error("Error choosing project:", error);
      alert("Something went wrong while choosing project");
    }
  };

  if (!project) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Invalid Project Data. Please go back and select a project again.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h3 className="text-2xl bg-white font-semibold text-purple-700 mb-4">Project Details</h3>

        <p className='bg-white'><strong className='bg-white'>Name:</strong> {project.project_name}</p>
        <p><strong>Cluster:</strong> {project.cluster}</p>
        <p><strong>Description:</strong> {project.description}</p>

        <div className="mt-4">
          <h4 className="text-lg font-bold text-purple-600 mb-2">Project Phases</h4>
          <div className="space-y-2 text-sm">
            {[1, 2, 3, 4, 5].map((phase) => (
              project[`phase_${phase}_requirements`] && (
                <div key={phase}>
                  <p><strong>Phase {phase} Requirements:</strong> {project[`phase_${phase}_requirements`]}</p>
                  <p><strong>Phase {phase} Deadline:</strong> {project[`phase_${phase}_deadline`]}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Button Row */}
        <div className="mt-6 flex justify-between items-center">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <button
            onClick={handleTakeProject}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
          >
            Take Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default Proj_Details;

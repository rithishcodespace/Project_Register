import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Proj_Details from './Proj_Details';
import { Store } from 'lucide-react';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);
  const teamMembers = useSelector((Store) => Store.teamSlice);
  const teamStatus = useSelector((Store) => Store.teamStatusSlice);

  async function handleTakeProject(name, id, guide, expert) {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.patch(`http://localhost:1234/student/ongoing/${name}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        alert("Project chosen successfully!");
        setProjectData(prev => prev.filter(proj => proj.project_name !== name));
        setSelectedProject(null);
      }

      const newresponse = await axios.patch(`http://localhost:1234/student/assgin_project_id/${id}/${selector.reg_num}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (newresponse.status === 200) {
        console.log("project_id is successfully inserted into db!");
      }

      console.log("Selected guide:", guide, "Selected expert:", expert);

    } catch (error) {
      console.error("Error choosing project:", error);
      alert("Something went wrong while choosing project");
    }
  }

  function checkUserStatus() {
  try {
    const hasConfirmedTeam = teamStatus.teamConformationStatus === 1;
    const member = teamStatus?.teamMembers?.[0];
    const hasNoProject = member && member.project_id === null;

    console.log("para:",hasConfirmedTeam,hasNoProject)

    if (hasConfirmedTeam && hasNoProject) {
      setAccessGranted(false);  // Can access & take projects
    } else {
      setAccessGranted(true);   // Cannot take projects
    }
  } catch (e) {
    console.error("Invalid teamStatus in localStorage", e);
    setAccessGranted(true); // safer fallback
  }
}


  async function fetchProjects() {
    try {
      const token = localStorage.getItem("accessToken");
     const departments = [
        ...new Set([
          ...teamMembers.map(member => member.dept),
          teamStatus.teamLeader.dept // Adding Team Leader's department
        ])
      ];

      console.log("departments",departments);

      const response = await axios.post("http://localhost:1234/student/projects", { "departments": departments }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setProjectData(response.data);
        console.log("projects:", response.data);
      } else {
        alert("Error fetching projects");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong");
    }
  }

  async function fetchMyProject() {
    try {
      const token = localStorage.getItem("accessToken");
      const member = teamStatus?.teamMembers?.[0];

      if (member?.project_id) {
        const response = await axios(`http://localhost:1234/student/get_project_details/${member.project_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          console.log("Your project details", response.data);
        } else {
          alert("There is an error in fetching your project details!");
        }
      } else {
        console.warn("No project_id found for this team member.");
      }
    } catch (error) {
      console.error("Error in fetchMyProject:", error);
    }
  }

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (!accessGranted) {
      fetchProjects();
    } else {
      fetchMyProject();
    }
  }, [accessGranted]);

  const handleRowClick = (projectId) => {
    const selected = projectData.find(proj => proj.project_id === projectId);
    setSelectedProject(selected);
  };

  if (accessGranted) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold text-red-500'>First Form a Team!!</h1>
      </div>
    );
  }

  return selectedProject ? (
    <Proj_Details
      project={selectedProject}
      onBack={() => setSelectedProject(null)}
      onTakeProject={handleTakeProject}
    />
  ) : (
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

      {viewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Project Details</h3>

            <p><strong>Name:</strong> {selectedProject.project_name}</p>
            <p><strong>Cluster:</strong> {selectedProject.cluster}</p>
            <p><strong>Description:</strong> {selectedProject.description}</p>

            <div className="mt-4">
              <h4 className="text-lg font-bold text-purple-600 mb-2">Project Phases</h4>
              <div className="space-y-2 text-sm">
                {[1, 2, 3, 4, 5].map(phase => (
                  selectedProject[`phase_${phase}_requirements`] && (
                    <div key={phase}>
                      <p><strong>Phase {phase} Requirements:</strong> {selectedProject[`phase_${phase}_requirements`]}</p>
                      <p><strong>Phase {phase} Deadline:</strong> {selectedProject[`phase_${phase}_deadline`]}</p>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="mt-6 text-right flex justify-between items-stretch">
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>

              <button
                onClick={() => handleTakeProject(selectedProject.project_name, selectedProject.project_id)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Take Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project_Details;

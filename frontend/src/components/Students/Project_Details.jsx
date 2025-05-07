import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);

  async function handleTakeProject(name,id) {
    try {
      const token = localStorage.getItem("accessToken");
      const teamStatus = JSON.parse(localStorage.getItem("teamStatus"))
      const response = await axios.patch(`http://localhost:1234/student/ongoing/${name}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert("Project chosen successfully!");
        setProjectData(prev => prev.filter(proj => proj.project_name !== name));
        setViewModalOpen(false);
      }

      const newresponse = await axios.patch(`http://localhost:1234/student/assgin_project_id/${id}/${selector.reg_num}`,{},{
        headers:{
         Authorization: `Bearer ${token}`
        }
      })

      if(newresponse.status === 200)
      {
        console.log("project_id is successfully inserted into db!");
      }
    } catch (error) {
      console.error("Error choosing project:", error);
      alert("Something went wrong while choosing project");
    }
  }

  function checkUserStatus() {
    const raw = localStorage.getItem("teamStatus");
    if (!raw) return;
  
    try {
      const teamStatus = JSON.parse(localStorage.getItem("teamMembers"));
      console.log("hi da chellam:",teamStatus);
      // setprojectId(teamStatus.teamMembers[0].project_id)
      const hasConfirmedTeam = teamStatus[0].team_conformed=== 1;
      let hasNoProject = false;
      if (teamStatus?.teamMembers?.length > 0) {
      hasNoProject = teamStatus.teamMembers[0].project_id === null;
      }
      console.log("para",hasConfirmedTeam,hasNoProject);

      if (hasConfirmedTeam && hasNoProject || !hasConfirmedTeam) {
        setAccessGranted(true);
      }
    } catch (e) {
      console.error("Invalid teamStatus in localStorage", e);
    }
  }
  

  async function fetchProjects() {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:1234/student/projects", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setProjectData(response.data);
        console.log("projects:",response.data);
      } else {
        alert("Error fetching projects");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong");
    }
  }

  async function fetchMyProject()
  {
    let token = localStorage.getItem("accessToken");
    const teamStatus = JSON.parse(localStorage.getItem("teamStatus"));
    let response = await axios(`http://localhost:1234/student/get_project_details/${teamStatus.teamMembers[0].project_id}`,{
      headers:{
        Authorization : `Bearer ${token}`
      }
    });
    if(response.status === 200)
    {
      console.log("Your project details",response.data);
    }
    else{
      alert("There is an error in fetching your project details!");
    }
  }

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (!accessGranted) {
      fetchProjects();
    }
    else{
      fetchMyProject();
    }
  }, [accessGranted]);


  const handleRowClick = (projectId) => {
    const selected = projectData.find(proj => proj.project_id === projectId);
    setSelectedProject(selected);
    setViewModalOpen(true);
  };

  if (accessGranted) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold text-red-500'>Mathan than paarthukolla vendum!</h1>
      </div>
    );
  }

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
                onClick={() => handleTakeProject(selectedProject.project_name,selectedProject.project_id)}
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Proj_Details from './Proj_Details';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);
  const teamMembers = useSelector((Store) => Store.teamSlice);

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
        headers: { Authorization: `Bearer ${token}` }
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
    const raw = localStorage.getItem("teamStatus");
    if (!raw) return;

    try {
      const teamStatus = JSON.parse(localStorage.getItem("teamMembers"));
      const hasConfirmedTeam = teamStatus[0].team_conformed === 1;
      let hasNoProject = false;
      if (teamStatus?.teamMembers?.length > 0) {
        hasNoProject = teamStatus.teamMembers[0].project_id === null;
      }

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
      const departments = [...new Set(teamMembers.map(member => member.dept))];

      const response = await axios.post("http://localhost:1234/student/projects", { departments }, {
        headers: { Authorization: `Bearer ${token}` }
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
    let token = localStorage.getItem("accessToken");
    const teamStatus = JSON.parse(localStorage.getItem("teamStatus"));
    let response = await axios(`http://localhost:1234/student/get_project_details/${teamStatus.teamMembers[0].project_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      console.log("Your project details", response.data);
    } else {
      alert("There is an error in fetching your project details!");
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
        <h1 className='text-2xl font-bold text-red-500'>Mathan than paarthukolla vendum!</h1>
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
    </div>
  );
};

export default Project_Details;

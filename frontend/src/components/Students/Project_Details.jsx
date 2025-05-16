import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStatus, setUserStatus] = useState("loading"); // "no_team", "no_project", "has_project"
  const [myProject, setMyProject] = useState(null); // project assigned to team

  const selector = useSelector((Store) => Store.userSlice);
  const teamMembers = useSelector((Store) => Store.teamSlice);
  const teamStatus = useSelector((Store) => Store.teamStatusSlice);

  async function handleTakeProject(name, id) {
    try {

      const response = await axios.patch(`http://localhost:1234/student/ongoing/${name}`, {}, {
       withCredentials:true
      });

      if (response.status === 200) {
        console.log(response.data)
        alert("Project chosen successfully!");
        setProjectData(prev => prev.filter(proj => proj.project_name !== name));
        setSelectedProject(null);
        setUserStatus("has_project");
        setMyProject(selectedProject);
      }

      const newresponse = await axios.patch(`http://localhost:1234/student/assign_project_id/${id}/${selector.reg_num}`, {withCredentials: true});

      if (newresponse.status === 200) {
        console.log("project_id is successfully inserted into db!");
      }

    } catch (error) {
      console.error("Error choosing project:", error);
      alert("Something went wrong while choosing project");
    }
  }

  function checkUserStatus() {
    try {
      if (!teamStatus.teamConformationStatus) {
        setUserStatus("no_team");
      } else {
        const member = teamStatus?.teamMembers?.[0];
        if (member?.project_id) {
          setUserStatus("has_project");
        } else {
          setUserStatus("no_project");
        }
      }
    } catch (e) {
      console.error("Invalid teamStatus in store", e);
      setUserStatus("no_team");
    }
  }

  async function fetchProjects() {
    try {
      const token = localStorage.getItem("accessToken");

      const departments = [
        ...new Set([
          ...teamMembers.map(member => member.dept),
          teamStatus.teamLeader.dept
        ])
      ];

      const response = await axios.post("http://localhost:1234/student/projects", { departments }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setProjectData(response.data);
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
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          setMyProject(response.data[0]);
        } else {
          alert("Error fetching your project details");
        }
      }
    } catch (error) {
      console.error("Error in fetchMyProject:", error);
    }
  }

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (userStatus === "no_project") {
      fetchProjects();
    } else if (userStatus === "has_project") {
      fetchMyProject();
    }
  }, [userStatus]);

  const handleRowClick = (projectId) => {
    const selected = projectData.find(proj => proj.project_id === projectId);
    setSelectedProject(selected);
  };

  // No team case
  if (userStatus === "no_team") {
    return (
      <div className='flex justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold text-red-500'>First Form a Team!!</h1>
      </div>
    );
  }

  // Project already taken case
  if (userStatus === "has_project" && myProject) {
    return (
      <div className="p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Your Assigned Project</h2>
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <p><strong>Name:</strong> {myProject.project_name}</p>
          <p><strong>Cluster:</strong> {myProject.cluster}</p>
          <p><strong>Description:</strong> {myProject.description}</p>

          <div className="mt-4">
            <h4 className="text-lg font-bold text-purple-600 mb-2">Project Phases</h4>
            <div className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5].map(phase => (
                myProject[`phase_${phase}_requirements`] && (
                  <div key={phase}>
                    <p><strong>Phase {phase} Requirements:</strong> {myProject[`phase_${phase}_requirements`]}</p>
                    <p><strong>Phase {phase} Deadline:</strong> {myProject[`phase_${phase}_deadline`]}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No project yet — show list
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

      {/* Modal for Project Details */}
      {selectedProject && (
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
                onClick={() => setSelectedProject(null)}
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

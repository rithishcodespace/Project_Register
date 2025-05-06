import { useParams,useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from "axios";

const sampleData = {
  CSE: [
    {
      projectName: "AI Chatbot",
      description: "A chatbot that helps students navigate the college website.",
      teamLead: "Sanjay",
      members: ["Sanjay", "Kavya", "Arun", "Meena"]
    },
    {
      projectName: "College Event Tracker",
      description: "A web app to track upcoming college events and fests.",
      teamLead: "Nisha",
      members: ["Nisha","nix", "Raj", "Divya"]
    }
  ],
  AIDS: [
    {
      projectName: "Data Leak Detection",
      description: "System that detects leaks in sensitive databases.",
      teamLead: "Vikram",
      members: ["Vikram", "Lavanya", "Suresh"]
    }
  ],
};

const Cluster = () => {
  const navigate = useNavigate();
  const { cluster } = useParams();
  const projects = sampleData[cluster] || [];

  function handleDetails(id) {
    navigate(`/teacher/student_progress/project_details/${cluster}/${id}`);
  }

  async function getProjects()
  {
    let token = localStorage.getItem("accessToken");
    let response = await axios.get(`http://localhost:1234/teacher/get_projects_by_cluster/${cluster}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if(response.status === 200)
    {
      console.log("Projects in specific cluster:",response.data);
    }
  }

  useEffect(() => {
    getProjects();
  },[])

  return (
    <div className="p-6 min-h-screen bg-white-100">
      <h1 className="text-3xl font-bold text-center mb-8">Projects in {cluster}</h1>

      {projects.length === 0 ? (
        <p className="text-center text-gray-600">No projects found for {cluster}.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
          {projects.map((project, index) => (
            <div onClick={() => handleDetails(index)} key={index} className="bg-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">
              <h2 className="text-xl bg-white font-semibold text-purple-500 mb-2">{project.projectName}</h2>
              <p className="text-gray-700 bg-white mb-3">{project.description}</p>
              <p className='bg-white'><strong className='bg-white'>Team Lead:</strong> {project.teamLead}</p>
              <p className='bg-white'><strong className='bg-white'>Members:</strong> {project.members.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cluster;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Admin_project_details() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:1234/teacher/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken?.trim()}`,
          },
        });
        if (response.status === 200) {
          setProject(response.data);
        } else {
          alert("Project not found.");
        }
      } catch (error) {
        console.error("Error fetching project details:", error.message);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (!project) {
    return <div>Loading project details...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Project Details</h2>
      <p><strong>Project ID:</strong> {project.project_id}</p>
      <p><strong>Project Name:</strong> {project.project_name}</p>
      <p><strong>Cluster:</strong> {project.cluster}</p>
      <p><strong>Description:</strong> {project.description}</p>
      {/* Add other fields as necessary */}
    </div>
  );
}

export default Admin_project_details;

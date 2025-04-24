import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostedProjects = () => {
  const [projectData, setProjectData] = useState([]);

  async function getProjects() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:1234/teacher/getprojects", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken?.trim()}`
        }
      });

      if (response.status === 200) {
        console.log("Received projects:", response.data);
        setProjectData(response.data);
      } else {
        alert("Sorry, no data");
      }
    } catch (error) {
      console.log("Error fetching projects:", error.message);
    }
  }

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Posted Projects</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-2xl shadow-md border-separate border-spacing-y-2">

          <thead>
            <tr className="bg-purple-100 text-purple-800 text-left text-sm">
              <th className="py-2 px-4 w-44 text-xl">Project Name</th>
              <th className="py-2 px-4 w-32 text-xl">Cluster</th>
              <th className="py-2 px-4 w-80 text-xl">Description</th>
              <th className="py-2 px-4 text-xl">Phase</th>
              <th className="py-2 px-4 w-28 text-xl">Deadline</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projectData.map((proj, i) => (
              <tr key={i} className="bg-white transition">
                <td className="py-2 px-4">{proj.project_name || proj.project_id}</td>
                <td className="py-2 px-4">{proj.cluster}</td>
                <td className="py-2 px-4">{proj.description}</td>
                <td className="py-2 px-4">
                  <ul className="list-disc ml-4 text-sm space-y-1">
                    {[1, 2, 3, 4, 5].map(num => {
                      const req = proj[`phase_${num}_requirements`];
                      return req ? (
                        <li key={num}>
                          <span className="font-medium">Phase {num}:</span> {req}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </td>
                <td className="py-2 px-4">
                  <ul className=" ml-4 text-sm space-y-1">
                    {[1, 2, 3, 4, 5].map(num => {
                      const days = proj[`phase_${num}_deadline`];
                      return days ? (
                        <li key={num}>
                          <span className="font-medium"></span> {days} days
                        </li>
                      ) : null;
                    })}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostedProjects;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PostedProjects = () => {
  const [projectData, setProjectData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch projects
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
        setProjectData(response.data);
      } else {
        alert("No projects found.");
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
    }
  }

  useEffect(() => {
    getProjects();
  }, []);

  // Pagination logic
  const startIndex = currentPage * rowsPerPage;
  const currentData = projectData.slice(startIndex, startIndex + rowsPerPage);
  const pageCount = Math.ceil(projectData.length / rowsPerPage);

  return (
    <div className="ml-10 mr-10 justify-center mt-5">
      <h2 className="text-3xl font-bold flex justify-center mb-8">Posted Projects</h2>
      <div className="w-full bg-white shadow-md rounded-lg p-5 overflow-x-auto">
        <table className="w-full min-w-[700px]" style={{ tableLayout: 'fixed' }}>
          <thead className='bg-white border-b'>
            <tr>
              <th className="pb-3 w-[13%] bg-white text-center">Project ID</th>
              <th className="pb-3 w-[22%] bg-white text-center">Project Name</th>
              <th className="pb-3 w-[10%] bg-white text-center">Cluster</th>
              <th className="pb-3 w-[55%] bg-white text-center">Description</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.project_id} className="text-center border-t">
                <td className="p-4 bg-white">{row.project_id}</td>
                <td className="p-4 bg-white">{row.project_name}</td>
                <td className="p-4 bg-white">{row.cluster}</td>
                <td className="p-4 bg-white break-words">{row.description}</td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No projects to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4 items-center p-4">
        <div>
          Rows per page:
          <select
            className="ml-2 rounded px-1 py-1 border-purple-600 focus:outline-none focus:ring-2"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
          >
            {[5, 10, 15].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <span className="mr-4">
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, projectData.length)} of {projectData.length}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-2 py-1 rounded mr-2"
            title="Previous Page"
          >
            <FaChevronLeft color={currentPage === 0 ? '#A0A0A0' : '#000000'} />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            className="px-2 py-1 rounded"
            title="Next Page"
          >
            <FaChevronRight color={currentPage >= pageCount - 1 ? '#A0A0A0' : '#000000'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostedProjects;

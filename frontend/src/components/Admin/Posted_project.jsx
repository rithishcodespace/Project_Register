import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Posted_project = () => {
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
     <div className="relative mb-8 px-10">
       <h2 className="text-3xl font-bold text-center">Posted Projects</h2>
     </div>

      <div className="w-full bg-white shadow-md rounded-lg p-5">
        <table className="w-full border-none bg-white min-w-[700px]" style={{ tableLayout: 'fixed' }}>
          <thead className='bg-white m-5 border-b'>
            <tr className=" bg-white m-5">
              <th className="p-2 w-[13%] bg-white">Project ID</th>
              <th className="p-2 w-[22%] bg-white">Project Name</th>
              <th className="p-2 w-[10%] bg-white">Cluster</th>
              <th className="p-2 w-[45%] bg-white">Description</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.project_id} className="text-center border-t">
                {['project_id', 'project_name', 'cluster', 'description'].map((field) => (
                  <td key={field} className="p-2 bg-white h-[48px] align-middle">
                      <div className="flex justify-center bg-white items-center h-[36px]">{row[field]}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mr-0 mt-4 items-center p-4">
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
              <option key={size} value={size}>
                {size}
              </option>
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

export default Posted_project;

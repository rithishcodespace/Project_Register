import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Posted_project = () => {
  const [projectData, setProjectData] = useState([]); // this holds your original data
  const [editId, setEditId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const handleEdit = (id) => setEditId(id);
  const handleSave = () => setEditId(null);
  const handleDelete = (id) => setProjectData(projectData.filter(row => row.id !== id));

  const handleInputChange = (id, field, value) => {
    setProjectData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

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

  const startIndex = currentPage * rowsPerPage;
  const currentData = projectData.slice(startIndex, startIndex + rowsPerPage);
  const pageCount = Math.ceil(projectData.length / rowsPerPage);

  return (
    <div className="ml-10 mr-10 justify-center mt-10">
      <div className="w-full bg-white shadow-md rounded-lg p-5">
        <table className="w-full border-none bg-white min-w-[700px]" style={{ tableLayout: 'fixed' }}>
          <thead className='bg-white m-5'>
            <tr className=" bg-white m-5">
              <th className="p-2 w-[13%] bg-white">Project ID</th>
              <th className="p-2 w-[22%] bg-white">Project Name</th>
              <th className="p-2 w-[10%] bg-white">Cluster</th>
              <th className="p-2 w-[45%] bg-white">Description</th>
              <th className="p-2 w-[12%] bg-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.id} className="text-center">
                {['project_id', 'project_name', 'cluster', 'description'].map((field) => (
                  <td key={field} className="p-2 bg-white h-[48px] align-middle">
                    {editId === row.id ? (
                      <div className="flex justify-center items-center h-full">
                        <input
                          value={row[field]}
                          onChange={(e) => handleInputChange(row.id, field, e.target.value)}
                          className="w-full text-center bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded h-[36px]"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center bg-white items-center h-[36px]">{row[field]}</div>
                    )}
                  </td>
                ))}
                <td className="p-2 bg-white h-[48px]">
                  <div className="flex justify-center bg-white items-center space-x-4 h-full">
                    <button
                      onClick={() => (editId === row.id ? handleSave() : handleEdit(row.id))}
                      className={`text-xl bg-white ${editId === row.id ? 'text-green-600' : 'text-blue-600'}`}
                      title={editId === row.id ? 'Save' : 'Edit'}
                    >
                      {editId === row.id ? <FaSave className='bg-white' /> : <FaEdit className='bg-white' />}
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-600 text-xl"
                      title="Delete"
                    >
                      <FaTrash className='bg-white' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mr-24 mt-4 items-center p-4">
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

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSave,  FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const sampleData = [
  { id: 1, projectId: 'PJT001', projectName: 'Smart Irrigation System', cluster: 'IoT', description: 'Automated water supply system using sensors' },
  { id: 2, projectId: 'PJT002', projectName: 'AI Chatbot', cluster: 'AI', description: 'Customer support chatbot with NLP' },
  { id: 3, projectId: 'PJT003', projectName: 'E-Voting System', cluster: 'Blockchain', description: 'Secure electronic voting using blockchain' },
  { id: 4, projectId: 'PJT004', projectName: 'Health Tracker', cluster: 'IoT', description: 'Wearable device for health monitoring' },
  { id: 5, projectId: 'PJT005', projectName: 'Smart Traffic System', cluster: 'AI', description: 'Traffic optimization using AI' },
  { id: 6, projectId: 'PJT006', projectName: 'Online Exam Portal', cluster: 'Web', description: 'Portal for conducting and evaluating exams' },
  { id: 7, projectId: 'PJT007', projectName: 'Virtual Classroom', cluster: 'EdTech', description: 'Online learning environment for students' },
  { id: 8, projectId: 'PJT008', projectName: 'E-Commerce Analytics', cluster: 'Data Science', description: 'Sales and customer behavior analysis' },
  { id: 9, projectId: 'PJT009', projectName: 'Smart Parking System', cluster: 'IoT', description: 'Parking space management using sensors' },
  { id: 10, projectId: 'PJT010', projectName: 'Cyber Security Monitor', cluster: 'Security', description: 'Threat detection and alert system' },
  { id: 11, projectId: 'PJT011', projectName: 'Fitness App', cluster: 'Mobile', description: 'Workout tracking and recommendations' },
  { id: 12, projectId: 'PJT012', projectName: 'Inventory Manager', cluster: 'Web', description: 'Tool for tracking inventory in warehouses' },
];

const Posted_project = () => {
  const [data, setData] = useState(sampleData);
  const [editId, setEditId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const handleEdit = (id) => setEditId(id);
  const handleSave = () => setEditId(null);
  const handleDelete = (id) => setData(data.filter(row => row.id !== id));

  const handleInputChange = (id, field, value) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const startIndex = currentPage * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);
  const pageCount = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="flex justify-center mt-10">
      <div className="w-11/12 bg-white shadow-md rounded-lg p-5">
        <table className="w-full table-fixed border-none bg-white">
          <thead className='bg-white m-5'>
            <tr className="bg-gray-200 bg-white m-5">
              <th className="p-2 w-[10%] bg-white">Project ID</th>
              <th className="p-2 w-[20%] bg-white">Project Name</th>
              <th className="p-2 w-[15%] bg-white">Cluster</th>
              <th className="p-2 w-[35%] bg-white">Description</th>
              <th className="p-2 w-[20%] bg-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.id} className="text-center">
                {['projectId', 'projectName', 'cluster', 'description'].map((field) => (
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
      
        <div className="flex bg-white justify-between items-center p-4">
          
          <div className='bg-white'>
            Rows per page:
            <select
              className="ml-2 bg-white rounded px-2 py-1 shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      
          <div className="flex bg-white items-center">
            <span className="mr-4 bg-white">
              {startIndex + 1}–{Math.min(startIndex + rowsPerPage, data.length)} of {data.length}
            </span>
      
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-2 py-1 rounded mr-2"
              title="Previous Page"
            >
              <FaChevronLeft className='bg-white' color={currentPage === 0 ? '#A0A0A0' : '#000000'} />
            </button>
      
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pageCount - 1}
              className="px-2 py-1 bg-white rounded"
              title="Next Page"
            >
              <FaChevronRight className='bg-white' color={currentPage >= pageCount - 1 ? '#A0A0A0' : '#000000'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posted_project;

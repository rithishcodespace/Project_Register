import React, { useState } from 'react';
import axios from 'axios';

function Add_Project() {
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [description, setDescription] = useState('');
  const [phases, setPhases] = useState(
    Array(5).fill({ requirements: '', days: '' })
  );

  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setPhases(newPhases);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post('http://localhost:1234/teacher/addproject/INTERNAL', {
        "project_name":projectName,
        "cluster":clusterName,
        "description":description
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert('Project added successfully!');
        // Optionally reset form here
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the project.');
    }
  };

  return (<> 
        <h2 className="text-3xl font-semibold mb-2 text-center mt-5 text-black">Post New Project</h2>
     <div className="min-h- flex  items- justify-center bg-white-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
          <form className="space-y-6 bg-white" onSubmit={handleSubmit}>
            {/* Project and Cluster Name */}
            <div className="grid grid-cols-1 bg-white md:grid-cols-2 gap-6">
              <div className='bg-white'>
                <label className="block bg-white text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name"
                  className="mt-1 bg-white w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className='bg-white'>
                <label className="block bg-white text-sm font-medium text-gray-700">Cluster Name</label>
                <select
                    required
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    className="mt-1 bg-white w-full border border-gray-300 rounded-md px-3 py-2"
  >                 
                    <option value="" disabled>
                      Select Cluster Name
                    </option>
                    <option value="CSE">CSE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="IT">IT</option>
                    <option value="AIML">AIML</option>
                    <option value="CT">CT</option>
                    <option value="AGRI">AGRI</option>
                    <option value="ECE">ECE</option>
                    <option value="EIE">EIE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="FT">FT</option>
                    <option value="FD">FD</option>
                    {/* Add more options as needed */}
                  </select>
              </div>
            </div>

            {/* Description */}
            <div className='bg-white'>
              <label className="block text-sm bg-white font-medium text-gray-700">Description</label>
              <textarea
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                className="mt-1 w-full min-h-40 bg-white border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Phases */}
            

            {/* Submit Button */}
            <div className="text-center bg-white">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>
      </div>
    </div></>

  );
}

export default Add_Project;

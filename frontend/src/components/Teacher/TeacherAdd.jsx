import React, { useState } from 'react';

function Project_Details() {
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const projectData = {
      projectName,
      clusterName,
      description,
      objective,
      outcome
    };

    console.log("Project Data:", projectData);
    alert('Project submitted successfully (not saved to backend).');
  };

  return (
    <>
      <h2 className="text-3xl font-semibold mb-2 text-center mt-5 text-black">Post New Project</h2>
      <div className="min-h-screen flex justify-center bg-white-50 p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
          <form className="space-y-6 bg-white" onSubmit={handleSubmit}>
            {/* Project Name and Cluster */}
            
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cluster Name</label>
                <select
                  required
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="" disabled>Select Cluster Name</option>
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
                </select>
              </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                className="mt-1 w-full min-h-32 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Objective</label>
              <textarea
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Enter Objective"
                className="mt-1 w-full min-h-24 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Outcome</label>
              <textarea
                required
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Enter Outcome"
                className="mt-1 w-full min-h-24 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Project_Details;

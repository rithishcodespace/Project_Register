import React, { useState } from 'react';

function Extstudents_add_project() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const isProjectDataValid = () => {
      if (!projectName || !clusterName || !description || phases.length !== 5) return false;
      return phases.every(phase => phase.requirements && phase.days);
    };

    if (!isProjectDataValid()) {
      alert("Please fill in all fields!");
      return;
    }

    console.log("Submitted Project:", {
      projectName,
      clusterName,
      description,
      phases
    });

    alert("Project form submitted (demo only, no backend)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">New Project</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Project and Cluster Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <input
                type="text"
                required
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="Enter Cluster Name"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Phases */}
          {phases.map((phase, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phase {index + 1} Requirements
                </label>
                <input
                  type="text"
                  required
                  value={phase.requirements}
                  onChange={(e) => handlePhaseChange(index, 'requirements', e.target.value)}
                  placeholder="Requirements"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phase {index + 1} Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={phase.days}
                  onChange={(e) => handlePhaseChange(index, 'days', e.target.value)}
                  placeholder="No. of days"
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Extstudents_add_project;

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
    <>
        <h2 className="text-3xl mt-5  font-bold text-center  mb-3">New Project</h2>
    <div className="min-h-screen   flex items-center justify-center bg-white-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <form className="space-y-6  bg-white " onSubmit={handleSubmit}>
          <div className="grid grid-cols-1  bg-white md:grid-cols-2 gap-6">
            <div className=' bg-white '>
              <label className="block  bg-white text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter Project Name"
                className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className=' bg-white '>
              <label className="block text-sm font-medium bg-white  text-gray-700">Cluster Name</label>
              <input
                type="text"
                required
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="Enter Cluster Name"
                className="mt-1 w-full  bg-white border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className=' bg-white '>
            <label className="block text-sm font-medium bg-white  text-gray-700">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {phases.map((phase, index) => (
            <div key={index} className="grid grid-cols-1  bg-white md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2 bg-white ">
                <label className="block text-sm bg-white  font-medium text-gray-700">
                  Phase {index + 1} Requirements
                </label>
                <input
                  type="text"
                  required
                  value={phase.requirements}
                  onChange={(e) => handlePhaseChange(index, 'requirements', e.target.value)}
                  placeholder="Requirements"
                  className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="col-span-2  bg-white ">
                <label className="block text-sm bg-white  font-medium text-gray-700">
                  Phase {index + 1} Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={phase.days}
                  onChange={(e) => handlePhaseChange(index, 'days', e.target.value)}
                  placeholder="No. of days"
                  className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          ))}

          <div className="text-center  bg-white ">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div></>
  );
}

export default Extstudents_add_project;

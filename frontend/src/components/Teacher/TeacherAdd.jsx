import React, { useState } from 'react';

function TeacherAdd() {
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [description, setDescription] = useState('');
  const [phases, setPhases] = useState([
    { requirements: '', deadline: '' },
    { requirements: '', deadline: '' },
    { requirements: '', deadline: '' },
    { requirements: '', deadline: '' },
    { requirements: '', deadline: '' },
  ]);

  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...phases];
    newPhases[index][field] = value;
    setPhases(newPhases);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      project_name: projectName,
      cluster: clusterName,
      description,
      phases: phases.map((phase, index) => ({
        [`phase_${index + 1}_requirements`]: phase.requirements,
        [`phase_${index + 1}_deadline`]: phase.deadline,
      })),
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        alert('Project added successfully');
        // Reset form or do something else on success
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl bg-white font-semibold mb-6 text-center text-gray-800">Post New Project</h2>
        <form className="space-y-6 bg-white" onSubmit={handleSubmit}>
          {/* Project and Cluster Name */}
          <div className="grid grid-cols-1  bg-white md:grid-cols-2 gap-6">
            <div className=' bg-white '>
              <label className="block  bg-white text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text" required 
                placeholder="Enter Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 w-full bg-white  border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className=' bg-white '>
              <label className="block text-sm bg-white  font-medium text-gray-700">Cluster Name</label>
              <input
                type="text" required 
                placeholder="Enter Cluster Name"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                className="mt-1 w-full border border-gray-300  bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className=' bg-white '>
            <label className="block  bg-white text-sm font-medium text-gray-700">Description</label>
            <input
              type="text" required 
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phases */}
          {[1, 2, 3, 4, 5].map((phase, index) => (
            <div key={phase} className="grid grid-cols-1 bg-white  md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2 bg-white ">
                <label className="block text-sm bg-white  font-medium text-gray-700">
                  Phase {phase} Requirements
                </label>
                <input
                  type="text" required 
                  placeholder="Requirements"
                  value={phases[index].requirements}
                  onChange={(e) => handlePhaseChange(index, 'requirements', e.target.value)}
                  className="mt-1 w-full border bg-white  border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2  bg-white ">
                <label className="block bg-white  text-sm font-medium text-gray-700">
                  Phase {phase} Deadline (days)
                </label>
                <input
                  type="number"
                  placeholder="No. of days"
                  value={phases[index].deadline}
                  onChange={(e) => handlePhaseChange(index, 'deadline', e.target.value)}
                  className="mt-1 w-full  bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="text-center bg-white ">
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

export default TeacherAdd;

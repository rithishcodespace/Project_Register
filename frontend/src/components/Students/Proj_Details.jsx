import React, { useState } from 'react';

const Proj_Details = ({ project, onBack, onTakeProject }) => {
  // Sample data for guides and experts
  const guides = [
    { name: 'Dr. A', phone: '1234567890' },
    { name: 'Dr. B', phone: '2345678901' },
    { name: 'Dr. C', phone: '3456789012' },
  ];

  const experts = [
    { name: 'Prof. X', phone: '4567890123' },
    { name: 'Prof. Y', phone: '5678901234' },
    { name: 'Prof. Z', phone: '6789012345' },
  ];

  const [selectedGuides, setSelectedGuides] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);

  const handleGuideChange = (name) => {
    setSelectedGuides((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const handleExpertChange = (name) => {
    setSelectedExperts((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold text-purple-700 mb-6 text-center">Project Details</h3>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Project Information */}
        <div className="md:w-1/2">
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <p className="mb-2"><strong>Name:</strong> {project.project_name}</p>
            <p className="mb-2"><strong>Cluster:</strong> {project.cluster}</p>
            <p className="mb-2"><strong>Description:</strong> {project.description}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-purple-600 mb-4">Project Phases</h4>
            <div className="space-y-4 text-sm">
              {[1, 2, 3, 4, 5].map((phase) =>
                project[`phase_${phase}_requirements`] ? (
                  <div key={phase} className="border-b pb-2">
                    <p><strong>Phase {phase} Requirements:</strong> {project[`phase_${phase}_requirements`]}</p>
                    <p><strong>Phase {phase} Deadline:</strong> {project[`phase_${phase}_deadline`]}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Guide and Subject Expert Selection */}
        <div className="md:w-1/2">
          {/* Guide Selection Table */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Guide</label>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.map((guide, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-800">{guide.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{guide.phone}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="checkbox"
                          value={guide.name}
                          checked={selectedGuides.includes(guide.name)}
                          onChange={() => handleGuideChange(guide.name)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Expert Selection Table */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Subject Expert</label>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {experts.map((expert, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-800">{expert.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{expert.phone}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="checkbox"
                          value={expert.name}
                          checked={selectedExperts.includes(expert.name)}
                          onChange={() => handleExpertChange(expert.name)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          onClick={onBack}
        >
          Back
        </button>

        <button
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            selectedGuides.length === 0 || selectedExperts.length === 0
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
          onClick={() =>
            onTakeProject(
              project.project_name,
              project.project_id,
              selectedGuides,
              selectedExperts
            )
          }
          disabled={selectedGuides.length === 0 || selectedExperts.length === 0}
        >
          Take Project
        </button>
      </div>
    </div>
  );
};

export default Proj_Details;

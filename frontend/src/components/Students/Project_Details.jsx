import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Project_Details() {
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [core, setCore] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');

  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  const [expertsList, setExpertsList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleExpertSelection = (expertName) => {
    setSelectedExperts((prev) =>
      prev.includes(expertName)
        ? prev.filter((e) => e !== expertName)
        : [...prev, expertName]
    );
  };

  const toggleGuideSelection = (guideName) => {
    setSelectedGuides((prev) =>
      prev.includes(guideName)
        ? prev.filter((g) => g !== guideName)
        : [...prev, guideName]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

   

    const projectData = {
      projectName,
      clusterName,
      core,
      description,
      outcome,
      selectedExperts,
      selectedGuides,
    };

    console.log("Project Data:", projectData);
    alert('Project submitted successfully (not saved to backend).');
  };

  useEffect(() => {
    async function fetchExpertsAndGuides() {
      try {
        const [expertRes, guideRes] = await Promise.all([
          axios.get('http://localhost:1234/admin/get_users/sub_expert'),
          axios.get('http://localhost:1234/admin/get_users/guide'),
        ]);

        if (expertRes.status === 200) {
          const expertNames = expertRes.data.map((expert) => expert.name); // Assuming 'name' is the field
          setExpertsList(expertNames);
        }

        if (guideRes.status === 200) {
          const guideNames = guideRes.data.map((guide) => guide.name); // Assuming 'name' is the field
          setGuidesList(guideNames);
        }
      } catch (error) {
        console.error('Error fetching experts/guides:', error);
        alert('Failed to load experts and guides');
      } finally {
        setLoading(false);
      }
    }

    fetchExpertsAndGuides();
  }, []);

  return (
    <>
      <h2 className="text-3xl font-semibold mb-2 text-center mt-5 text-black">Post New Project</h2>
      <div className="min-h-screen flex justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
          {loading ? (
            <p className="text-center text-lg text-gray-600">Loading experts and guides...</p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Project Name */}
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

              {/* Cluster Name and Core */}
              <div className='grid grid-cols-2 gap-8'>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Core</label>
                  <select
                    required
                    value={core}
                    onChange={(e) => setCore(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
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

              {/* Select Experts */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Select at least 3 Experts:</h3>
                <div className="flex flex-wrap gap-3">
                  {expertsList.map((expert, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleExpertSelection(expert)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedExperts.includes(expert)
                          ? 'bg-purple-500 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                      }`}
                    >
                      {expert}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Guides */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Select at least 3 Guides:</h3>
                <div className="flex flex-wrap gap-3">
                  {guidesList.map((guide, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleGuideSelection(guide)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedGuides.includes(guide)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
                      }`}
                    >
                      {guide}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-md"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Project_Details;

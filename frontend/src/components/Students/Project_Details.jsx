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

  const team_id = localStorage.getItem("team_id"); // Or get from props/context
  const [projectId, setProjectId] = useState(null); // will get after project post

  const toggleExpertSelection = (expert) => {
    setSelectedExperts((prev) =>
      prev.includes(expert.reg_num)
        ? prev.filter((e) => e !== expert.reg_num)
        : [...prev, expert.reg_num]
    );
  };

  const toggleGuideSelection = (guide) => {
    setSelectedGuides((prev) =>
      prev.includes(guide.reg_num)
        ? prev.filter((g) => g !== guide.reg_num)
        : [...prev, guide.reg_num]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Post Project
      const res = await axios.post('http://localhost:1234/project/add', {
        projectName,
        clusterName,
        core,
        description,
        outcome,
        team_id,
      });

      if (res.status === 200 || res.status === 201) {
        const createdProjectId = res.data.project_id || res.data.insertId;
        setProjectId(createdProjectId);
        console.log("Project created:", createdProjectId);

        // Step 2: Send Guide Requests
        const guideRes = await axios.post('http://localhost:1234/guide/sent_request_to_guide', {
          from_team_id: team_id,
          project_id: createdProjectId,
          project_name: projectName,
          to_guide_reg_num: selectedGuides,
        });

        console.log("Guide response:", guideRes.data);

        // Step 3: Send Expert Requests
        const expertRes = await axios.post('http://localhost:1234/sub_expert/sent_request_to_expert', {
          from_team_id: team_id,
          project_id: createdProjectId,
          project_name: projectName,
          to_expert_reg_num: selectedExperts,
        });

        console.log("Expert response:", expertRes.data);

        alert("Project submitted and requests sent successfully!");

        // Reset form
        setProjectName('');
        setClusterName('');
        setCore('');
        setDescription('');
        setOutcome('');
        setSelectedExperts([]);
        setSelectedGuides([]);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error occurred during submission. Check console for details.");
    }
  };

  useEffect(() => {
    async function fetchExpertsAndGuides() {
      try {
        const [expertRes, guideRes] = await Promise.all([
          axios.get('http://localhost:1234/admin/get_users/sub_expert'),
          axios.get('http://localhost:1234/admin/get_users/guide'),
        ]);

        if (expertRes.status === 200) {
          setExpertsList(expertRes.data); // [{ name, reg_num }]
        }

        if (guideRes.status === 200) {
          setGuidesList(guideRes.data); // [{ name, reg_num }]
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full min-h-32 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Outcome</label>
                <textarea
                  required
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="mt-1 w-full min-h-24 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Select at Experts:</h3>
                <div className="flex flex-wrap gap-3">
                  {expertsList.map((expert, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleExpertSelection(expert)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedExperts.includes(expert.reg_num)
                          ? 'bg-purple-500 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                      }`}
                    >
                      {expert.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Select at Guides:</h3>
                <div className="flex flex-wrap gap-3">
                  {guidesList.map((guide, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleGuideSelection(guide)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedGuides.includes(guide.reg_num)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
                      }`}
                    >
                      {guide.name}
                    </button>
                  ))}
                </div>
              </div>

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

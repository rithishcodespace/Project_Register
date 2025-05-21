import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Project_Details = () => {
  const userselector = useSelector((State) => State.userSlice);
  const teamselector = useSelector((State) => State.teamSlice);
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [core, setCore] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');

  const [expertsList, setExpertsList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpertsAndGuides() {  
      try {
        const [expertRes, guideRes] = await Promise.all([
          axios.get('http://localhost:1234/admin/get_users/sub_expert',{withCredentials:true}),
          axios.get('http://localhost:1234/admin/get_users/guide',{withCredentials:true}),
        ]);

        if (expertRes.status === 200) setExpertsList(expertRes.data);
        if (guideRes.status === 200) setGuidesList(guideRes.data);
      } catch (err) {
        console.error('Fetch Error:', err);
        alert('Failed to load experts and guides.');
      } finally {
        setLoading(false);
      }
    }

    fetchExpertsAndGuides();
  }, []);

  const toggleExpertSelection = (reg_num) => {
    setSelectedExperts((prev) =>
      prev.includes(reg_num)
        ? prev.filter((e) => e !== reg_num)
        : [...prev, reg_num]
    );
  };

  const toggleGuideSelection = (reg_num) => {
    setSelectedGuides((prev) =>
      prev.includes(reg_num)
        ? prev.filter((g) => g !== reg_num)
        : [...prev, reg_num]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Submit project
      const response = await axios.post(
        `http://localhost:1234/student/addproject/${userselector.project_type}/${userselector.reg_num}`,
        {
          "project_name":projectName,
          "cluster":clusterName,
          "description":description,
          "outcome":outcome,
          "hard_soft":core
        },
        {
          withCredentials:true
        }
      );
      console.log(response.data); 

      const { message, project_id } = response.data;

      if (!project_id) throw new Error('Project ID not returned.');

      alert(message || 'Project added.');

      // Step 2: Send guide requests
      await axios.post('http://localhost:1234/guide/sent_request_to_guide', {
        "from_team_id": teamselector[0].team_id,
        "project_id":project_id,
        "project_name": projectName.trim(),
        "to_guide_reg_num": selectedGuides,
      },{withCredentials:true});

      // Step 3: Send expert requests
      await axios.post('http://localhost:1234/sub_expert/sent_request_to_expert', {
        "from_team_id": teamselector[0].team_id,
        "project_id":project_id,
        "project_name": projectName.trim(),
        "to_expert_reg_num": selectedExperts,
      },{withCredentials:true});

      alert('All requests sent successfully.');

      // Reset form
      setProjectName('');
      setClusterName('');
      setCore('');
      setDescription('');
      setOutcome('');
      setSelectedExperts([]);
      setSelectedGuides([]);
    } catch (error) {
      console.error('Submit Error:', error);
      alert(error?.response?.data?.message || 'Failed to submit project.');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Project Submission</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Cluster Name</label>
         <select
          value={clusterName}
          onChange={(e) =>setClusterName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select cluster</option>
          <option value="CSE">CSE</option>
          <option value="AIML">AIML</option>
          <option value="AIDS">AIDS</option>
          <option value="IT">IT</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medim">Hard-Soft</label>
        <select
          value={core}
          onChange={(e) => setCore(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={4}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Expected Outcome</label>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
          required
        />
      </div>

      {/* Expert Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select at least 3 Experts:</h3>
        <div className="flex flex-wrap gap-2">
          {expertsList.map((expert) => (
            <button
              key={expert.reg_num}
              type="button"
              onClick={() => toggleExpertSelection(expert.reg_num)}
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

      {/* Guide Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select at least 3 Guides:</h3>
        <div className="flex flex-wrap gap-2">
          {guidesList.map((guide) => (
            <button
              key={guide.reg_num}
              type="button"
              onClick={() => toggleGuideSelection(guide.reg_num)}
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
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit Project
        </button>
      </div>
    </form>
  );
};

export default Project_Details;

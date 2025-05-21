import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import instance from '../../utils/axiosInstance';

const Project_Details = () => {
  const userselector = useSelector((State) => State.userSlice);
  const teamselector = useSelector((State) => State.teamSlice);

  const  project_id  = teamselector.project_id; // Get project_id from URL

  // Form state
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
  const [loadingProject, setLoadingProject] = useState(false);

  // Fetch experts and guides on mount
  useEffect(() => {
    async function fetchExpertsAndGuides() {
      try {
        setLoading(true);
        const [expertRes, guideRes] = await Promise.all([
          instance.get('http://localhost:1234/admin/get_users/sub_expert', { withCredentials: true }),
          instance.get('http://localhost:1234/admin/get_users/guide', { withCredentials: true }),
        ]);
        if (expertRes.status === 200) setExpertsList(expertRes.data);
        if (guideRes.status === 200) setGuidesList(guideRes.data);
      } catch (err) {
        console.error('Error fetching experts/guides:', err);
        alert('Failed to load experts and guides.');
      } finally {
        setLoading(false);
      }
    }
    fetchExpertsAndGuides();
  }, []);

  // Fetch existing project details if project_id is present
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!project_id) return;

      try {
        setLoadingProject(true);
        const res = await instance.get(`http://localhost:1234/admin/getproject_by_team_id/${project_id}`, { withCredentials: true });
        if (res.status === 200 && res.data.length > 0) {
          console.log();
          
          const project = res.data[0];
          setProjectName(project.project_name || '');
          setClusterName(project.cluster || '');
          setCore(project.hard_soft || '');
          setDescription(project.description || '');
          setOutcome(project.outcome || '');

          // Optionally fetch and preselect guides/experts if your backend provides this info
          // Here you may add code to setSelectedGuides and setSelectedExperts if needed
        } else {
          alert('Project data not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        alert('Failed to fetch project details.');
      } finally {
        setLoadingProject(false);
      }
    }
    fetchProjectDetails();
  }, [project_id]);

  const toggleExpertSelection = (reg_num) => {
    setSelectedExperts((prev) =>
      prev.includes(reg_num) ? prev.filter((e) => e !== reg_num) : [...prev, reg_num]
    );
  };

  const toggleGuideSelection = (reg_num) => {
    setSelectedGuides((prev) =>
      prev.includes(reg_num) ? prev.filter((g) => g !== reg_num) : [...prev, reg_num]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedExperts.length < 3 || selectedGuides.length < 3) {
      alert('Please select at least 3 experts and 3 guides.');
      return;
    }

    try {
      let finalProjectId = project_id;

      // If no project_id, create new project
      if (!project_id) {
        const response = await instance.post(
          `http://localhost:1234/student/addproject/${userselector.project_type}/${userselector.reg_num}`,
          {
            project_name: projectName,
            cluster: clusterName,
            description,
            outcome,
            hard_soft: core,
          }
        );

        const { message, project_id: newId } = response.data;
        if (!newId) throw new Error('Project ID not returned from backend');
        alert(message || 'Project added.');
        finalProjectId = newId;
      } else {
        // You can add update API call here if you want to update the project info
        // For now, we just reuse the existing project_id to send requests
      }

      // Send guide requests
      await instance.post('/guide/sent_request_to_guide', {
        from_team_id: teamselector[0].team_id,
        project_id: finalProjectId,
        project_name: projectName.trim(),
        to_guide_reg_num: selectedGuides,
      });

      // Send expert requests
      await instance.post('/sub_expert/sent_request_to_expert', {
        from_team_id: teamselector[0].team_id,
        project_id: finalProjectId,
        project_name: projectName.trim(),
        to_expert_reg_num: selectedExperts,
      });

      alert('Requests sent successfully.');

      // Reset form if needed
      if (!project_id) {
        setProjectName('');
        setClusterName('');
        setCore('');
        setDescription('');
        setOutcome('');
        setSelectedExperts([]);
        setSelectedGuides([]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error?.response?.data?.message || 'Failed to submit project.');
    }
  };

  if (loading || loadingProject) return <div className="p-4">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-bold text-center mb-6">📄 Project Submission</h2>

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
          onChange={(e) => setClusterName(e.target.value)}
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
        <label className="block mb-1 font-medium">Hard-Soft</label>
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

      <div className="mb-4">
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
        <p className="text-sm mt-1 text-gray-500">Selected: {selectedExperts.length}</p>
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
        <p className="text-sm mt-1 text-gray-500">Selected: {selectedGuides.length}</p>
      </div>

      <div className="text-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all duration-200"
        >
          {project_id ? 'Update Project & Re-send Requests' : 'Submit Project'}
        </button>
      </div>
    </form>
  );
};

export default Project_Details;

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

// Helper component: Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Helper component: Readonly project details display
const ProjectDetailsView = ({ project }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow space-y-8">
      {/* Row 1: Project Name & Cluster */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex justify-between">
          <span className="font-semibold">Project Name:</span>
          <span>{project.project_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cluster:</span>
          <span>{project.cluster}</span>
        </div>
      </div>

      {/* Row 2: Project Type & Internal/External */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex justify-between">
          <span className="font-semibold">Project Type:</span>
          <span>{project.hard_soft}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Internal/External:</span>
          <span>{project.project_type}</span>
        </div>
      </div>

      {/* Row 3: Description */}
      <div>
        <h3 className="font-semibold mb-1">Description:</h3>
        <p className="text-gray-700">{project.description}</p>
      </div>

      {/* Row 4: Expected Outcome */}
      <div>
        <h3 className="font-semibold mb-1">Expected Outcome:</h3>
        <p className="text-gray-700">{project.outcome}</p>
      </div>
    </div>
  );
};

// Helper component: Experts and Guides Selector Buttons
const SelectorButtons = ({
  title,
  items,
  selectedItems,
  toggleSelection,
  colorClass,
  minSelectCount = 3,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">
        Select at least {minSelectCount} {title}:
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.reg_num}
            type="button"
            onClick={() => toggleSelection(item.reg_num)}
            className={`px-3 py-1 rounded-full border transition-colors duration-200 ${
              selectedItems.includes(item.reg_num)
                ? `${colorClass} text-white border-${colorClass.split('-')[1]}-600`
                : `bg-white text-gray-700 border-gray-300 hover:bg-${colorClass.split('-')[1]}-100`
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="text-sm mt-1 text-gray-500">
        Selected: {selectedItems.length}
      </p>
    </div>
  );
};

const Project_Details = () => {
  const userselector = useSelector((state) => state.userSlice);
  const teamselector = useSelector((state) => state.teamSlice);

  // Project ID from team slice
  const project_id = teamselector.length > 0 ? teamselector[0].project_id : null;

  // Form states
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [core, setCore] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');

  const [expertsList, setExpertsList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);

  // State to hold existing project data from backend
  const [existingProject, setExistingProject] = useState(null);

  // Errors for validation
  const [formError, setFormError] = useState('');

  // Fetch experts and guides on mount
  useEffect(() => {
    async function fetchExpertsAndGuides() {
      try {
        setLoading(true);
        const [expertRes, guideRes] = await Promise.all([
          instance.get('/admin/get_users/sub_expert', { withCredentials: true }),
          instance.get('/admin/get_users/guide', { withCredentials: true }),
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

  // Fetch existing project details by project_id
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!project_id) {
        setExistingProject(null);
        return;
      }
      try {
        setLoadingProject(true);
        const res = await instance.get(`/admin/getproject_by_team_id/${project_id}`, { withCredentials: true });
        if (res.status === 200 && res.data.length > 0) {
          const project = res.data[0]; // Assuming data is an array with project objects
          setExistingProject(project);

          // Pre-fill form state with fetched project data in case update is allowed
          setProjectName(project.project_name || '');
          setClusterName(project.cluster || '');
          setCore(project.hard_soft || '');
          setDescription(project.description || '');
          setOutcome(project.outcome || '');

          // TODO: If backend provides selected experts/guides, prefill selected arrays here

        } else {
          // No existing project
          setExistingProject(null);
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

  // Toggle expert selection
  const toggleExpertSelection = (reg_num) => {
    setSelectedExperts((prev) =>
      prev.includes(reg_num) ? prev.filter((e) => e !== reg_num) : [...prev, reg_num]
    );
  };

  // Toggle guide selection
  const toggleGuideSelection = (reg_num) => {
    setSelectedGuides((prev) =>
      prev.includes(reg_num) ? prev.filter((g) => g !== reg_num) : [...prev, reg_num]
    );
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (selectedExperts.length < 1 || selectedGuides.length < 1) {
      setFormError('Please select at least 1 experts and 1 guides.');
      return;
    }

    if (!projectName.trim() || !clusterName || !core || !description.trim() || !outcome.trim()) {
      setFormError('Please fill all required fields.');
      return;
    }

    try {
      let finalProjectId = project_id;

      // If no project exists, create new
      if (!project_id) {
        const response = await instance.post(
          `/student/addproject/${userselector.project_type}/${userselector.reg_num}`,
          {
            project_name: projectName,
            cluster: clusterName,
            hard_soft: core,
            description,
            outcome,
            sub_experts: selectedExperts,
            guides: selectedGuides,
          },
          { withCredentials: true }
        );

        if (response.status === 201 || response.status === 200) {
    alert('Project created successfully!');
    const fetchCreatedProject = await instance.get(
      `/admin/getproject_by_team_id/${response.data.project_id}`,
      { withCredentials: true }
    );
    if (fetchCreatedProject.status === 200 && fetchCreatedProject.data.length > 0) {
      setExistingProject(fetchCreatedProject.data[0]);
    }
  }else {
          alert('Failed to create project.');
        }
      } else {
        // TODO: Add update project logic if needed
        alert('Project update feature coming soon!');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error occurred while submitting the project.');
    }
  };

  if (loading || loadingProject) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-8 bg--100">
      {!existingProject ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white p-8 rounded shadow space-y-6"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Create Your Project</h1>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="projectName">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="clusterName">
              Cluster <span className="text-red-500">*</span>
            </label>
            <select
              id="clusterName"
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
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
            <label className="block mb-1 font-semibold">Type (Hardware/Software) <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['hardware', 'software'].map((type) => (
                <label key={type} className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="coreType"
                    value={type}
                    checked={core === type}
                    onChange={() => setCore(type)}
                    required
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows="4"
              placeholder="Write a detailed project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="outcome">
              Expected Outcome <span className="text-red-500">*</span>
            </label>
            <textarea
              id="outcome"
              rows="3"
              placeholder="Describe the expected outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Experts selection */}
          <SelectorButtons
            title="Sub Experts"
            items={expertsList}
            selectedItems={selectedExperts}
            toggleSelection={toggleExpertSelection}
            colorClass="bg-indigo-600"
            minSelectCount={3}
          />

          {/* Guides selection */}
          <SelectorButtons
            title="Guides"
            items={guidesList}
            selectedItems={selectedGuides}
            toggleSelection={toggleGuideSelection}
            colorClass="bg-green-600"
            minSelectCount={3}
          />

          {formError && (
            <p className="text-red-600 font-semibold text-center">{formError}</p>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded transition"
            >
              Submit Project
            </button>
          </div>
        </form>
      ) : (
        <ProjectDetailsView project={existingProject} />
      )}
    </div>
  );
};

export default Project_Details;

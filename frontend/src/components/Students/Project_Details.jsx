import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

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
  const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
    instance
      .get(`/student/get_project_details/${teamselector[0].project_id}`)
      .then((res) => {
        if (res.status === 200) {
          setIsSuccess(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching project details:", err);
      });
  }, []);

  return (
    <div>
      {isSuccess && <div>hello only</div>}
    </div>
  );


  useEffect(() => {
    async function fetchExpertsAndGuides() {  
      try {
        const [expertRes, guideRes] = await Promise.all([
          instance.get('http://localhost:1234/admin/get_users/sub_expert',{withCredentials:true}),
          instance.get('http://localhost:1234/admin/get_users/guide',{withCredentials:true}),
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
      const response = await instance.post(
        `http://localhost:1234/student/addproject/${userselector.project_type}/${userselector.reg_num}`,
        {
          "project_name":projectName,
          "cluster":clusterName,
          "description":description,
          "outcome":outcome,
          "hard_soft":core
        }
      );
      console.log(response.data); 

      const { message, project_id } = response.data;

      if (!project_id) throw new Error('Project ID not returned.');

      alert(message || 'Project added.');

      // Step 2: Send guide requests
      await instance.post('/guide/sent_request_to_guide', {
        "from_team_id": teamselector[0].team_id,
        "project_id":project_id,
        "project_name": projectName.trim(),
        "to_guide_reg_num": selectedGuides,
      });

      // Step 3: Send expert requests
      await instance.post('/sub_expert/sent_request_to_expert', {
        "from_team_id": teamselector[0].team_id,
        "project_id":project_id,
        "project_name": projectName.trim(),
        "to_expert_reg_num": selectedExperts,
      });

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

  return (<div>
      <h2 className="flex justify-center text-2xl font-bold mb-6">Project Submission</h2>
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">

      <div className="mb-4 bg-white ">
        <label className="block mb-1 bg-white font-medium">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full bg-white  border px-3 py-2 rounded"
          required
        />
      </div>
    <div className='flex col-span-2 gap-4 bg-white'>
      <div className="mb-4 w-[50%] bg-white ">
        <label className="block mb-1  bg-white font-medium">Cluster Name</label>
        <select
          value={clusterName}
          onChange={(e) =>{setClusterName(e.target.value),(console.log(e.target.value))}}
          className="w-full border px-3 py-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
           defaultValue=""
        >
         <option value="" disabled>
    Select cluster
  </option>
  {teamselector
    .filter(team => Boolean(team.dept))   // remove any empty/falsy dept
    .map((team, i) => (
      <option key={i} value={team.dept}>
        {team.dept}
      </option>
    ))}
        </select>

      </div>

      <div className="mb-4 bg-white w-[50%]">
        <label className="block mb-1  bg-white  font-medim">Project Type</label>
        <select
          value={core}
          onChange={(e) => setCore(e.target.value)}
          className="w-full bg-white  border px-3 py-2 rounded"
          required
        >
          <option  bg-white  value="" disabled>Select</option>
          <option  bg-white  value="hardware">Hardware</option>
          <option  bg-white  value="software">Software</option>
        </select>
      </div>
    </div>
      <div className="mb-4 bg-white ">
        <label className="block bg-white  mb-1 font-medium">Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full  bg-white border px-3 py-2 rounded"
          rows={4}
          required
        />
      </div>

      <div className="mb-6 bg-white ">
        <label className="block mb-1 bg-white  font-medium">Expected Outcome</label>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="w-full border px-3 py-2 bg-white  rounded"
          rows={3}
          required
        />
      </div>

      {/* Expert Selection */}
      <div className="mb-6 bg-white ">
        <h3 className="text-md  bg-white font- mb-2">Select Subject Experts:</h3>
        <div className="flex flex-wrap bg-white  gap-2">
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
      <div className="mb-6 bg-white ">
        <h3 className="text-md bg-white  font- mb-2">Select Guides:</h3>
        <div className="flex  bg-white flex-wrap gap-2">
          {guidesList.map((guide) => (
            <button
              key={guide.reg_num}
              type="button"
              onClick={() => toggleGuideSelection(guide.reg_num)}
              className={`px-3 py-1 rounded-full border ${
                selectedGuides.includes(guide.reg_num)
                  ? 'bg-purple-500 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
              }`}
            >
              {guide.name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center bg-white ">
        <button
          type="submit"
          className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
        >
          Submit Project
        </button>
      </div>
    </form></div>
  );
};

export default Project_Details;

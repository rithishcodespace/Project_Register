import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Project_Details = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStatus, setUserStatus] = useState('loading');
  const [myProject, setMyProject] = useState(null);

  const selector = useSelector((Store) => Store.userSlice);
  const teamMembers = useSelector((Store) => Store.teamSlice);
  const teamStatus = useSelector((Store) => Store.teamStatusSlice);

  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  const [expertsList, setExpertsList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);

  const toggleExpertSelection = (expertName) => {
    setSelectedExperts((prev) =>
      prev.includes(expertName) ? prev.filter((e) => e !== expertName) : [...prev, expertName]
    );
  };

  const toggleGuideSelection = (guideName) => {
    setSelectedGuides((prev) =>
      prev.includes(guideName) ? prev.filter((g) => g !== guideName) : [...prev, guideName]
    );
  };

  const startIndex = page * rowsPerPage;
  const pageCount = Math.ceil(projectData.length / rowsPerPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const paginatedProjects = projectData.slice(startIndex, startIndex + rowsPerPage);

  function checkUserStatus() {
    try {
      if (!teamStatus.teamConformationStatus) {
        setUserStatus('no_team');
      } else {
        const member = teamStatus?.teamMembers?.[0];
        if (member?.project_id) {
          setUserStatus('has_project');
        } else {
          setUserStatus('no_project');
        }
      }
    } catch (e) {
      console.error('Invalid teamStatus in store', e);
      setUserStatus('no_team');
    }
  }

  async function fetchProjects() {
    try {
      const token = localStorage.getItem('accessToken');
      const departments = [
        ...new Set([
          ...teamMembers.map((member) => member.dept),
          teamStatus.teamLeader.dept,
        ]),
      ];

      const response = await axios.post(
        'http://localhost:1234/student/projects',
        { departments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setProjectData(response.data);
      } else {
        alert('Error fetching projects');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Something went wrong');
    }
  }

  async function fetchExpertsAndGuides() {
    try {
      const [expertRes, guideRes] = await Promise.all([
        axios.get('http://localhost:1234/student/fetch_guide_or_expert/sub_expert'),
        axios.get('http://localhost:1234/student/fetch_guide_or_expert/guide'),
      ]);

      if (expertRes.status === 200) setExpertsList(expertRes.data);
      if (guideRes.status === 200) setGuidesList(guideRes.data);
    } catch (error) {
      console.error('Error fetching experts/guides:', error);
      alert('Failed to load experts and guides');
    }
  }

 async function handleTakeProject(name, id, experts, guides) {
  console.log("Selected Experts:", experts);
  console.log("Selected Guides:", guides);

  // if (!experts || !guides || experts.length < 3 || guides.length < 3) {
  //   alert('Please select at least 3 experts and 3 guides');
  //   return;
  // }

  try {
    const response = await axios.patch(
      `http://localhost:1234/student/ongoing/${name}`,
      { expert: experts, guide: guides },
      { withCredentials: true }
    );

    if (response.status === 200) {
      alert('Project chosen successfully!');
      setProjectData((prev) =>
        prev.filter((proj) => proj.project_name !== name)
      );
      setSelectedProject(null);
      setUserStatus('has_project');
      setMyProject(selectedProject);
      setSelectedExperts([]);
      setSelectedGuides([]);
    }

    const newresponse = await axios.patch(
      `http://localhost:1234/student/assign_project_id/${id}/${selector.reg_num}`,
      { expert: experts, guide: guides },
      { withCredentials: true }
    );

    if (newresponse.status === 200) {
      console.log('project_id successfully inserted into db!');
    }
  } catch (error) {
    console.error('Error choosing project:', error);
    alert('Something went wrong while choosing project');
  }
}


  async function fetchMyProject() {
    try {
      const token = localStorage.getItem('accessToken');
      const member = teamStatus?.teamMembers?.[0];

      if (member?.project_id) {
        const response = await axios.get(
          `http://localhost:1234/student/get_project_details/${member.project_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          setMyProject(response.data[0]);
        } else {
          alert('Error fetching your project details');
        }
      }
    } catch (error) {
      console.error('Error in fetchMyProject:', error);
    }
  }

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (userStatus === 'no_project') {
      fetchProjects();
    } else if (userStatus === 'has_project') {
      fetchMyProject();
    }
    fetchExpertsAndGuides();
  }, [userStatus]);

  const handleRowClick = (projectId) => {
    const selected = projectData.find((proj) => proj.project_id === projectId);
    setSelectedProject(selected);
  };

  if (userStatus === 'no_team') {
    return (
      <div className="flex justify-center items-center mt-20">
        <h1 className="text-2xl font-bold text-red-500">First Form a Team!!</h1>
      </div>
    );
  }

  if (userStatus === 'has_project' && myProject) {
    return (
      <div className="p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Your Assigned Project
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-xl">
          <p className="bg-white"><strong className="bg-white">Name:</strong> {myProject.project_name}</p>
          <p className="bg-white"><strong className="bg-white">Cluster:</strong> {myProject.cluster}</p>
          <p className="bg-white"><strong className="bg-white">Description:</strong> {myProject.description}</p>

          <div className="mt-4 bg-white">
            <h4 className="text-lg font-bold bg-white text-purple-600 mb-2">Project Phases :</h4>
            <div className="space-y-2 bg-white text-sm">
              {[1, 2, 3, 4, 5].map((phase) => (
                <p key={phase} className="bg-white">
                  Phase {phase}: {myProject[`phase${phase}`] || 'Not updated'}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Available Projects</h1>

      {/* Project Table */}
      <div className="overflow-x-auto border rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-700 to-pink-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left bg-white text-black">Project ID</th>
              <th className="px-6 py-3 text-left bg-white text-black">Project Name</th>
              <th className="px-6 py-3 text-left bg-white text-black">Cluster</th>
              <th className="px-6 py-3 text-left bg-white text-black">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProjects.map((proj) => (
              <tr
                key={proj.project_id}
                className="hover:bg-purple-100 cursor-pointer"
                onClick={() => handleRowClick(proj.project_id)}
              >
                <td className="px-6 py-4 bg-white">{proj.project_id}</td>
                <td className="px-6 py-4 bg-white">{proj.project_name}</td>
                <td className="px-6 py-4 bg-white">{proj.cluster}</td>
                <td className="px-6 py-4 bg-white">{proj.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Rows per page:
          <select
            className="ml-2 rounded px-2 py-1 shadow focus:outline-none "
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
          >
            {[5, 10, 25].map((rows) => (
              <option key={rows} value={rows}>{rows}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mt-4 px-4">
          <span className="text-sm text-gray-700">
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, projectData.length)} of {projectData.length}
          </span>
        
          <div className="flex items-center">
            <button
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              className="px-2 py-1 rounded mr-2"
            >
              <FaChevronLeft color={page === 0 ? '#A0A0A0' : '#000000'} />
            </button>

            <button
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= pageCount - 1}
              className="px-2 py-1 rounded"
            >
              <FaChevronRight color={page >= pageCount - 1 ? '#A0A0A0' : '#000000'} />
            </button>
            <Link to="/upload-project-files" className="text-blue-600 hover:underline">
  Go to Project File Upload
</Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-7 max-w-3xl w-full relative">
            <button
              onClick={() => {
                setSelectedProject(null);
                setSelectedExperts([]);
                setSelectedGuides([]);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              &#10005;
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
              Select Project: {selectedProject.project_name}
            </h2>

            <div className="mb-4">
              <p><strong>Project ID:</strong> {selectedProject.project_id}</p>
              <p><strong>Cluster:</strong> {selectedProject.cluster}</p>
              <p><strong>Description:</strong> {selectedProject.description}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Select at least 3 Experts:</h3>
              <div className="flex flex-wrap gap-3">
                {expertsList.map((expert) => (
                  <button
                    key={expert.reg_num}
                    onClick={() => toggleExpertSelection(expert.name)}
                    className={`px-3 py-1 rounded-full border ${
<<<<<<< HEAD
                      selectedExperts.includes(expert.name)
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
=======
                      selectedExperts.includes(expert)
                        ? 'bg-purple-300 text-black border-purple-400'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-grey-300'
>>>>>>> 787ac75059fe081e53b3f20cb5a240699b1d5f7e
                    }`}
                  >
                    {expert.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Select at least 3 Guides:</h3>
              <div className="flex flex-wrap gap-3">
                {guidesList.map((guide) => (
                  <button
                    key={guide.reg_num}
                    onClick={() => toggleGuideSelection(guide.name)}
                    className={`px-3 py-1 rounded-full border ${
<<<<<<< HEAD
                      selectedGuides.includes(guide.name)
                        ? 'bg-green-600 text-white border-green-600'
=======
                      selectedGuides.includes(guide)
                        ? 'bg-purple-300 text-black border-purple-400'
>>>>>>> 787ac75059fe081e53b3f20cb5a240699b1d5f7e
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                    }`}
                  >
                    {guide.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                handleTakeProject(
                  selectedProject.project_name,
                  selectedProject.project_id,
                  selectedExperts,
                  selectedGuides
                )
              }
              className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Take Project
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Project_Details;

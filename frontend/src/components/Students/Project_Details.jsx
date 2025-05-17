import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination
} from '@mui/material';

const Project_Details = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State to hold all projects available for selection
  const [projectData, setProjectData] = useState([]);

  // State for the currently selected project in the modal
  const [selectedProject, setSelectedProject] = useState(null);

  // User status: "loading" | "no_team" | "no_project" | "has_project"
  const [userStatus, setUserStatus] = useState('loading');

  // State for project assigned to the user's team
  const [myProject, setMyProject] = useState(null);

  // Redux selectors
  const selector = useSelector((Store) => Store.userSlice);
  const teamMembers = useSelector((Store) => Store.teamSlice);
  const teamStatus = useSelector((Store) => Store.teamStatusSlice);

  // State for selected experts and guides (multiple selections)
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  // List of experts (hardcoded for now, can be dynamic later)
  const expertsList = ['Expert A', 'Expert B', 'Expert C', 'Expert D', 'Expert E'];

  // List of guides (hardcoded for now, can be dynamic later)
  const guidesList = ['Guide X', 'Guide Y', 'Guide Z', 'Guide W', 'Guide V'];

  // Toggle expert selection
  const toggleExpertSelection = (expertName) => {
    setSelectedExperts((prev) => {
      if (prev.includes(expertName)) {
        return prev.filter((e) => e !== expertName);
      } else {
        return [...prev, expertName];
      }
    });
  };

  // Toggle guide selection
  const toggleGuideSelection = (guideName) => {
    setSelectedGuides((prev) => {
      if (prev.includes(guideName)) {
        return prev.filter((g) => g !== guideName);
      } else {
        return [...prev, guideName];
      }
    });
  };

  // Check user status based on team info
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProjects = projectData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Fetch projects filtered by team departments
  async function fetchProjects() {
    try {
      const token = localStorage.getItem('accessToken');

      // Get unique departments from team members + team leader
      const departments = [
        ...new Set([
          ...teamMembers.map((member) => member.dept),
          teamStatus.teamLeader.dept
        ])
      ];

      const response = await axios.post(
        'http://localhost:1234/student/projects',
        { departments },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  // Assign project with experts and guides
  async function handleTakeProject(name, id, experts, guides) {
    if (!experts || !guides || experts.length < 3 || guides.length < 3) {
      alert('Please select at least 3 experts and 3 guides');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:1234/student/ongoing/${name}`,
        {
          expert: experts,
          guide: guides
        },
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

      // Assign project ID to student
      const newresponse = await axios.patch(
        `http://localhost:1234/student/assign_project_id/${id}/${selector.reg_num}`,
        {
          expert: experts,
          guide: guides
        },
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

  // Fetch assigned project details
  async function fetchMyProject() {
    try {
      const token = localStorage.getItem('accessToken');
      const member = teamStatus?.teamMembers?.[0];

      if (member?.project_id) {
        const response = await axios(
          `http://localhost:1234/student/get_project_details/${member.project_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
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

  // On mount, check user status
  useEffect(() => {
    checkUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch projects or assigned project based on user status
  useEffect(() => {
    if (userStatus === 'no_project') {
      fetchProjects();
    } else if (userStatus === 'has_project') {
      fetchMyProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStatus]);

  // Set selected project on row click
  const handleRowClick = (projectId) => {
    const selected = projectData.find((proj) => proj.project_id === projectId);
    setSelectedProject(selected);
  };

  // Render no team message
  if (userStatus === 'no_team') {
    return (
      <div className="flex justify-center items-center mt-20">
        <h1 className="text-2xl font-bold text-red-500">First Form a Team!!</h1>
      </div>
    );
  }

  // Render assigned project details
  if (userStatus === 'has_project' && myProject) {
    return (
      <div className="p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Your Assigned Project
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-xl">
          <p>
            <strong>Name:</strong> {myProject.project_name}
          </p>
          <p>
            <strong>Cluster:</strong> {myProject.cluster}
          </p>
          <p>
            <strong>Description:</strong> {myProject.description}
          </p>

          <div className="mt-4">
            <h4 className="text-lg font-bold text-purple-600 mb-2">Project Phases</h4>
            <div className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5].map((phase) => (
                <p key={phase}>
                  Phase {phase}: {myProject[`phase${phase}`] || 'Not updated'}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render available projects list
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        Available Projects
      </h1>
      <Paper
        className="w-full overflow-hidden shadow-lg border"
        sx={{
          width: '90%',
          marginLeft: '5%',
          borderRadius: "10px",
          overflow: 'hidden',
          paddingTop: 2,
          paddingRight: 2,
          paddingLeft: 2
        }}
      >
        <TableContainer
          className="max-h-[500px] overflow-y-auto scrollbar-hide"
          sx={{ maxHeight: 500 }}
        >
          <Table stickyHeader aria-label="project table">
            <TableHead>
              <tr className="h-12 rounded-lg bg-gradient-to-r from-purple-700 to-pink-600 text-white text-left">
                <th className="p-4">Project ID</th>
                <th className="p-4">Project Name</th>
                <th className="p-4">Cluster</th>
                <th className="p-4">Description</th>
              </tr>
            </TableHead>
            <TableBody className="bg-white">
              {paginatedProjects.map((proj) => (
                <tr
                  key={proj.project_id}
                  onClick={() => handleRowClick(proj.project_id)}
                  className="cursor-pointer hover:bg-purple-100"
                >
                  <td className="p-4 border-b">{proj.project_id}</td>
                  <td className="p-4 border-b">{proj.project_name}</td>
                  <td className="p-4 border-b">{proj.cluster}</td>
                  <td className="p-4 border-b">{proj.description}</td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={projectData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Modal for project selection */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full relative">
            <button
              onClick={() => {
                setSelectedProject(null);
                setSelectedExperts([]);
                setSelectedGuides([]);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              &#10005; {/* X close button */}
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
                    key={expert}
                    onClick={() => toggleExpertSelection(expert)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedExperts.includes(expert)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                    }`}
                  >
                    {expert}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Select at least 3 Guides:</h3>
              <div className="flex flex-wrap gap-3">
                {guidesList.map((guide) => (
                  <button
                    key={guide}
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

            <button
              onClick={() =>
                handleTakeProject(
                  selectedProject.project_name,
                  selectedProject.project_id,
                  selectedExperts,
                  selectedGuides
                )
              }
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
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

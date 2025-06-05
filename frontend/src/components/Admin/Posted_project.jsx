import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Users, User, Calendar, Settings, BookOpen, FileText } from 'lucide-react';
import instance from '../../utils/axiosInstance';

const Posted_project = () => {
  const [projectData, setProjectData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const getProjects = async () => {
    try {
      const res = await instance.get('/admin/get_all_projects');
      const projects = res.data;

      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          try {
            const teamRes = await instance.get(`/guide/gets_entire_team/${project.team_id}`);
            const team = teamRes.data;
            return { ...project, team_members: team };
          } catch (teamError) {
            console.error(`Error fetching team for project ${project.project_id}:`, teamError.message);
            return { ...project, team_members: [] };
          }
        })
      );

      setProjectData(enrichedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  useEffect(() => {
    getProjects();
  }, []);

  useEffect(() => {
    console.log("Project data with teams:", projectData);
  }, [projectData]);

  const startIndex = currentPage * rowsPerPage;
  const currentData = projectData.slice(startIndex, startIndex + rowsPerPage);
  const pageCount = Math.ceil(projectData.length / rowsPerPage);

  if (selectedProject) {
    const leader = selectedProject.team_members?.find(member => member.role === 'leader');

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-300 transition-colors duration-200 mb-6"
            >
              <ArrowLeft size={18} className='bg-white'/>
              Back to Projects
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Project Details</h1>
              <div className="w-16 h-0.5 bg-gray-400 mx-auto"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="bg-white p-6 border-b border-gray-200">
              <h2 className="bg-white text-2xl font-bold text-gray-800 mb-3">{selectedProject.project_name}</h2>
              <div className="bg-white flex flex-wrap gap-4 text-gray-600">
                <span className="bg-white flex items-center gap-2">
                  <Settings size={16} className='bg-white '/>
                  Project ID: {selectedProject.project_id}
                </span>
                <span className="bg-white flex items-center gap-2">
                  <Users size={16} className='bg-white'/>
                  Team ID: {selectedProject.team_id}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-700">
                  {selectedProject.cluster}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="bg-white flex items-center gap-2 mb-4">
                  <FileText className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-lg font-semibold text-gray-800">Project Description</h3>
                </div>
                <p className="bg-white text-gray-600 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="bg-white flex items-center gap-2 mb-4">
                  <Users className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-lg font-semibold text-gray-800">Team Members</h3>
                </div>
                <div className="bg-white space-y-3">
                  {selectedProject.team_members?.map((member, index) => (
                    <div key={index} className="bg-gray-50 flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 flex-1">
                        <div className="bg-gray-50 flex items-center gap-2 mb-1">
                          <span className="bg-gray-50 font-medium text-gray-800">{member.name}</span>
                          {member.role === 'leader' && (
                            <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              Team Leader
                            </span>
                          )}
                        </div>
                        <p className="bg-gray-50 text-sm text-gray-600">{member.email}</p>
                      </div>
                      <div className="bg-gray-50 text-right">
                        <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                          {member.reg_no}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="bg-white flex items-center gap-2 mb-4">
                  <Calendar className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-lg font-semibold text-gray-800">Progress Status</h3>
                </div>
                <div className="bg-white space-y-4">
                  <div>
                    <div className="bg-white text-sm text-gray-600 font-medium ">Completed Review</div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <span className="bg-white text-gray-800 font-semibold">{selectedProject.completed_review}/2</span>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white text-sm text-gray-600 font-medium ">Verified Week</div>
                    <div className="bg-white  p-3 rounded border border-gray-200">
                      <span className="bg-white text-gray-800 font-semibold">{selectedProject.verified_week}/12</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="bg-white flex items-center gap-2 mb-4">
                  <BookOpen className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-lg font-semibold text-gray-800">Supervision</h3>
                </div>
                <div className="bg-white space-y-4">
                  <div>
                    <div className="bg-white text-sm text-gray-600 font-medium ">Subject Expert</div>
                    <div className="bg-white  p-3 rounded border border-gray-200">
                      <span className="bg-white text-gray-800 font-semibold">{selectedProject.team_members[0].sub_expert_reg_num}</span>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white text-sm text-gray-600 font-medium ">Project Guide</div>
                    <div className="bg-white  p-3 rounded border border-gray-200">
                      <span className="bg-white text-gray-800 font-semibold">{selectedProject.team_members[0].guide_reg_num}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-10 mr-10 justify-center mt-5">
      <div className="relative mb-8 px-10">
        <h2 className="text-3xl font-bold text-center">Posted Projects</h2>
      </div>

   <div className="w-full bg-white shadow-md rounded-lg p-5 overflow-x-auto">
  <div className="min-w-[800px]">
    <table className="w-full border-none bg-white" style={{ tableLayout: 'fixed' }}>

          <thead className='bg-white m-5 border-b'>
            <tr className="bg-white m-5">
              <th className="p-2 w-[15%] bg-white">Team ID</th>
              <th className="p-2 w-[25%] bg-white">Project Name</th>
              <th className="p-2 w-[12%] bg-white">Cluster</th>
              <th className="p-2 w-[20%] bg-white">Subject Expert</th>
              <th className="p-2 w-[18%] bg-white">Guide</th>
              <th className="p-2 w-[10%] bg-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.team_id || row.project_id} className="text-center border-t">
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    {row.team_id || 'N/A'}
                  </div>
                </td>
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    {row.project_name}
                  </div>
                </td>
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    {row.cluster}
                  </div>
                </td>
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    {row.team_members[0]?.sub_expert_reg_num || 'N/A'}
                  </div>
                </td>
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    {row.team_members[0]?.guide_reg_num || 'N/A'}
                  </div>
                </td>
                <td className="p-2 bg-white h-[48px] align-middle">
                  <div className="flex justify-center bg-white items-center h-[36px]">
                    <button
                      onClick={() => handleViewProject(row)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                      title="View Details"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex justify-between mr-0 mt-4 items-center p-4">
        <div>
          Rows per page:
          <select
            className="ml-2 rounded px-1 py-1 border-purple-600 focus:outline-none focus:ring-2"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
          >
            {[5, 10, 15].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <span className="mr-4">
            {startIndex + 1}–{Math.min(startIndex + rowsPerPage, projectData.length)} of {projectData.length}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-2 py-1 rounded mr-2"
            title="Previous Page"
          >
            <ChevronLeft color={currentPage === 0 ? '#A0A0A0' : '#000000'} />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            className="px-2 py-1 rounded"
            title="Next Page"
          >
            <ChevronRight color={currentPage >= pageCount - 1 ? '#A0A0A0' : '#000000'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Posted_project;

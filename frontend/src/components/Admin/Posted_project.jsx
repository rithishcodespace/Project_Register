import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Link } from 'react-router-dom';

const columns = [
  { id: 'project_id', label: 'Project ID', minWidth: 100 },
  { id: 'project_name', label: 'Project Name', minWidth: 200 },
  { id: 'cluster', label: 'Cluster', minWidth: 100 },
  { id: 'description', label: 'Description', minWidth: 300 },
];

const Posted_project = () => {
  const [projectData, setProjectData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const getProjects = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:1234/teacher/getprojects", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken?.trim()}`,
        },
      });

      if (response.status === 200) {
        setProjectData(response.data);
      } else {
        alert("No project data found.");
      }
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (project) => {
    window.location.href = `/admin/posted_projects/${project.project_id}`;
  };

  return (<><h2 className="text-3xl  font-bold text-center  mb-6">
        Posted Projects
      </h2>
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader aria-label="project table">
          <TableHead>
                        <tr className="bg-black border-b">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-4 py-2 text-left font-bold border-r `}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
          </TableHead>
          <TableBody>
            {projectData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((project, index) => (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={index}
                onClick={() => handleRowClick(project)}
                style={{ cursor: 'pointer' }}
              >
                {columns.map((column) => {
                  const value = project[column.id];
                  return (
                    <TableCell key={column.id}>
                      {value || "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={projectData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper></>
  );
};

export default Posted_project;

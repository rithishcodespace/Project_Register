import React from 'react';

const StudentProgress = () => {
  const studentProjects = [
    {
      id: 1,
      teamcode: 'C2-INT-T01',
      phase: 'Phase 1',
      status: 'Completed',
      deadline: '5 days',
    },
    {
      id: 2,
      teamcode: 'C2-INT-T01',
      phase: 'Phase 2',
      status: 'Pending',
      deadline: '3 days',
    },
    {
      id: 3,
      teamcode: 'C2-INT-T01',
      phase: 'Phase 3',
      status: 'Pending',
      deadline: '3 days',
    },
    {
      id: 4,
      teamcode: 'C4-EXT-T03',
      phase: 'Phase 1',
      status: 'Completed',
      deadline: '4 days',
    },
    {
      id: 5,
      teamcode: 'C4-EXT-T03',
      phase: 'Phase 2',
      status: 'Completed',
      deadline: '3 days',
    },
    {
      id: 6,
      teamcode: 'C4-EXT-T03',
      phase: 'Phase 3',
      status: 'Pending',
      deadline: '6 days',
    },
  ];

  const columns = [
    { field: 'teamcode', headerName: 'Team Code', width: 180 },
    { field: 'phase', headerName: 'Phase', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <span style={{ color: params.value === 'Completed' ? 'green' : 'red', fontWeight: 'bold' }}>
          {params.value}
        </span>
      ),
    },
    { field: 'deadline', headerName: 'Deadline', width: 140 },
  ];

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ mt: 4 }}>
        Student Progress
      </Typography>
      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={studentProjects}
          columns={columns}
          pageSize={6}
          rowsPerPageOptions={[6]}
          disableSelectionOnClick
        />
      </Box>
    </Container>
  );
};

export default StudentProgress;

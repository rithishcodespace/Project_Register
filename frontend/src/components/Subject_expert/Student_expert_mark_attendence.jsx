import React, { useState, useEffect, useRef } from 'react';

function Student_expert_mark_attendence() {
  const [scheduledProjects, setScheduledProjects] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const inputRefs = useRef({}); // to store refs per project

  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        projectName: 'Smart Attendance System',
        teamLead: 'Keerthana M',
        scheduledDateTime: '2025-05-12T10:00',
        status: 'Scheduled',
      },
      {
        id: 2,
        projectName: 'AI-Based Traffic Control',
        teamLead: 'Rahul S',
        scheduledDateTime: '2025-05-14T11:30',
        status: 'Scheduled',
      },
      {
        id: 3,
        projectName: 'E-Voting Platform',
        teamLead: 'Divya R',
        scheduledDateTime: '2025-05-16T14:00',
        status: 'Scheduled',
      },
    ];

    setScheduledProjects(sampleData);
    setOriginalProjects(sampleData);

    // Initialize refs for each project
    const refs = {};
    sampleData.forEach((project) => {
      refs[project.id] = React.createRef();
    });
    inputRefs.current = refs;
  }, []);

  const handleSave = (projectId) => {
    const newDateTime = inputRefs.current[projectId].current.value;
    const isValid = validateSchedule(newDateTime);
    if (!isValid) return;

    const updatedProjects = scheduledProjects.map((project) =>
      project.id === projectId ? { ...project, scheduledDateTime: newDateTime } : project
    );
    setScheduledProjects(updatedProjects);
  };

  const handleCancel = (projectId) => {
    const originalProject = originalProjects.find((project) => project.id === projectId);
    const updatedProjects = scheduledProjects.map((project) =>
      project.id === projectId ? { ...project, scheduledDateTime: originalProject.scheduledDateTime } : project
    );
    setScheduledProjects(updatedProjects);
    inputRefs.current[projectId].current.value = originalProject.scheduledDateTime;
  };

  const validateSchedule = (dateTimeStr) => {
    const now = new Date();
    const selected = new Date(dateTimeStr);
    const diffDays = Math.floor((selected - now) / (1000 * 60 * 60 * 24));
    const selectedHour = selected.getHours();

    if (
      selected <= now ||
      diffDays > 90 ||
      selectedHour < 9 ||
      selectedHour >= 18
    ) {
      return false;
    }
    return true;
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-black">
        Schedule Projects for Review
      </h2>

      {scheduledProjects.length === 0 ? (
        <p className="text-gray-500">No projects scheduled for review yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduledProjects.map((project) => {
            const isValid = validateSchedule(project.scheduledDateTime);

            return (
              <div
                key={project.id}
                className="p-5 bg-white  border rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl  bg-white font-semibold text-gray-800">{project.projectName}</h3>
                <p className="text-gray-600  bg-white mt-2">Team Lead: {project.teamLead}</p>
                <p className="text-gray-500 bg-white  mt-1">
                  Current Schedule:{' '}
                  {new Date(project.scheduledDateTime).toLocaleString()}
                </p>

                {/* DateTime Input */}
                <div className="flex flex-col  bg-white mt-4">
                  <label className="text-gray-700 bg-white ">New Schedule (Date & Time):</label>
                  <input
                    type="datetime-local"
                    defaultValue={project.scheduledDateTime}
                    ref={inputRefs.current[project.id]}
                    className="mt-2 p-2 bg-white  border rounded"
                  />
                </div>

                <div className="mt-4  bg-white flex justify-between items-center">
                  <button
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={() => handleSave(project.id)}
                  >
                    Save Schedule
                  </button>
                  
                </div>

                {!validateSchedule(project.scheduledDateTime) && (
                  <p className="text-red-500 text-sm  bg-white mt-2">
                    Invalid: Date must be after today, within 90 days, and time between 9AM–6PM.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Student_expert_mark_attendence;

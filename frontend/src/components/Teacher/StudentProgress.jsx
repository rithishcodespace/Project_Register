import React from 'react';

const StudentProgress = () => {
  const studentProjects = [
    {
      teamcode:"C2-INT-T01",
      progress: [
        { phase: "Phase 1", status: "Completed", deadline: "5 days" },
        { phase: "Phase 2", status: "Pending", deadline: "3 days" },
        { phase: "Phase 3", status: "Pending", deadline: "3 days" },
      ],
    },
    {
      teamcode:"C4-EXT-T03",
      progress: [
        { phase: "Phase 1", status: "Completed", deadline: "4 days" },
        { phase: "Phase 2", status: "Completed", deadline: "3 days" },
        { phase: "Phase 3", status: "Pending", deadline: "6 days" },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">Student Progress</h2>

      <div className="space-y-8">
        {studentProjects.map((project, i) => (
          <div key={i} className="border border-gray-300 rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-gray-800">Team Code : {project.teamcode}</h3>
            <table className="w-full text-left border border-black mt-2">
              <thead className="bg-purple-100 text-purple-800">
                <tr>
                  <th className="py-2 px-4 border border-black">Phase</th>
                  <th className="py-2 px-4 border border-black">Status</th>
                  <th className="py-2 px-4 border border-black">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {project.progress.map((phase, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border border-black">{phase.phase}</td>
                    <td className={`py-2 px-4 border border-black ${phase.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
                      {phase.status}
                    </td>
                    <td className="py-2 px-4 border border-black">{phase.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProgress;

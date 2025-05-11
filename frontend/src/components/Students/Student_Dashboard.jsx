import React from 'react';

function Student_Dashboard() {
  // Dummy data (replace with API call later)
  const team = {
    members: ['John', 'Jane', 'Doe', 'Smith'],
    status: 'Confirmed',
  };

  const project = {
    title: 'AI Chatbot for College',
    domain: 'AI/ML',
    status: 'Approved',
  };

  const guide = 'Dr. A. Kumar';
  const expert = 'Prof. S. Meena';

  const overallProgress = 65; // percentage

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">🎓 Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Info Card */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">👥 Team Status</h2>
          <p><strong>Members:</strong> {team.members.join(', ')}</p>
          <p><strong>Status:</strong> {team.status}</p>
        </div>

        {/* Project Info Card */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">📁 Project Details</h2>
          <p><strong>Title:</strong> {project.title}</p>
          <p><strong>Domain:</strong> {project.domain}</p>
          <p><strong>Status:</strong> {project.status}</p>
        </div>

        {/* Guide & Expert Info */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">🧑‍🏫 Guide & Expert</h2>
          <p><strong>Guide:</strong> {guide}</p>
          <p><strong>Expert:</strong> {expert}</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Overall Progress</h2>
          <div className="relative w-full h-4 bg-gray-300 rounded-lg">
            <div
              className="absolute top-0 left-0 h-4 bg-green-500 rounded-lg"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2">{overallProgress}% Completed</p>
        </div>
      </div>
    </div>
  );
} 

export default Student_Dashboard;

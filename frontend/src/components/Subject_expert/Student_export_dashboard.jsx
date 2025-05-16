import React from 'react';

const SubjectExpertDashboard = () => {
  return (
    <div className="flex">
      <div className="flex-1 p-10">
        <h1 className="text-3xl flex justify-center font-semibold mb-8">Dashboard</h1>
        <button
          className="bg-blue-600 flex text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Invitations
        </button>
      </div>
    </div>
  );
};

export default SubjectExpertDashboard;

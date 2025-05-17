import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const SubjectExpertDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Simulated API response
    setTimeout(() => {
      setInvitations([
        {
          from_team_id: 'Team Alpha',
          project_name: 'AI Chatbot',
        },
        {
          from_team_id: 'Team Beta',
          project_name: 'Smart Traffic System',
        },
      ]);
    }, 1000);
  }, []);

  const handleAccept = (teamId) => {
    console.log(`Accepted: ${teamId}`);
    setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
  };

  const handleReject = (teamId) => {
    console.log(`Rejected: ${teamId}`);
    setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="p-10">
      {/* Header with Dashboard and Bell */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-center flex-1">Dashboard</h1>

        {/* Bell Icon */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowPopup(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {invitations.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Stylish Invitation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">Team Invitations</h2>

            {invitations.length === 0 ? (
              <p className="text-gray-600 text-center">No invitations yet.</p>
            ) : (
              <ul className="space-y-4">
                {invitations.map((invite) => (
                  <li
                    key={invite.from_team_id}
                    className="border rounded-lg p-4 shadow"
                  >
                    <p className="font-semibold">Team: {invite.from_team_id}</p>
                    <p className="font-medium text-gray-600">
                      Project: {invite.project_name}
                    </p>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(invite.from_team_id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(invite.from_team_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectExpertDashboard;

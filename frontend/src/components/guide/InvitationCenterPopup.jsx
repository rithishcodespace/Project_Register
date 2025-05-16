import React from 'react';

const InvitationCenterPopup = ({ invitations, onAccept, onReject, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
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
              <li key={invite.from_team_id} className="border rounded-lg p-4 shadow">
                <p className="font-semibold">{invite.from_team_id}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onAccept(invite.from_team_id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(invite.from_team_id)}
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
  );
};

export default InvitationCenterPopup;

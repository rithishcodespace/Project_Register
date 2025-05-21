import React, { useState, useEffect } from 'react';
import { Bell, Store } from 'lucide-react';
import {useSelector} from "react-redux";
import axios from "axios";

const SubjectExpertDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);


  async function fetchInvitations() {
  try {
    const response = await axios.get(`http://localhost:1234/expert/getrequests/${selector.reg_num}`, {
      withCredentials: true,
    });

    console.log("Response data:", response.data); // <-- Debug line

    if (response.status === 200 && Array.isArray(response.data)) {
      setInvitations(response.data);
    } else {
      setInvitations([]); // fallback to empty array
      console.warn("Expected array but got:", response.data);
    }
  } catch (error) {
    alert("ERROR occurred while fetching the invitations!");
    console.error(error);
    setInvitations([]); // ensure fallback
  }
}


  useEffect(() => {
    fetchInvitations()
  },[]);

  const handleAccept = async(teamId) => {
    let status = 'accept';
    let response = await axios.patch(`http://localhost:1234/sub_expert/accept_reject/${status}/${teamId}/${selector.reg_num}`,{withCredentials: true});
    if(response.status === 200){
      alert(`${teamId} accepted!`);
      setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
    }
  };

  const handleReject = async(teamId) => {
   let status = 'reject';
   let response = await axios.patch(`http://localhost:1234/sub_expert/accept_reject/${status}/${teamId}/${selector.reg_num}`,{withCredentials: true})
   if(response.status === 200){
      alert(`${teamId} accepted!`);
      setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
    }
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
            className="p-2 rounded-full  transition"
          >
            <Bell className="w-6 h-6 text-black" />
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
            <h2 className="text-2xl font-bold text-center bg-white mb-4">Team Invitations</h2>

            {Array.isArray(invitations) && invitations.length === 0 ? (
              <p className="text-gray-600 text-center bg-white">No invitations yet.</p>
            ) : (
              <ul className="space-y-4 bg-white">
                {Array.isArray(invitations) &&
                  invitations.map((invite) => (
                    <li key={invite.from_team_id} className="-b rounded-lg bg-white p-4">
                      <p className="font-semibold bg-white">Team: {invite.from_team_id}</p>
                      <p className="font-medium bg-white text-gray-600">
                        Project: {invite.project_name}
                      </p>
                      <div className="flex bg-white justify-end gap-2 mt-3">
                        <button
                          onClick={() => handleAccept(invite.from_team_id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 rounded"
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

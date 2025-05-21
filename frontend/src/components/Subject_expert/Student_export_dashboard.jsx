import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from "react-redux";
import instance from '../../utils/axiosInstance';
import { setLogLevel } from 'firebase/app';

const SubjectExpertDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);
  console.log(selector);

  // Fetch team invitations
  async function fetchInvitations() {
    try {
      const response = await instance.get(`/expert/getrequests/${selector.reg_num}`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setInvitations(response.data);
      } else {
        setInvitations([]);
        console.warn("Expected array but got:", response.data);
      }
    } catch (error) {
      alert("ERROR occurred while fetching the invitations!");
      console.error(error);
      setInvitations([]);
    }
  }

  // Fetch review requests
  async function fetchReviewRequests() {
    try {
      const response = await instance.get(`/sub_expert/fetch_review_requests/${selector.reg_num}`);
      if (response.status === 200 && Array.isArray(response.data)) {
               
        setReviewRequests(response.data);
      } else {
        setReviewRequests([]);
        console.warn("Expected array but got:", response.data);
      }
    } catch (error) {
      alert("ERROR while fetching review requests!");
      console.error(error);
      setReviewRequests([]);
    }
  }

  useEffect(() => {
    fetchInvitations();
    fetchReviewRequests();
  }, []);

  // Accept invitation
  const handleAccept = async (teamId) => {
    try {
      const response = await instance.patch(`/sub_expert/accept_reject/accept/${teamId}/${selector.reg_num}`);
      if (response.status === 200) {
        alert(`${teamId} accepted!`);
        setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
      }
    } catch (error) {
      alert("Failed to accept invitation.");
      console.error(error);
    }
  };

  // Reject invitation
  const handleReject = async (teamId) => {
    try {
      const response = await instance.patch(`/sub_expert/accept_reject/reject/${teamId}/${selector.reg_num}`);
      if (response.status === 200) {
        alert(`${teamId} rejected!`);
        setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
      }
    } catch (error) {
      alert("Failed to reject invitation.");
      console.error(error);
    }
  };

  // Single function for accepting/rejecting reviews
  const handleReview = async (status, req) => {
    try {
      const url = `/sub_expert/add_review_details/${reviewRequests.request_id}/${status}`;

      if (status === "accept") {
        const payload = {
          project_id: reviewRequests.project_id,
          project_name: reviewRequests.project_name,
          team_lead: reviewRequests.team_lead,
          review_date: reviewRequests.review_date,
          start_time: reviewRequests.start_time,
          venue: "Biy",
          request_id:reviewRequests.request_id,
          status:"accept"
        };
        const response = await instance.post(url, payload);
        if (response.status === 200) {
          alert(`Review for ${req.project_name} accepted and scheduled!`);
          setReviewRequests(prev => prev.filter(r => r.request_id !== req.request_id));
        }
      } else if (status === "reject") {
        const response = await instance.post(url); // No payload needed
        if (response.status === 200) {
          alert(`Review request ${req.request_id} rejected.`);
          setReviewRequests(prev => prev.filter(r => r.request_id !== req.request_id));
        }
      }
    } catch (error) {
      alert("Something went wrong while processing the review request.");
      console.error(error);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-center flex-1">Dashboard</h1>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowPopup(true)}
            className="p-2 rounded-full transition"
          >
            <Bell className="w-6 h-6 text-black" />
            {(invitations.length > 0 || reviewRequests.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>

            {/* Team Invitations */}
            <h2 className="text-2xl font-bold text-center mb-4">Team Invitations</h2>
            {invitations.length === 0 ? (
              <p className="text-gray-600 text-center">No invitations yet.</p>
            ) : (
              <ul className="space-y-4">
                {invitations.map((invite) => (
                  <li key={invite.from_team_id} className="bg-white rounded-lg p-4">
                    <p className="font-semibold">Team: {invite.from_team_id}</p>
                    <p className="text-gray-600">Project: {invite.project_name}</p>
                    <div className="flex justify-end gap-2 mt-3">
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

            {/* Divider */}
            <hr className="my-5" />

            {/* Review Requests */}
            <h2 className="text-2xl font-bold text-center mb-4">Review Requests</h2>
            {reviewRequests.length === 0 ? (
              <p className="text-gray-600 text-center">No review requests.</p>
            ) : (
              <ul className="space-y-4">
                {reviewRequests.map((req) => (
                  <li key={req.request_id} className="bg-white rounded-lg p-4">
                    <p className="font-semibold">Project: {req.project_name}</p>
                    <p className="text-gray-600">Lead: {req.team_lead}</p>
                    <p className="text-gray-600">Date: {req.review_date}</p>
                    <p className="text-gray-600">Time: {req.start_time}</p>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => handleReview('accept', req)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReview('reject', req)}
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

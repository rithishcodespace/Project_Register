import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const InvitationPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const selector = useSelector((Store) => Store.userSlice);

  // Load invitations from localStorage on mount
  useEffect(() => {
    const savedInvitations = localStorage.getItem('studentInvitations');
    if (savedInvitations) {
      setInvitations(JSON.parse(savedInvitations));
    }
  }, []);

  // Fetch latest invitations from backend
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        if (!selector.emailId) {
          console.log('Email ID is not yet available.');
          return;
        }
        let token = localStorage.getItem('accessToken');
        console.log(selector.reg_num)
        const response = await axios.get(
          `http://localhost:1234/student/request_recived/${selector.reg_num}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.length > 0) {
         
          let fromUserId = response.data[0].from_reg_num;

          if (fromUserId) {
            let res = await axios.get(
              `http://localhost:1234/student/get_student_details_by_regnum/${fromUserId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (res.status === 200) {
              const studentDetails = Array.isArray(res.data) ? res.data[0] : res.data;

              const enrichedData = {
                ...studentDetails,
                status: response.data[0].status,
                from_reg_num: response.data[0].from_reg_num,
                to_reg_num: response.data[0].to_reg_num,
              };

              setInvitations([enrichedData]);
              localStorage.setItem('studentInvitations', JSON.stringify([enrichedData]));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();
  }, [selector.emailId]);

  // Handle Accept or Reject
  const handleAction = async (invite, status) => {
    try {
      setLoadingId(invite.reg_num);
      await axios.patch(
        `http://localhost:1234/student/team_request/${status}/${invite.to_reg_num}/${invite.from_reg_num}`,
        {},
        {
          withCredentials: true
        }
      );

      const updated = invitations.map((i) =>
        i.reg_num === invite.reg_num ? { ...i, status } : i
      );
      setInvitations(updated);
      localStorage.setItem('studentInvitations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error handling action:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Invitations</h1>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300">Name</th>
            <th className="px-4 py-2 border border-gray-300">Email</th>
            <th className="px-4 py-2 border border-gray-300">Register Number</th>
            <th className="px-4 py-2 border border-gray-300">Department</th>
            <th className="px-4 py-2 border border-gray-300">Action</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invite) => (
            <tr key={invite.reg_num}>
              <td className="px-4 py-2 border border-gray-300">{invite.name}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.emailId}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.reg_num}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.dept}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {invite.status === 'interested' ? (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handleAction(invite, 'accept')}
                      className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={loadingId === invite.reg_num}
                    >
                      {loadingId === invite.reg_num ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleAction(invite, 'reject')}
                      className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={loadingId === invite.reg_num}
                    >
                      {loadingId === invite.reg_num ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      invite.status === 'accept' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {invite.status === 'accept' ? 'Accepted' : 'Rejected'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationPage;

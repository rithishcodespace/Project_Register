// InvitationPage.js (Frontend)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const InvitationPage = () => {
  const [invitations, setInvitations] = useState([]);
  const selector = useSelector((Store) => Store.userSlice);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        let token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:1234/student/team_request/${selector.emailId}`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        setInvitations(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();
  }, []);

  // const handleAction = async (id, status) => {
  //   try {
  //     await axios.post(`http://localhost:1234/student/team_request/${status}/${selector.reg_num}/:from_reg_num`); // Replace with your endpoint
  //     setInvitations((prevState) =>
  //       prevState.map((invite) =>
  //         invite.id === id ? { ...invite, status: action } : invite
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error handling action:', error);
  //   }
  // };

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
            <tr key={invite.id}>
              <td className="px-4 py-2 border border-gray-300">{invite.name}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.email}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.registerNumber}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.department}</td>
              <td className="px-4 py-2 border border-gray-300">
                <button
                  onClick={() => handleAction(invite.id, 'accept')}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(invite.id, 'reject')}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationPage;

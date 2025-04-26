// InvitationPage.js (Frontend)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvitationPage = () => {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await axios.get('http://localhost:1234/invitations'); // Replace with your endpoint
        setInvitations(response.data);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:1234/invitations/${id}/${action}`); // Replace with your endpoint
      setInvitations((prevState) =>
        prevState.map((invite) =>
          invite.id === id ? { ...invite, status: action } : invite
        )
      );
    } catch (error) {
      console.error('Error handling action:', error);
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
            <tr key={invite.id}>
              <td className="px-4 py-2 border border-gray-300">{invite.name}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.email}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.registerNumber}</td>
              <td className="px-4 py-2 border border-gray-300">{invite.department}</td>
              <td className="px-4 py-2 border border-gray-300">
                <button
                  onClick={() => handleAction(invite.id, 'accepted')}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(invite.id, 'rejected')}
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

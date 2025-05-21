import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function InviteForm({ inviteForm, handleInviteChange, setIsInviteOpen,  }) {

  const selector = useSelector((Store) => Store.userSlice);

  async function handleInviteSubmit(e) {
    e.preventDefault();
    console.log("Submitting invite...");

    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://localhost:1234/student/join_request",
        {
          "reg_num": inviteForm.registerNumber,
          "from_reg_num": selector.reg_num,
          "to_reg_num": inviteForm.registerNumber
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if(response.data == 200)alert("Invite sent successfully!");
      setIsInviteOpen(false); // close modal if success
    } catch (err) {
      console.error("Error sending invite", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-4 bg-white">Invite a Member</h2>
        <form onSubmit={handleInviteSubmit} className="space-y-4 bg-white">
          <div className="bg-white">
            <label className="block text-sm font-medium text-gray-700 bg-white">Register Number</label>
            <input
              name="registerNumber"
              value={inviteForm.registerNumber}
              onChange={handleInviteChange}
              type="text"
              required
              placeholder="Enter Register Number"
              className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>
          <div className="mt-6 flex bg-white justify-between space-x-2">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteForm;
import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function InviteForm({ inviteForm, handleInviteChange, setIsInviteOpen, departments }) {
  const selector = useSelector((store) => store.userSlice);
  const [loading, setLoading] = useState(false);

  async function handleInviteSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://localhost:1234/student/join_request",
        {
          name: inviteForm.name,
          emailId: inviteForm.email,
          reg_num: inviteForm.registerNumber,
          dept: inviteForm.department,
          from_reg_num: selector.reg_num,
          to_reg_num: inviteForm.registerNumber
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 200) {
        alert("Invite sent successfully!");
        setIsInviteOpen(false); // close modal
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      alert("Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Invite a Member</h2>
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={inviteForm.name}
              onChange={handleInviteChange}
              type="text"
              required
              placeholder="Enter Name"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={inviteForm.email}
              onChange={handleInviteChange}
              type="email"
              required
              placeholder="Enter Email"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Register Number</label>
            <input
              name="registerNumber"
              value={inviteForm.registerNumber}
              onChange={handleInviteChange}
              type="text"
              required
              placeholder="Enter Register Number"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="department"
              value={inviteForm.department}
              onChange={handleInviteChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-between space-x-2">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded transition ${
                loading
                  ? 'bg-purple-300 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-700'
              }`}
            >
              {loading ? "Inviting..." : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteForm;

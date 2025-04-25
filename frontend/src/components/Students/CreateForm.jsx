import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';

function CreateForm({ createForm, handleCreateChange, handleCreateSubmit, departments, setIsCreateOpen }) {

  const [depart,setdepart]=useState()
  const dispatch = useDispatch();

  function handleDispatch()
  {
    dispatch(addUser({
      
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 bg-white">New Project Invitation</h2>
        <form onSubmit={handleCreateSubmit} className="space-y-4 bg-white">
          <div className="bg-white">
            <label className="block text-sm font-medium text-gray-700 bg-white">Your Name</label>
            <input
              name="name"
              value={createForm.name}
              onChange={handleCreateChange}
              type="text"
              required
              className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium text-gray-700 bg-white">Your Email</label>
            <input
              name="email"
              value={createForm.email}
              onChange={handleCreateChange}
              type="email"
              required
              className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium text-gray-700 bg-white">Register Number</label>
            <input
              name="registerNumber"
              value={createForm.registerNumber}
              onChange={handleCreateChange}
              type="text"
              required
              className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            />
          </div>
          <div className="bg-white">
            <label className="block text-sm font-medium text-gray-700 bg-white">Department</label>
            <select
              name="department"
              value={createForm.department}
              required
              className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            onChange={(e) => {
                 handleCreateChange(e);
                 setdepart(e.target.value);
                }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-between bg-white space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
              onClick={handleDispatch()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateForm;

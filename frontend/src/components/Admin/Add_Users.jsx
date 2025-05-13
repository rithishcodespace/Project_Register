import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Add_Users() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [RegisterNumber,setRegisterNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async() => {
    if (!name || !password || !role || !RegisterNumber) {
      alert('Please fill in all fields');
      return;
    }
    let response = await axios.post("http://localhost:1234/admin/adduser",{
      "emailId":name,
      "password":password,
      "reg_num":RegisterNumber,
      "role":role
    })
    if(response.status === 200)
    {
      setName("");
      setPassword("");
      setRegisterNumber("");
      setRole("");
      alert("User Added Successfully")
    }
  };

  return (
    <div className=" mt-12 flex items-center justify-center ">
      <div className=" bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <h2 className="text-3xl bg-white  font-bold text-center  mb-6">Add New User</h2>

        {/* Email Field */}
        <div className="mb-5 bg-white ">
          <label className="block text-sm bg-white  text-black mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter user email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white  px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Field */}
        <div className="mb-5 relative bg-white ">
          <label className="block text-sm  bg-white  text-black mb-2">Password</label>
          <input
            type='text'
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border bg-white  border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
        </div>
        <div className="mb-5 relative bg-white ">
          <label className="block text-sm bg-white  text-black mb-2">Register Number</label>
          <input
            type='text'
            placeholder="Enter register number"
            value={RegisterNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            className="w-full px-4 py-2 pr-10 border bg-white  border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
        </div>

        {/* Role Dropdown */}
        <div className="mb-6 bg-white ">
          <label className="block text-sm text-black  bg-white mb-2">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="teacher">Staff</option>
            <option value="guide">Guide</option>
            <option value="sub_expert">Subject Expert</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold text-lg hover:bg-purple-600 transition duration-200 shadow-md"
        >
          Add User
        </button>

        
      </div>
    </div>
  );
}

export default Add_Users;

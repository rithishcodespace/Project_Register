import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const loggedInUser = "Alice";
const teamMembers = ['Alice', 'Nike', 'Mathan', 'Prakash', 'Rithish'];

const initialProgressData = {
  "Frontend": {
    "Alice": 20,
    "Nike": 20,
    "Mathan": 0,
    "Prakash": 0,
    "Rithish": 0
  },
  "Login Page": {
    "Alice": 0,
    "Nike": 0,
    "Mathan": 0,
    "Prakash": 0,
    "Rithish": 0
  },
  "Database": {
    "Alice": 0,
    "Nike": 0,
    "Mathan": 0,
    "Prakash": 0,
    "Rithish": 0
  },
  "API Integration": {
    "Alice": 0,
    "Nike": 0,
    "Mathan": 0,
    "Prakash": 0,
    "Rithish": 0
  },
  "Testing": {
    "Alice": 0,
    "Nike": 11,
    "Mathan": 20,
    "Prakash": 0,
    "Rithish": 0
  }
};

const COLORS = ['#6366f1', '#10b981', '#facc15', '#f97316', '#ec4899'];
const REMAINING_COLOR = '#e5e7eb'; // Light gray

function Progress_Update() {
  const [progressData, setProgressData] = useState(initialProgressData);

  const handleChange = (phase, value) => {
    // Ensure the value is a number and is capped at 100
    const newValue = Math.min(Number(value), 100); // Cap the value at 100
    
    // If the value exceeds 100, show an alert
    if (newValue !== Number(value)) {
      alert("The contribution cannot exceed 100%. The value has been capped to 100.");
    }
  
    setProgressData(prev => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        [loggedInUser]: newValue
      }
    }));
  };
  

  const renderPhase = (phaseName, index) => {
    const membersData = progressData[phaseName];
    const memberEntries = teamMembers.map((name) => ({
      name,
      value: membersData[name] || 0 // Include all members, even those with 0% contribution
    }));

    const total = memberEntries.reduce((acc, curr) => acc + curr.value, 0);
    const remaining = total < 100 ? 100 - total : 0;

    const pieData = [
      ...memberEntries.filter((entry) => entry.value > 0),
      { name: "Remaining", value: remaining }
    ];

    const myValue = membersData[loggedInUser];

    return (
      <div key={index} className="flex flex-col md:flex-row items-center bg-white shadow-xl rounded-2xl p-6 mb-8">
        {/* Left: Input */}
        <div className="md:w-1/2 mb-6 bg-white md:mb-0 px-4">
          <h2 className="text-xl font-bold bg-white mb-3 text-indigo-600">{phaseName}</h2>
          <label className="block text-gray-700 bg-white font-medium mb-2">
            {loggedInUser}'s Contribution (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={myValue}
            onChange={(e) => handleChange(phaseName, e.target.value)}
            className="w-full border border-gray-300 bg-white  rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-sm text-gray-500 bg-white  mt-1">Update your progress for this phase</p>

          <div className="mt-4 bg-white ">
            {memberEntries.map((entry) => (
              <p key={entry.name} className={entry.value === 0 ? 'text-gray-400 bg-white ' : ' bg-white '}>
                {entry.name} contribution - {entry.value}%
              </p>
            ))}
          </div>
        </div>

        <div className="md:w-1/2 flex bg-white flex-col items-center px-4">
          <ResponsiveContainer width="100%" height={250} className="bg-white" >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ percent, name }) =>
                  name !== "Remaining" && percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''
                }
              >
                {pieData.map((entry, i) => (
                  <Cell
                  
                    key={`cell-${i}`}
                    fill={entry.name === "Remaining" ? REMAINING_COLOR : COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 bg-white gap-x-4 gap-y-2 text-sm font-medium text-gray-800">
            {memberEntries.map((entry, i) => (
              <div key={i} className="flex bg-white items-center gap-2">
                <div
                  className="w-4 h-4 bg-white rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className='bg-white'>{entry.name} - {entry.value}%</span>
              </div>
            ))}
            {remaining > 0 && (
              <div className="flex bg-white items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300" />
                <span className='bg-white'>Remaining - {remaining}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br  to-blue-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10 text-black">
        Hello <span className='text-purple-500'>{loggedInUser}</span>, Update Your Project Progress 
      </h1>
      {Object.keys(progressData).map((phase, index) => renderPhase(phase, index))}
    </div>
  );
}

export default Progress_Update;

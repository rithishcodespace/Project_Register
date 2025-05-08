import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#4ade80', '#22d3ee', '#facc15', '#f472b6'];

const mockTeams = [
  {
    id: 1,
    projectTitle: 'Smart Attendance System',
    members: ['Ram', 'Shiva', 'Priya', 'Keerthana'],
    progress: [
      { name: 'Ram', value: 30 },
      { name: 'Shiva', value: 25 },
      { name: 'Priya', value: 20 },
      { name: 'Keerthana', value: 25 },
    ],
  },
  {
    id: 2,
    projectTitle: 'AI Chatbot for Students',
    members: ['Arjun', 'Meena', 'Devi', 'Karthik'],
    progress: [
      { name: 'Arjun', value: 40 },
      { name: 'Meena', value: 30 },
      { name: 'Devi', value: 20 },
      { name: 'Karthik', value: 10 },
    ],
  },
  {
    id: 3,
    projectTitle: 'E-Voting App',
    members: ['Naveen', 'Shruthi', 'Kavin', 'Divya'],
    progress: [
      { name: 'Naveen', value: 25 },
      { name: 'Shruthi', value: 25 },
      { name: 'Kavin', value: 30 },
      { name: 'Divya', value: 20 },
    ],
  },
  {
    id: 4,
    projectTitle: 'Online Lab Journal',
    members: ['Vikram', 'Ravi', 'Anjali', 'Ritu'],
    progress: [
      { name: 'Vikram', value: 30 },
      { name: 'Ravi', value: 30 },
      { name: 'Anjali', value: 20 },
      { name: 'Ritu', value: 20 },
    ],
  },
];

function Guide_team_progress() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">📊 Team Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTeams.map((team, index) => (
          <div key={team.id} className="bg-white p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">{team.projectTitle}</h3>
            <p className="mb-2 text-gray-600">👥 Members: {team.members.join(', ')}</p>

            <PieChart width={300} height={250}>
              <Pie
                data={team.progress}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {team.progress.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guide_team_progress;
    
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const team = mockTeams.find((t) => t.id === parseInt(id));

  if (!team) return <div className="p-6">Team not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-purple-500 mb-4 hover:underline">
        ← Back to Teams
      </button>

      <h2 className="text-3xl font-bold text-purple-600 mb-4">{team.projectTitle}</h2>
      <p className="mb-2 text-gray-700">
        <strong>Members:</strong> {team.members.join(', ')}
      </p>

      <PieChart width={400} height={300}>
        <Pie
          data={team.progress}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {team.progress.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default TeamDetails;

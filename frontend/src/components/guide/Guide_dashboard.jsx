import React, { useState } from 'react';
import { Users, ClipboardList, MessageCircle, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InvitationCenterPopup from './InvitationCenterPopup';

const progressData = [
  { name: 'Team A', value: 70 },
  { name: 'Team B', value: 45 },
  { name: 'Team C', value: 60 },
  { name: 'Team D', value: 85 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

function Guide_dashboard() {
  const [showPopup, setShowPopup] = useState(false);

  const invitations = [
    { id: 1, team: 'Team Alpha', message: 'Request to join under your guidance.' },
    { id: 2, team: 'Team Beta', message: 'Seeking approval for project supervision.' },
  ];

  const handleAccept = (id) => {
    alert(`Accepted invitation from team ID ${id}`);
    setShowPopup(false);
  };

  const handleReject = (id) => {
    alert(`Rejected invitation from team ID ${id}`);
    setShowPopup(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">Welcome, Guide</h1>
        <button
          className="relative ml-auto p-2 rounded-full hover:bg-gray-100 transition"
          onClick={() => setShowPopup(true)}
        >
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users className="text-blue-600" size={32} />} label="Assigned Teams" value="4" />
        <StatCard icon={<ClipboardList className="text-green-600" size={32} />} label="Ongoing Projects" value="4" />
        <StatCard icon={<MessageCircle className="text-purple-600" size={32} />} label="Feedbacks Given" value="8" />
        <StatCard icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={32} height={32}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        } label="Completed Project Teams" value="2" />
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Team Progress Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={progressData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50} label>
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showPopup && (
        <InvitationCenterPopup
          invitations={invitations}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
    {icon}
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <h3 className="text-xl font-semibold">{value}</h3>
    </div>
  </div>
);

export default Guide_dashboard;

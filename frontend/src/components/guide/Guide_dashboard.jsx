import React from 'react';
import { Users, ClipboardList, MessageCircle, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const progressData = [
  { name: 'Team A', value: 70 },
  { name: 'Team B', value: 45 },
  { name: 'Team C', value: 60 },
  { name: 'Team D', value: 85 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

function Guide_dashboard () {
  return (
    <div className="p-6 bg-gray-100 ">
      <h1 className="text-3xl text-center font-bold mb-6">Welcome, Guide</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <Users className="text-blue-600" size={32} />
          <div>
            <p className="text-gray-500 text-sm">Assigned Teams</p>
            <h3 className="text-xl font-semibold">4</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <ClipboardList className="text-green-600" size={32} />
          <div>
            <p className="text-gray-500 text-sm">Ongoing Projects</p>
            <h3 className="text-xl font-semibold">4</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <MessageCircle className="text-purple-600" size={32} />
          <div>
            <p className="text-gray-500 text-sm">Feedbacks Given</p>
            <h3 className="text-xl font-semibold">8</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4">
          <Calendar className="text-red-500" size={32} />
          <div>
            <p className="text-gray-500 text-sm">Upcoming Meetings</p>
            <h3 className="text-xl font-semibold">2</h3>
          </div>
        </div>
      </div>

      {/* Progress Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Team Progress Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={progressData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={50}
              label
            >
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Guide_dashboard;


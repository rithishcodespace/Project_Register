import React from 'react';

const TeacherDashboard = () => {
  const stats = [
    { title: 'Total Projects', value: 12 },
    { title: 'Projects Taken', value: 7 },
    { title: 'Ongoing Projects', value: 5 },
    { title: 'Completed Projects', value: 3 },
  ];

  const upcoming = [
    { name: 'AI Chatbot', deadline: 'Due in 3 days' },
    { name: 'IoT Attendance System', deadline: 'Due in 5 days' },
  ];

  const activity = [
    'Team Alpha submitted "E-Commerce Site"',
    'Student K updated progress on "Portfolio Website"',
    'Team Delta selected "Face Recognition App"',
  ];

  return (
    <div className="p-6 bg- rounded-xl h-[90%]">
      <h2 className="text-3xl font-bold bg- mb-8">Teacher Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 bg- sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:scale-105 transition duration-200"
          >
            <p className="text-sm bg-white text-white-500">{stat.title}</p>
            <h3 className="text-2xl bg-white font-semibold text-purple-500">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 hover:scale-105 transition duration-200">
        <h3 className="text-xl bg-white font-semibold  mb-4 flex items-center">
           Upcoming Deadlines
        </h3>
        <ul className="list-disc pl-6 bg-white space-y-2 text-gray-700">
          {upcoming.map((item, index) => (
            <li key={index} className='bg-white'>
              <span className="font-medium bg-white">{item.name}</span> — {item.deadline}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
        <h3 className="text-xl bg-white font-semibold mb-4 flex items-center">
            Recent Activity
        </h3>
        <ul className="list-disc pl-6 space-y-2 bg-white text-gray-700">
          {activity.map((act, index) => (
            <li key={index} className='bg-white'>{act}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherDashboard;

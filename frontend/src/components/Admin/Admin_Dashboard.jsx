import React from 'react';

function Admin_Dashboard() {
  // Sample teams data
  const sampleTeams = [
    {
      team_name: 'Team Alpha',
      type: 'individual',
      members: 1,
      deadline: '2025-06-15',
      posted_date: '2025-05-01',
    },
    {
      team_name: 'Team Bravo',
      type: 'trio',
      members: 3,
      deadline: '2025-06-10',
      posted_date: '2025-04-25',
    },
    {
      team_name: 'Team Charlie',
      type: 'group',
      members: 5,
      deadline: '2025-06-20',
      posted_date: '2025-05-10',
    },
    {
      team_name: 'Team Delta',
      type: 'individual',
      members: 1,
      deadline: '2025-05-18',
      posted_date: '2025-05-15',
    },
     {
      team_name: 'Team Dragon',
      type: 'due',
      members: 2,
      deadline: '2025-05-18',
      posted_date: '2025-05-15',
    }
  ];

  const stats = [
    { title: 'Total Teams', value: sampleTeams.length },
    {
      title: 'Individual Teams',
      value: sampleTeams.filter((t) => t.type === 'individual').length,
    },
    {
      title: 'Due Teams',
      value: sampleTeams.filter((t) => t.type === 'due').length,
    },
    {
      title: 'Trio Teams',
      value: sampleTeams.filter((t) => t.type === 'trio').length,
    },
    {
      title: 'Group Teams',
      value: sampleTeams.filter((t) => t.type === 'group').length,
    },
  ];

  const upcoming = sampleTeams
    .filter((t) => t.deadline)
    .slice(0, 2)
    .map((t) => ({
      name: t.team_name,
      deadline: t.deadline,
    }));

  const activity = [...sampleTeams]
    .sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date))
    .slice(0, 3)
    .map(
      (t) =>
        `Team "${t.team_name}" was posted on ${new Date(
          t.posted_date
        ).toLocaleDateString()}.`
    );

  return (
    <div className="p-6 rounded-xl h-[90%]">
      <h2 className="text-3xl font-bold flex justify-center mb-8">
        Admin Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:scale-105 transition duration-200"
          >
            <p className="text-sm text-gray-500">{stat.title}</p>
            <h3 className="text-2xl font-semibold text-purple-500">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 hover:scale-105 transition duration-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          Upcoming Deadlines
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {upcoming.length > 0 ? (
            upcoming.map((item, index) => (
              <li key={index}>
                <span className="font-medium">{item.name}</span> — {item.deadline}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No upcoming deadlines</p>
          )}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          Recent Activity
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {activity.map((act, index) => (
            <li key={index}>{act}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin_Dashboard;

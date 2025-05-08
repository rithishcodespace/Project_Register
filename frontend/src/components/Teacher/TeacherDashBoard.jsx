import React, { useEffect, useState } from 'react';
import axios from "axios";

const TeacherDashboard = () => {
  const [projects, setProjects] = useState([]);

  const fetchprojects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:1234/teacher/fetch_all_projects", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setProjects(response.data);
      } else {
        alert("Error fetching projects");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    fetchprojects();
  }, []);

  const stats = [
    { title: 'Total Projects', value: projects.length },
    { title: 'Projects Taken', value: projects.filter(p => p.status === 'Ongoing' || p.status === 'Completed').length },
    { title: 'Ongoing Projects', value: projects.filter(p => p.status === 'Ongoing').length },
    { title: 'Completed Projects', value: projects.filter(p => p.status === 'Completed').length },
  ];

  const upcoming = projects
    .filter(p => p.deadline) // you can customize this as per your data
    .slice(0, 2)
    .map(p => ({
      name: p.project_name,
      deadline: p.deadline
    }));

  const activity = projects.slice(0, 3).map(p => `Project "${p.project_name}" was updated or added.`);

  return (
    <div className="p-6  rounded-xl h-[90%]">
      <h2 className="text-3xl flex justify-center font-bold bg- mb-8">Teacher Dashboard</h2>

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
          {upcoming.length > 0 ? upcoming.map((item, index) => (
            <li key={index} className='bg-white'>
              <span className="font-medium bg-white">{item.name}</span> — {item.deadline}
            </li>
          )) : <p className='text-gray-500 bg-white'>No upcoming deadlines</p>}
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

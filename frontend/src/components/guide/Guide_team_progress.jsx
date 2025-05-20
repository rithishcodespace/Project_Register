import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useSelector } from 'react-redux';
import axios from 'axios';

const COLORS = ['#4ade80', '#22d3ee', '#facc15', '#f472b6'];

function Guide_team_progress() {
  const selector = useSelector((store) => store.userSlice);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const token = localStorage.getItem('accessToken');
      const guide_reg_num = selector.reg_num;

      // Step 1: Get the list of accepted teams mentored by this guide
      const response = await axios.get(
        `http://localhost:1234/guide/fetch_mentoring_teams/${guide_reg_num}`,
        {
          withCredentials:true,
        }
      );

      const mentoringTeams = response.data;
      console.log(mentoringTeams);
      

      // Step 2: For each team, fetch its progress
      const updatedTeams = await Promise.all(
        mentoringTeams.map(async (team) => {
          const progressRes = await axios.get(
            `http://localhost:1234/guide/fetch_progress_by_project_id/${team.project_id}`,
            {
              withCredentials:true
            }
          );

          const progressData = progressRes.data;
          console.log(progressData);
          
          const progress = progressData.map((member) => ({
            name: member.name,
            value: member.progress_percentage || 0,
          }));

          return {
            id: team.id || team.from_team_id,
            projectTitle: team.project_name || 'Untitled Project',
            members: progressData.map((m) => m.name),
            progress,
          };
        })
      );

      setTeams(updatedTeams);
    } catch (error) {
      console.error('Error fetching team or progress data:', error);
    }
  }

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-3xl text-center font-bold mb-6">Team Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.length === 0 ? (
          <p className="text-center text-gray-500">No teams found.</p>
        ) : (
          teams.map((team,index) => (
            <div key={index} className="bg-white p-5 rounded-xl shadow-lg">
              <p>Team Id : {team.id}</p>
              <h3 className="text-xl font-semibold mb-2 text-purple-500">
                {team.projectTitle}
              </h3>
              <p className="mb-2 text-gray-600">
                Members: {team.members.join(', ')}
              </p>

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
          ))
        )}
      </div>
    </div>
  );
}

export default Guide_team_progress;

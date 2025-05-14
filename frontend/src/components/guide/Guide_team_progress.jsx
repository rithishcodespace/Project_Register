import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useEffect,useState } from 'react';
import {useSelector} from "react-redux";
import axios from "axios"

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

  const selector = useSelector((Store) => Store.userSlice);

  async function fetch_teams() {
    try {
      const token = localStorage.getItem("accessToken");
      const guide_reg_num = selector.reg_num;

      const response = await axios.get(`http://localhost:1234/guide/fetch_mentoring_teams/${guide_reg_num}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // setTeams(response.data); // Set fetched teams to state...
        console.log(response.data);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  }

   
  useEffect(()=>{
    fetch_teams();
  },[])

  return (
    <div className="p-6  min-h-screen">
      <h2 className="text-3xl text-center font-bold mb-6"> Team Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTeams.map((team, index) => (
          <div key={team.id} className="bg-white p-5 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2 bg-white text-purple-500">{team.projectTitle}</h3>
            <p className="mb-2 text-black-300 bg-white"> Members: {team.members.join(', ')}</p>

            <PieChart width={300} height={250} style={{ outline: 'none' }}>
              <Pie
                data={team.progress}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                style={{ outline: 'none' }}
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

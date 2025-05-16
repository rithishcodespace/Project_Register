import React, { useState,useEffect } from 'react';
import { Users, Check,ClipboardList, MessageCircle, Bell, Store } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InvitationCenterPopup from './InvitationCenterPopup';
import axios from "axios";
import {useSelector} from "react-redux";

const progressData = [
  { name: 'Team A', value: 70 },
  { name: 'Team B', value: 45 },
  { name: 'Team C', value: 60 },
  { name: 'Team D', value: 85 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

function Guide_dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [invitations,setinvitations] = useState([]);
  const selector = useSelector((Store) => Store.userSlice);

  const handleAccept = async(team_id) => {
    let response = await axios.patch(`http://localhost:1234/guide/accept_reject/accept/${team_id}/${selector.reg_num}`)
    alert(`Accepted invitation from team ID ${id}`);
    setShowPopup(false);
  };

  const handleReject = (id) => {
    alert(`Rejected invitation from team ID ${id}`);
    setShowPopup(false);
  };

  async function fetchInvitations()
  {
    let response = await axios.get(`http://localhost:1234/guide/getrequests/${selector.reg_num}`,{
      withCredentials: true
    })

    if(response.status === 200)
    {
      setinvitations(response.data);
    }
  }

  useEffect(() => {
    fetchInvitations()
  },[])

  return (
          <div className="p-6  ">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-center flex-1">Welcome, Guide</h1>
              <button
                className="relative ml-auto p-2 rounded-full hover: transition"
                onClick={() => setShowPopup(true)}
              >
                <Bell className="w-6 h-6 text-black-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>      

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Assigned Teams */}
        <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
          <div className="p-2 rounded-full bg-white">
            <Users className="text-blue-600 bg-white" size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-600 bg-white ">Assigned Teams</p>
            <p className="text-2xl font-bold text-gray-800 bg-white ">4</p>
          </div>
        </div>      

        {/* Ongoing Projects */}
        <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
          <div className="p-2 rounded-full bg-white ">
            <ClipboardList className="text-green-600 bg-white " size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-600 bg-white ">Ongoing Projects</p>
            <p className="text-2xl font-bold bg-white  text-gray-800">4</p>
          </div>
        </div>      

        {/* Feedbacks Given */}
        <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
          <div className="p-2 rounded-full  bg-white ">
            <MessageCircle className=" bg-white text-purple-600" size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-600 bg-white ">Feedbacks Given</p>
            <p className="text-2xl font-bold bg-white  text-gray-800">8</p>
          </div>
        </div>      

          <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
            <div className="p-2 rounded-full bg-white">
              <Check className="text-green-500 bg-white" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-600 bg-white">Completed Project Teams</p>
              <p className="text-2xl font-bold text-gray-800 bg-white">2</p>
            </div>

        </div>
      </div>


      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center bg-white ">Team Progress Overview</h2>
        <ResponsiveContainer width="100%" bg-color="white" height={300} >
          <PieChart className="bg-white" style={{ outline: 'none' }}>
            <Pie data={progressData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50} style={{ outline: 'none' }} className="bg-white" label>
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', color: 'white' }} />
            <Legend    verticalAlign="bottom" height={36} />
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


export default Guide_dashboard;

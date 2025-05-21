import React, { useState, useEffect } from 'react';
import { Users, Check, ClipboardList, MessageCircle, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InvitationCenterPopup from './InvitationCenterPopup';
import axios from "axios";
import { useSelector } from "react-redux";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

function Guide_dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [mentoredTeams, setMentoredTeams] = useState([]);
  const selector = useSelector((store) => store.userSlice);

  // Accept invitation
  const handleAccept = async (team_id) => {
    try {
      const response = await axios.patch(
        `http://localhost:1234/guide/accept_reject/accept/${team_id}/${selector.reg_num}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert(`Accepted invitation from team ID ${team_id}`);
        fetchMentoredTeams(); // Refresh data
      }
    } catch (error) {
      alert(`Error accepting invitation: ${error.message}`);
    }
    setShowPopup(false);
  };

  // Reject invitation
  const handleReject = async (team_id) => {
    try {
      const response = await axios.patch(
        `http://localhost:1234/guide/accept_reject/reject/${team_id}/${selector.reg_num}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert(`Rejected invitation from team ID ${team_id}`);
        fetchMentoredTeams(); // Refresh data
      }
    } catch (error) {
      alert(`Error rejecting invitation: ${error.message}`);
    }
    setShowPopup(false);
  };

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:1234/guide/getrequests/${selector.reg_num}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setInvitations(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  };

  // Fetch mentored teams
  const fetchMentoredTeams = async () => {
    try {
      const res = await axios.get(
        `http://localhost:1234/guide/fetch_mentoring_teams/${selector.reg_num}`,{withCredentials:true}
      );
      if (Array.isArray(res.data)) {
        setMentoredTeams(res.data);
        console.log(res.data);
        
      } else {
        setMentoredTeams([]);
      }
    } catch (err) {
      console.error("Error fetching mentored teams:", err);
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchMentoredTeams();
  }, []);

  // Fake progress for now (you can link with real data later)
  const progressData = mentoredTeams.map((team, idx) => ({
    name: `Team ${team.team_id}`,
    value: Math.floor(Math.random() * 50) + 50, // Random progress (50–100)
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">Welcome, Guide</h1>
        <button
          className="relative ml-auto p-2 rounded-full hover:transition"
          onClick={() => setShowPopup(true)}
        >
          <Bell className="w-6 h-6 text-black-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
   
        <Card icon={<Users className="text-purple-600 bg-white" size={32} />} label="Assigned Teams" value={mentoredTeams.length} />
        <Card icon={<ClipboardList className="text-green-600 bg-white" size={32} />} label="Ongoing Projects" value={mentoredTeams.length} />
        <Card icon={<Check className="text-green-500 bg-white" size={32} />} label="Completed Project Teams" value={Math.floor(mentoredTeams.length / 2)} />

      </div>

      {/* Team Progress Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center bg-white">Team Progress Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={progressData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={50}
              label
              style={{ outline: 'none' }}
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

      {/* Invitation Popup */}
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

// Reusable Card Component
const Card = ({ icon, label, value }) => (
  <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
    <div className="p-2 rounded-full bg-white">{icon}</div>
    <div>
      <p className="text-sm text-gray-600 bg-white">{label}</p>
      <p className="text-2xl font-bold text-gray-800 bg-white">{value}</p>
    </div>
  </div>
);

export default Guide_dashboard;

import React, { useState, useEffect } from 'react';
import { Users, Check, ClipboardList, MessageCircle, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InvitationCenterPopup from './InvitationCenterPopup';
import instance from '../../utils/axiosInstance';
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
      const response = await instance.patch(`/guide/accept_reject/accept/${team_id}/${selector.reg_num}`);
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
      const response = await instance.patch(
        `/guide/accept_reject/reject/${team_id}/${selector.reg_num}`
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
      const response = await instance.get(
        `/guide/getrequests/${selector.reg_num}`,
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
      const res = await instance.get(
        `/guide/fetch_mentoring_teams/${selector.reg_num}`
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
        <Card icon={<Check className="text-green-500 bg-white" size={32} />} label="Completed Project Teams" value={Math.floor(0)} />

      </div>


      <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
  <h2 className="text-xl font-semibold mb-4 bg-white text-black">Mentored Teams Overview</h2>
  <table className="w-full table-auto -collapse">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="p-3 bg-white border-b">Team ID</th>
        <th className="p-3 bg-white border-b">Project ID</th>
        <th className="p-3 bg-white border-b">Project Name</th>
        <th className="p-3 bg-white border-b">Weeks Verified</th>
        <th className="p-3 bg-white border-b">Status</th>
      </tr>
    </thead>
    <tbody>
      {mentoredTeams.map((team, index) => (
        <tr key={team.from_team_id} className="hover:bg-gray-50">
          <td className="p-3 bg-white border-t">{team.from_team_id}</td>
          <td className="p-3 bg-white border-t">{team.project_id}</td>
          <td className="p-3 bg-white border-t">{team.project_name}</td>
          <td className="p-3 bg-white border-t text-left">~ / 12</td>
          
          <td className="p-3 bg-white border-t">
            <span className={`px-2 py-1 text-sm rounded-full font-medium 
              ${team.status === 'accept' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {team.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>  
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

import { useState, useEffect } from 'react';
import CreateForm from './CreateForm';
import InviteForm from './InviteForm';
import TeamDetails from './TeamDetails';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { addTeamMembers,removeTeamMembers } from '../../utils/teamSlice';
import { useNavigate } from 'react-router-dom';
import { addTeamStatus } from '../../utils/teamStatus';

function Student_Dashboard() {
  // Dummy data (replace with API call later)
  const team = {
    members: ['John', 'Jane', 'Doe', 'Smith'],
    status: 'Confirmed',
  };

  const project = {
    title: 'AI Chatbot for College',
    domain: 'AI/ML',
    status: 'Approved',
  };

  const guide = 'Dr. A. Kumar';
  const expert = 'Prof. S. Meena';

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(inviteForm.email)) {
      alert('Email must be a valid @bitsathy.ac.in address.');
      return;
    }

    setPendingInvitations(prev => [...prev, { ...inviteForm, status: 'Pending' }]);
    setInviteForm({ name: '', email: '', registerNumber: '', department: '' });
    setIsInviteOpen(false);
  };

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Access token is missing");
        return;
      }
      const response = await axios.get('http://localhost:1234/profile/view', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addUser(response.data[0]));
      checkUserStatus(response.data[0].reg_num);
    } catch (error) {
      console.error('Error fetching profile:', error.response ? error.response.data : error.message);
    }
  };

  const checkUserStatus = async (reg_num) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Access token is missing");
        return;
      }
      const response = await axios.post('http://localhost:1234/student/fetch_team_status_and_invitations', 
        { "from_reg_num": reg_num },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
       
        var { teamConformationStatus, teamMembers, pendingInvitations, teamLeader } = response.data;
        setTeamStatus(teamConformationStatus);
        setTeamMembers(teamMembers || []);
        setPendingInvitations(pendingInvitations || []);
        if(teamMembers.length == 0)
        { 
          // checks whether he is a team member of another team without conformed
          let res = await axios.get(`http://localhost:1234/student/check_accepted_status/${reg_num}`,{
            headers:{
              Authorization : `Bearer ${token}`
            }
          })
          if(res.status === 200 && res.data)
          {
            console.log("second api: ",res.data);
            setteamConformationPending(true);

          }
        }
        if (teamMembers.length > 0) {
          teamMembers = [...teamMembers, { teamLeader: teamLeader }];
          dispatch(addTeamMembers(teamMembers));
          dispatch(addTeamStatus(response.data));
        }

        console.log(response.data);
      }
    } catch (error) {
      console.error('Error checking team status:', error.response ? error.response.data : error.message);
    }
  };

  const handleConfirmTeam = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const regNum = selector.reg_num;

      const response = await axios.patch(
        'http://localhost:1234/student/team_request/conform_team/TEAM_ID_001',
        { from_reg_num: regNum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setTeamStatus(1);
        alert('Team confirmed successfully!');
      }
    } catch (error) {
      console.error('Error confirming team:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (teamStatus === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (teamStatus === 1) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-green-600">Welcome to your Team Dashboard!</h1>
      </div>
    );
  }
  if (teamConformationPending) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-yellow-600">
          Team Confirmation Pending by Your Team Leader
        </h1>
      </div>
    );
  }

  const acceptedMembers = teamMembers.filter(member => member.status === 'accept');
  const remainingInvites = totalMembersAllowed - (1 + pendingInvitations.length + acceptedMembers.length);

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">🎓 Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Info Card */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">👥 Team Status</h2>
          <p><strong>Members:</strong> {team.members.join(', ')}</p>
          <p><strong>Status:</strong> {team.status}</p>
        </div>

        {/* Project Info Card */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">📁 Project Details</h2>
          <p><strong>Title:</strong> {project.title}</p>
          <p><strong>Domain:</strong> {project.domain}</p>
          <p><strong>Status:</strong> {project.status}</p>
        </div>

        {/* Guide & Expert Info */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">🧑‍🏫 Guide & Expert</h2>
          <p><strong>Guide:</strong> {guide}</p>
          <p><strong>Expert:</strong> {expert}</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Overall Progress</h2>
          <div className="relative w-full h-4 bg-gray-300 rounded-lg">
            <div
              className="absolute top-0 left-0 h-4 bg-green-500 rounded-lg"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2">{overallProgress}% Completed</p>
        </div>
      </div>
    </div>
  );
} 

export default Student_Dashboard;

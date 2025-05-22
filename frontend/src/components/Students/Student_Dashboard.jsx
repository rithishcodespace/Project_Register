import { useState, useEffect } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { addTeamMembers } from '../../utils/teamSlice';
import { useNavigate } from 'react-router-dom';
import { addTeamStatus } from '../../utils/teamStatus';

// InviteForm Component
function InviteForm({ inviteForm, handleInviteChange, handleInviteSubmit, departments, setIsInviteOpen }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 bg-white">Invite Team Member</h3>
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 bg-white">Name</label>
            <input
              type="text"
              name="name"
              value={inviteForm.name}
              onChange={handleInviteChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 bg-white">Email</label>
            <input
              type="email"
              name="email"
              value={inviteForm.email}
              onChange={handleInviteChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 bg-white">Register Number</label>
            <input
              type="text"
              name="registerNumber"
              value={inviteForm.registerNumber}
              onChange={handleInviteChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 bg-white">Department</label>
            <select
              name="department"
              value={inviteForm.department}
              onChange={handleInviteChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            >
              Send Invite
            </button>
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// TeamMembersList Component (renamed to avoid conflict)
function TeamMembersList({ teamMembers, pendingInvitations, selector }) {

  return (
    <div className="space-y-4 w-[50%]">
      {/* Team Leader */}
      <div className="border w-full p-4 bg-white rounded-xl space-y-2">
  <div className="flex bg-white">
    <strong className="w-[50%] bg-white">Leader:</strong>
    <span className="w-[50%] bg-white">{selector.name}</span>
  </div>
  <div className="flex bg-white">
    <strong className="w-[50%] bg-white">Email:</strong>
    <span className="w-[50%] bg-white">{selector.emailId}</span>
  </div>
  <div className="flex bg-white">
    <strong className="w-[50%] bg-white">Register Number:</strong>
    <span className="w-[50%] bg-white">{selector.reg_num}</span>
  </div>
  <div className="flex bg-white">
    <strong className="w-[50%] bg-white">Status:</strong>
    <span className="w-[50%] text-green-600 font-semibold bg-white">Accepted</span>
  </div>
</div>

      {/* Accepted Members */}
      {teamMembers.filter(member => member.status === 'accept').map((member, idx) => (
        <div key={idx} className="border w-full p-4 rounded-xl bg-gray-50">
          <p className="bg-white"><strong className="bg-white">Name:</strong> {member.name}</p>
          <p className="bg-white"><strong className="bg-white">Email:</strong> {member.emailId}</p>
          <p className="bg-white"><strong className="bg-white">Register Number:</strong> {member.reg_num}</p>
          <p className="bg-white"><strong className="bg-white">Department:</strong> {member.dept}</p>
          <p className="text-green-500 bg-white font-semibold">Status: Accepted</p>
        </div>
      ))}

      {/* Pending Invitations */}
      {pendingInvitations.map((invitation, idx) => (
        <div key={idx} className="border w-full p-4 rounded-xl bg-gray-50">
          <p className="bg-white"><strong className="bg-white">Name:</strong> {invitation.name}</p>
          <p className="bg-white"><strong className="bg-white">Email:</strong> {invitation.emailId}</p>
          <p className="bg-white"><strong className="bg-white">Register Number:</strong> {invitation.reg_num}</p>
          <p className="bg-white"><strong className="bg-white">Department:</strong> {invitation.dept}</p>
          <p className={`font-semibold bg-white ${
            invitation.status === 'accept' ? 'text-green-500' :
            invitation.status === 'reject' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            Status: {invitation.status}
          </p>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard Component for Team Status = 1
function DashboardView({ selector, teamMembers, navigate }) {
  // Sample assignments/projects data - replace with actual backend data
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Database Design Project',
      status: 'in_progress',
      deadline: '2025-06-15',
      progress: 65,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Web Development Assignment',
      status: 'completed',
      deadline: '2025-05-20',
      progress: 100,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Research Paper',
      status: 'pending',
      deadline: '2025-06-25',
      progress: 20,
      priority: 'low'
    }
  ]);

  // Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      const response = await instance.get('/student/assignments', {
        withCredentials: true
      });
      if (response.status === 200) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Quick stats for student
  const studentStats = [
    {
      title: 'Active Projects',
      value: assignments.filter(a => a.status === 'in_progress').length,
      color: 'text-blue-500'
    },
    {
      title: 'Completed',
      value: assignments.filter(a => a.status === 'completed').length,
      color: 'text-green-500'
    },
    {
      title: 'Pending',
      value: assignments.filter(a => a.status === 'pending').length,
      color: 'text-orange-500'
    },
    {
      title: 'Team Members',
      value: teamMembers.length + 1, // +1 for leader
      color: 'text-purple-500'
    }
  ];

  // Upcoming deadlines (next 2 assignments)
  const upcomingDeadlines = assignments
    .filter(a => a.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 2);

  // Recent activity - you can fetch this from backend
  const recentActivity = [
    'Submitted "Web Development Assignment" on May 20, 2025',
    'Started working on "Database Design Project" on May 15, 2025',
    'Team confirmed successfully on May 1, 2025'
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 bg-gray-50">
      {/* Header with Navigation */}
      <div className="w-full relative flex justify-end items-center mb-8">
        <h2 className="absolute text-3xl left-1/2 transform -translate-x-1/2 font-bold text-black">
          Student Dashboard
        </h2>
        <button
          className="px-4 py-2 border border-purple-500 text-white bg-purple-500 rounded hover:bg-purple-600"
          onClick={() => navigate('/student/invitations')}
        >
          Invitations
        </button>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2">Welcome to your Team Dashboard!</h1>
        <p className="text-lg text-gray-700">Welcome back, <span className="font-semibold text-purple-600">{selector?.name || 'Student'}</span></p>
        <p className="text-sm text-gray-500">Student ID: {selector?.reg_num || 'N/A'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {studentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:scale-105 transition duration-200"
          >
            <p className="text-sm text-gray-500 bg-white">{stat.title}</p>
            <h3 className={`text-2xl font-semibold bg-white ${stat.color}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Team Information */}
        <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
          <h3 className="text-xl font-semibold mb-4 bg-white">Team Information</h3>
         
          {/* Team Leader */}
          <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-gray-500 bg-green-50"><strong className="bg-green-50">Leader:</strong> {selector?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500 bg-green-50"><strong className="bg-green-50">Email:</strong> {selector?.emailId || 'N/A'}</p>
            <p className="text-sm text-gray-500 bg-green-50"><strong className="bg-green-50">Register Number:</strong> {selector?.reg_num || 'N/A'}</p>
            <p className="text-green-600 bg-green-50 font-semibold">Status: Team Leader</p>
          </div>
         
          {/* Team Members */}
          <div>
            <h5 className="font-medium mb-3 bg-white">Team Members</h5>
            <div className="space-y-2">
              {teamMembers.filter(member => member.status === 'accept').map((member, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-50">
                    <p className="font-medium text-sm bg-gray-50">{member.name}</p>
                    <p className="text-xs text-gray-500 bg-gray-50">{member.dept}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
          <h3 className="text-xl font-semibold mb-4 bg-white">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/student/projects')}
              className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition duration-200"
            >
              <h4 className="font-medium text-blue-800 bg-blue-50">View Projects</h4>
              <p className="text-sm text-blue-600 bg-blue-50">Access your team's projects and assignments</p>
            </button>
           
            <button
              onClick={() => navigate('/student/submissions')}
              className="w-full p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition duration-200"
            >
              <h4 className="font-medium text-green-800 bg-green-50">Submissions</h4>
              <p className="text-sm text-green-600 bg-green-50">View and manage your submissions</p>
            </button>
           
            <button
              onClick={() => navigate('/student/team-settings')}
              className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition duration-200"
            >
              <h4 className="font-medium text-purple-800 bg-purple-50">Team Settings</h4>
              <p className="text-sm text-purple-600 bg-purple-50">Manage your team settings and preferences</p>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center bg-white">
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((assignment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="bg-red-50">
                    <p className="font-medium text-gray-800 bg-red-50">{assignment.title}</p>
                    <p className="text-sm text-gray-600 bg-red-50">Progress: {assignment.progress}%</p>
                  </div>
                  <div className="text-right bg-red-50">
                    <p className="text-sm font-medium text-red-600 bg-red-50">{formatDate(assignment.deadline)}</p>
                    <p className="text-xs text-gray-500 bg-red-50">
                      {Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 bg-white">No upcoming deadlines</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
          <h3 className="text-xl font-semibold mb-4 bg-white">Recent Activity</h3>
          <ul className="space-y-3">
            {recentActivity.map((activity, index) => (
              <li key={index} className="flex items-start space-x-3 bg-white">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm bg-white">{activity}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main Student Dashboard Component
function Student_Dashboard() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [reInviteOpen, setReInviteOpen] = useState(false);
  const [teamConformationPending, setteamConformationPending] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
  });
  const [timeline, setTimeline] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selector = useSelector((state) => state.userSlice);

  const departments = [
    'CSE', 'AIDS', 'IT', 'AIML', 'CT', 'AGRI', 'ECE', 'EIE',
    'EEE', 'MECH', 'FT', 'FD'
  ];

  const totalMembersAllowed = 4;

  const isValidEmail = (email) => {
    return email.endsWith('@bitsathy.ac.in');
  };

  const fetchTimeline = async () => {
    try {
      const response = await instance.get('/admin/get_timelines');
      if (response.status === 200 && response.data.length > 0) {
        const current = new Date();
        const active = response.data.find(t => {
          const start = new Date(t.start_date);
          const end = new Date(t.end_date);
          return current >= start && current <= end;
        });
        setTimeline(active || null);
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((f) => ({ ...f, [name]: value }));
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(inviteForm.email)) {
      alert('Email must be a valid @bitsathy.ac.in address.');
      return;
    }

    try {
      const response = await instance.post(
        '/student/invite_member',
        {
          ...inviteForm,
          from_reg_num: selector.reg_num,
        }
      );

      if (response.status === 200) {
        setPendingInvitations(prev => [...prev, { ...inviteForm, status: 'pending' }]);
        setInviteForm({ name: '', email: '', registerNumber: '', department: '' });
        setIsInviteOpen(false);
        setReInviteOpen(false);
      }
    } catch (err) {
      console.error("Error sending invite:", err);
    }
  };

  const checkUserStatus = async (reg_num) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Access token is missing");
        return;
      }

      const response = await instance.post(
        '/student/fetch_team_status_and_invitations',
        { "from_reg_num": reg_num },
        { withCredentials: true }
      );

      if (response.status === 200) {
        let { teamConformationStatus, teamMembers, pendingInvitations, teamLeader } = response.data;
        setTeamStatus(teamConformationStatus);
        setTeamMembers(teamMembers || []);
        setPendingInvitations(pendingInvitations || []);

        if (teamMembers.length === 0) {
          let res = await instance.get(`/student/check_accepted_status/${reg_num}`, {
            withCredentials: true
          });
          if (res.status === 200 && res.data.length > 0) {
            setteamConformationPending(true);
          }
        }

        if (teamMembers.length > 0) {
          teamMembers = [...teamMembers, { teamLeader }];
          dispatch(addTeamMembers(teamMembers));
          dispatch(addTeamStatus(response.data));
        }
      }
    } catch (error) {
      console.error('Error checking team status:', error.response ? error.response.data : error.message);
    }
  };

  const handleConfirmTeam = async () => {
    try {
      const regNum = selector.reg_num;

      const response = await instance.patch(
        '/student/team_request/conform_team',
        {
          name: selector.name,
          emailId: selector.emailId,
          reg_num: selector.reg_num,
          dept: selector.dept,
          from_reg_num: regNum
        },
        { withCredentials: true }
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
    if (selector.reg_num) checkUserStatus(selector.reg_num);
  }, [selector.reg_num]);

  if (teamStatus === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Show Dashboard when team is confirmed (teamStatus === 1)
  if (teamStatus === 1) {
    return <DashboardView selector={selector} teamMembers={teamMembers} navigate={navigate} />;
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

  // Team Formation View (original code for teamStatus !== 1)
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-16">
      <div className="w-full relative flex justify-end items-center -mt-12 mb-6">
        <h2 className="absolute text-2xl left-1/2 transform -translate-x-1/2 font-bold text-black">
          Your Team
        </h2>
        <button
          className="px-4 py-2 border border-purple-500 text-white bg-purple-500 rounded hover:bg-purple-600"
          onClick={() => navigate('/student/invitations')}
        >
          Invitations
        </button>
      </div>

      <div className="w-[95%] max-w-[60rem] rounded-xl flex flex-col items-center gap-4 p-3 overflow-y-auto">
        <TeamMembersList


          teamMembers={teamMembers}
          pendingInvitations={pendingInvitations}
          selector={selector}
        />

        <div className='flex gap-40'>
          {(acceptedMembers.length + 1 < totalMembersAllowed) && timeline && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Invite Member
            </button>
          )}

          {(acceptedMembers.length + 1 >= 1 && teamStatus !== 1 && timeline) && (
            <button
              onClick={handleConfirmTeam}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Confirm Team
            </button>
          )}
        </div>
      </div>

      {isInviteOpen && (
        <InviteForm
          inviteForm={inviteForm}
          handleInviteChange={handleInviteChange}
          handleInviteSubmit={handleInviteSubmit}
          departments={departments}
          setIsInviteOpen={setIsInviteOpen}
        />
      )}

      {!timeline && (
        <p className="text-red-500 font-medium mt-4">
          Team creation is currently disabled. Please wait for the official schedule.
        </p>
      )}
    </div>
  );
}

export default Student_Dashboard;
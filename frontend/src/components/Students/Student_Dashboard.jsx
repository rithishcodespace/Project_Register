import { useState, useEffect } from 'react';
import InviteForm from './InviteForm';
import TeamDetails from './TeamDetails';
import instance from '../../utils/axiosInstance';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { addTeamMembers } from '../../utils/teamSlice';
import { useNavigate } from 'react-router-dom';
import { addTeamStatus } from '../../utils/teamStatus';

function Student_Dashboard() {
  const userSlice = useSelector((State) => State.userSlice);
  const teamSelector = useSelector((State) => State.teamSlice);
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

    const studentInfo = {
    studentId: "S123456",
    email: "alex.johnson@university.edu",
    program: "Computer Science",
    semester: "Fall 2023",
    gpa: 3.7,
    creditsCompleted: 45,
    upcomingAssignments: [
      { name: "Data Structures Project", dueDate: "2023-12-15", course: "CS 201" },
      { name: "Algorithms Quiz", dueDate: "2023-12-18", course: "CS 202" },
    ]
  };

  // Sample team data (between 1 and 4 teams)
  const teams = [
    {
      id: 1,
      name: "Quantum Coders",
      course: "Advanced Programming",
      members: [
        { name: "Alex Johnson", role: "Developer" },
        { name: "Sarah Smith", role: "Team Lead" },
        { name: "Michael Chen", role: "QA" },
        { name: "Emma Wilson", role: "Documentation" }
      ],
      currentProject: "AI Recommendation System",
      deadline: "2023-12-20"
    },
    {
      id: 2,
      name: "Data Wizards",
      course: "Database Systems",
      members: [
        { name: "Alex Johnson", role: "Database Designer" },
        { name: "James Brown", role: "Team Lead" },
        { name: "Olivia Green", role: "Frontend" }
      ],
      currentProject: "University Database Optimization",
      deadline: "2023-12-10"
    }
  ];

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
    }
     catch (err) {
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

  if (teamStatus === 1) {
    return (
       <div className="min-h-screen  p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl flex justify-center font-bold text-black">Student Dashboard</h1>
        <p className="flex justify-center mt-2 text-lg  text-gray-600">Welcome back, {userSlice.name} !</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow p-6 ">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Information </h2>
          <div className="space-y-3">
            <p><span className="font-medium text-gray-700">Name</span> {userSlice.name}</p>
            <p><span className="font-medium text-gray-700">Email:</span> {userSlice.emailId}</p>
            <p><span className="font-medium text-gray-700">Register Number:</span> {userSlice.reg_num}</p>
            <p><span className="font-medium text-gray-700">Department:</span> {userSlice.dept}</p>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Project</h2>
            <div className="space-y-6">
                <div  className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-medium text-gray-800">{teamSelector[0].project_id}hg</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Current Project:</span> 
                  </p>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Team Members:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div  className="flex items-center space-x-3 bg-gray-50 p-2 rounded">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                          q
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">s</p>
                          <p   className="text-xs text-gray-500">d</p>
                        </div>
                      </div>
                    
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-2 space-y-6">
          {/* Upcoming Assignments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Assignments</h2>
            <div className="space-y-4">
              {studentInfo.upcomingAssignments.map((assignment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800">{assignment.name}</h3>
                  <p className="text-sm text-gray-600">{assignment.course} • Due {assignment.dueDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Teams</h2>
            <div className="space-y-6">
              {teams.map(team => (
                <div key={team.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-800">{team.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {team.course}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Current Project:</span> {team.currentProject} (Due {team.deadline})
                  </p>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Team Members:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.members.map((member, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-2 rounded">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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

  // ...rest of your imports and code...

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
      <div className="border w-full p-4 bg-white rounded-xl">
        <p className=' bg-white '><strong className=' bg-white '>Leader:</strong> {selector.name}</p>
        <p className=' bg-white '><strong className=' bg-white '>Email:</strong> {selector.emailId}</p>
        <p className=' bg-white '><strong className=' bg-white '>Register Number:</strong> {selector.reg_num}</p>
        <p className="text-green-600  bg-white  font-semibold">Status: Accepted</p>
      </div>

      {acceptedMembers.map((member, idx) => (
        <div key={idx} className="border w-full p-4 rounded-xl bg-gray-50">
          <p className=' bg-white '><strong className=' bg-white '>Name:</strong> {member.name}</p>
          <p className=' bg-white '><strong className=' bg-white '>Email:</strong> {member.emailId}</p>
          <p className=' bg-white '><strong className=' bg-white '>Register Number:</strong> {member.reg_num}</p>
          <p className=' bg-white '><strong className=' bg-white '>Department:</strong> {member.dept}</p>
          <p className="text-green-500 bg-white font-semibold">Status: Accepted</p>
        </div>
      ))}

      {pendingInvitations.map((invitation, idx) => (
        <div key={idx} className="border w-full p-4 rounded-xl bg-gray-50">
          <p className=' bg-white '><strong className=' bg-white '>Name:</strong> {invitation.name}</p>
          <p className=' bg-white '><strong className=' bg-white '>Email:</strong> {invitation.emailId}</p>
          <p className=' bg-white '><strong className=' bg-white '>Register Number:</strong> {invitation.reg_num}</p>
          <p className=' bg-white '><strong className=' bg-white '>Department:</strong> {invitation.dept}</p>
          <p className={`font-semibold  bg-white  ${
            invitation.status === 'accept' ? 'text-green-500' :
            invitation.status === 'reject' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            Status: {invitation.status}
          </p>
        </div>
      ))}
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
          className="px-4 py-2 bg-green-600 text-white rounded "
        >
          Confirm Team
        </button>
        
      )}</div>
    </div>

    {isInviteOpen && (
      <InviteForm
        {...{ inviteForm, handleInviteChange, handleInviteSubmit, departments, setIsInviteOpen }}
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

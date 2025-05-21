import { useState, useEffect } from 'react';
// import CreateForm from './CreateForm';
import InviteForm from './InviteForm';
import TeamDetails from './TeamDetails';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { addTeamMembers,removeTeamMembers } from '../../utils/teamSlice';
import { useNavigate ,Link  } from 'react-router-dom';
import { addTeamStatus } from '../../utils/teamStatus';

function Student_Dashboard() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [teamConformationPending,setteamConformationPending] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null); // 0 or 1
  const [teamMembers, setTeamMembers] = useState([]); // Accepted members
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
  });
  

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selector = useSelector((state) => state.userSlice);

  const departments = [
    'CSE', 'AIDS', 'IT', 'AIML', 'CT', 'AGRI', 'ECE', 'EIE', 'EEE', 'MECH', 'FT', 'FD'
  ];

  const totalMembersAllowed = 4;

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((f) => ({ ...f, [name]: value }));
  };

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
         withCredentials:true
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
              Authorization: `Bearer ${token}`,
            }
          })
          if(res.status === 200 && res.data.length > 0)
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
        'http://localhost:1234/student/team_request/conform_team',
        { 
          name: selector.name,
          emailId: selector.emailId,
          reg_num: selector.reg_num,
          dept: selector.dept,
          from_reg_num: regNum,
          to_reg_num: selector.reg_num 
        },
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
  if (selector.reg_num) checkUserStatus(selector.reg_num);
}, [selector.reg_num]);

  if (teamStatus === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (teamStatus === 1) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
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
    <div className="min-h-screen flex flex-col items-center px-6 pt-16">
      
      <div className="w-full relative flex justify-end items-center -mt-12 mb-6">
        <h2 className="absolute text-2xl left-1/2 transform -translate-x-1/2  font-bold text-black">
          Your Team
        </h2>
        <button
          className="px-4 py-2 border border-purple-500 text-white bg-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
          onClick={() => navigate('/student/invitations')}
        >
          Invitations
        </button>
      </div>


      <div className="w-[95%] max-w-[60rem] rounded-xl bg- flex flex-col items-center gap-4 p-3 overflow-y-auto">

        <div className="border w-full p-4  bg-white rounded-xl ">
          <p className=" bg-white "><strong className="bg-white">Leader:</strong> YOU</p>
          <p className=" bg-white "><strong className="bg-white">Email:</strong> {selector.emailId}</p>
          <p className=" bg-white "><strong className="bg-white">Register Number:</strong> {selector.reg_num}</p>
          <p className="text-green-600 bg-white font-semibold">Status: Accepted</p>
        </div>

        {acceptedMembers.map((member, idx) => (
          <div key={idx} className="border w-full p-4 rounded-xl bg-gray-50">
            <p className="bg-white"><strong className="bg-white">Name:</strong> {member.name}</p>
            <p className="bg-white"><strong className="bg-white">Email:</strong> {member.emailId}</p>
            <p className="bg-white"><strong className="bg-white">Register Number:</strong> {member.reg_num}</p>
            <p className="bg-white"><strong className="bg-white">Department:</strong> {member.dept}</p>
            <p className="text-green-500 bg-white font-semibold">Status: Accepted</p>
          </div>
        ))}

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
              Status: {invitation.status === 'interested' ? 'Pending' : invitation.status}
            </p>
          </div>
        ))}

        {(remainingInvites > 0 || acceptedMembers.length + 1 >= 3) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {remainingInvites > 0 && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                Invite Member
              </button>
            )}
            {acceptedMembers.length + 1 >= 1 && !selector.teamConfirmationStatus && (
              <button
                onClick={handleConfirmTeam}
                className="px-4 py-2 bg-green-600 text-white rounded"
              ><Link to="/student"  onClick={() => {window.location.href = "/student"; }}  className='bg-green-600' >Confirm Team</Link></button>
            )}
          </div>
        )}
      </div>

      {isInviteOpen && (
        <InviteForm
          {...{ inviteForm, handleInviteChange, handleInviteSubmit, departments, setIsInviteOpen }}
        />
      )}
    </div>
  );
}

export default Student_Dashboard;
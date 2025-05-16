import { useState, useEffect } from 'react';
import CreateForm from './CreateForm';
import InviteForm from './InviteForm';
import { Link, useNavigate } from 'react-router-dom';
import TeamDetails from './TeamDetails';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { addTeamMembers } from '../../utils/teamSlice';
import { addTeamStatus } from '../../utils/teamStatus';

function Student_Team() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [teamConformationPending, setTeamConformationPending] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
  });

  const [teamStatus, setTeamStatus] = useState(null); // 0 or 1
  const [teamMembers, setTeamMembers] = useState([]); // Accepted members
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selector = useSelector((state) => state.userSlice);
  const departments = [
    'CSE', 'AIDS', 'IT', 'AIML', 'CT', 'AGRI', 'ECE', 'EIE', 'EEE', 'MECH', 'FT', 'FD',
  ];
  const totalMembersAllowed = 4;

  const isValidEmail = (email) => email.endsWith('@bitsathy.ac.in');

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

    setPendingInvitations((prev) => [
      ...prev,
      { ...inviteForm, status: 'Pending' },
    ]);
    setInviteForm({ name: '', email: '', registerNumber: '', department: '' });
    setIsInviteOpen(false);
  };

  const getProfile = async () => {
    try {
      const response = await axios.get('http://localhost:1234/profile/view', {
        withCredentials: true,
      });
      dispatch(addUser(response.data[0]));
      checkUserStatus(response.data[0].reg_num);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const checkUserStatus = async (reg_num) => {
    try {
      const response = await axios.post(
        'http://localhost:1234/student/fetch_team_status_and_invitations',
        { from_reg_num: reg_num },
        { withCredentials: true }
      );

      if (response.status === 200) {
        let { teamConformationStatus, teamMembers, pendingInvitations, teamLeader } =
          response.data;

        setTeamStatus(teamConformationStatus);
        setTeamMembers(teamMembers || []);
        setPendingInvitations(pendingInvitations || []);

        // Check if part of another team but not confirmed
        if (teamMembers.length === 0) {
          const res = await axios.get(
            `http://localhost:1234/student/check_accepted_status/${reg_num}`,
            { withCredentials: true }
          );
          if (res.status === 200 && res.data.length > 0) {
            setTeamConformationPending(true);
          }
        }

        if (teamMembers.length > 0) {
          const fullTeam = [...teamMembers, { teamLeader }];
          dispatch(addTeamMembers(fullTeam));
          dispatch(addTeamStatus(response.data));
        }
      }
    } catch (error) {
      console.error('Error checking team status:', error.message);
    }
  };

  const handleConfirmTeam = async () => {
    try {
      const response = await axios.patch(
        'http://localhost:1234/student/team_request/conform_team/TEAM_ID_002',
        { from_reg_num: selector.reg_num },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setTeamStatus(1);
        alert('Team confirmed successfully!');
      }
    } catch (error) {
      console.error('Error confirming team:', error.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (teamStatus === null) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (teamStatus === 1) {
    return (
      <div className="flex flex-col justify-center items-center h-[600px]">
        <h1 className="text-3xl font-bold text-purple-600 mb-11">
          Welcome to your Team Dashboard!
        </h1>
        <Link to="/">
          <button className="text-lg rounded-lg p-2 bg-purple-600 text-white hover:bg-purple-700">
            Create Team
          </button>
        </Link>
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

  const acceptedMembers = teamMembers.filter(
    (member) => member.status === 'accept'
  );
  const remainingInvites =
    totalMembersAllowed -
    (1 + pendingInvitations.length + acceptedMembers.length);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-16">
      <div className="w-full flex justify-end -mt-12 mb-6">
        <button
          className="px-4 py-2 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
          onClick={() => navigate('/student/invitations')}
        >
          Invitations
        </button>
      </div>

      <div className="w-[95%] max-w-[60rem] rounded-xl flex flex-col items-center gap-4 p-9 overflow-y-auto">
        <h1 className="text-black text-2xl font-bold">Your Team</h1>

        <div className="border w-full bg-white p-4 rounded-xl ">
          <p><strong>Leader:</strong> YOU</p>
          <p><strong>Email:</strong> {selector.emailId}</p>
          <p><strong>Register Number:</strong> {selector.reg_num}</p>
          <p className="text-green-600 font-semibold">Status: Accepted</p>
        </div>

        {acceptedMembers.map((member, idx) => (
          <div key={idx} className="border bg-white w-full p-4 rounded-xl">
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Email:</strong> {member.emailId}</p>
            <p><strong>Register Number:</strong> {member.reg_num}</p>
            <p><strong>Department:</strong> {member.dept}</p>
            <p className="text-green-500 font-semibold">Status: Accepted</p>
          </div>
        ))}

        {pendingInvitations.map((inv, idx) => (
          <div key={idx} className="border bg-white w-full p-4 rounded-xl">
            <p><strong>Name:</strong> {inv.name}</p>
            <p><strong>Email:</strong> {inv.emailId}</p>
            <p><strong>Register Number:</strong> {inv.reg_num}</p>
            <p><strong>Department:</strong> {inv.dept}</p>
            <p
              className={`font-semibold ${
                inv.status === 'accept'
                  ? 'text-green-500'
                  : inv.status === 'reject'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}
            >
              Status: {inv.status === 'interested' ? 'Pending' : inv.status}
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
            {acceptedMembers.length + 1 >= 2 && !selector.teamConfirmationStatus && (
              <button
                onClick={handleConfirmTeam}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Confirm Team
              </button>
            )}
          </div>
        )}
      </div>

      {isInviteOpen && (
        <InviteForm
          {...{
            inviteForm,
            handleInviteChange,
            handleInviteSubmit,
            departments,
            setIsInviteOpen,
          }}
        />
      )}
    </div>
  );
}

export default Student_Team;

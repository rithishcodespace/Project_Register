// StudentDashboard.js (Frontend)

import { useState, useEffect } from 'react';
import CreateForm from './CreateForm';
import InviteForm from './InviteForm';
import TeamDetails from './TeamDetails';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../../utils/userSlice';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory

function StudentDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: ' ',
  });
  const [teamCreated, setTeamCreated] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
  });
  const [members, setMembers] = useState([]);

  const totalMembers = 4;
  const departments = [
    'CSE', 'AIDS', 'IT', 'AIML', 'CT', 'AGRI', 'ECE', 'EIE', 'EEE', 'MECH', 'FT', 'FD'
  ];

  const selector = useSelector((Store) => Store.userSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Use useNavigate hook for navigation

  const isValidEmail = (email) => email.endsWith('@bitsathy.ac.in');

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(createForm.email)) {
      alert('Email must be a valid @bitsathy.ac.in address.');
      return;
    }

    // Dispatch here after successful validation
    dispatch(addUser({
      name: createForm.name,
      email: createForm.email,
      registerNumber: createForm.registerNumber,
      department: createForm.department,
    }));

    setTeamCreated(true);
    setIsCreateOpen(false);
  };

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
    setMembers((m) => [...m, inviteForm]);
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

      console.log('Profile Data:', response.data[0]);
      checkUserStatus(response.data[0].emailId);

    } catch (error) {
      console.error('Error fetching profile:', error.response ? error.response.data : error.message);
    }
  };

  async function checkUserStatus(emailId) {
    console.log("emailId:", emailId);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Access token is missing");
      return;
    }
    let response = await axios.post("http://localhost:1234/student/fetch_team_status_and_invitations", { "emailId": emailId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.status === 200) {
      console.log("user team status", response.data);
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="h-[29rem] flex flex-col items-center justify-center px-6 pt-16">
      {!teamCreated && (
        <div className="w-full flex justify-end -mt-12 mb-6">
          <button
            className="px-4 py-2 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
            onClick={() => navigate('/student/invitations')}
             // Navigate to Invitation page using navigate
          >
            Invitations
          </button>
        </div>
      )}

      <div className="w-[95%] max-w-[60rem] h-[30rem] rounded-xl bg-white flex flex-col items-center justify-center gap-4 p-9 overflow-y-auto">
        {!teamCreated ? (
          <>
            <h1 className="text-purple-500 text-2xl font-bold bg-white">CREATE YOUR OWN TEAM</h1>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              CREATE
            </button>
          </>
        ) : (
          <>
            <h1 className="text-red-500 bg-white text-2xl font-semibold -mt-36 mb-4">Team code: cs12</h1>
            <TeamDetails
              members={members}
              createForm={createForm}
              totalMembers={totalMembers}
              setIsInviteOpen={setIsInviteOpen}
            />
          </>
        )}
      </div>

      {isCreateOpen && (
        <CreateForm
          {...{ createForm, handleCreateChange, handleCreateSubmit, departments, setIsCreateOpen }}
        />
      )}
      {isInviteOpen && (
        <InviteForm
          {...{ inviteForm, handleInviteChange, handleInviteSubmit, departments, setIsInviteOpen }}
        />
      )}
    </div>
  );
}

export default StudentDashboard;

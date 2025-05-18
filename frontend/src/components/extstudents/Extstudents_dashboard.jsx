import { useState, useEffect } from 'react';
import InviteForm from './InviteForm';

function Student_Dashboard() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null); // null, 0, or 1
  const [teamConformationPending, setTeamConformationPending] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [user, setUser] = useState({
    name: 'Mathan',
    email: 'mathan@bitsathy.ac.in',
    registerNumber: '22CSE001',
    department: 'CSE',
  });

  const totalMembersAllowed = 4;

  const departments = [
    'CSE', 'AIDS', 'IT', 'AIML', 'CT', 'AGRI', 'ECE', 'EIE', 'EEE', 'MECH', 'FT', 'FD'
  ];

  const isValidEmail = (email) => email.endsWith('@bitsathy.ac.in');

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
  });

  useEffect(() => {
    // Simulate fetching status from server
    setTimeout(() => {
      setTeamStatus(0); // Set to 0 to simulate not confirmed
    }, 1000);
  }, []);

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((f) => ({ ...f, [name]: value }));
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(inviteForm.email)) {
      alert('Use @bitsathy.ac.in email');
      return;
    }

    const newMember = {
      ...inviteForm,
      status: 'Pending',
    };

    setPendingInvitations([...pendingInvitations, newMember]);
    setInviteForm({ name: '', email: '', registerNumber: '', department: '' });
    setIsInviteOpen(false);
  };

  const handleConfirmTeam = () => {
    if (teamMembers.length + 1 >= 2) {
      setTeamStatus(1);
      alert("Team confirmed successfully!");
    } else {
      alert("You need at least 2 members to confirm the team");
    }
  };

  const acceptedMembers = teamMembers.filter(member => member.status === 'Accepted');
  const remainingInvites = totalMembersAllowed - (1 + pendingInvitations.length + acceptedMembers.length);

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

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-16">
      <h2 className="text-2xl font-bold mb-4">Your Team</h2>

      <div className="w-full max-w-2xl p-4 bg-white border rounded-xl shadow-sm mb-6">
        <p><strong>Leader:</strong> YOU</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Register Number:</strong> {user.registerNumber}</p>
        <p className="text-green-600 font-semibold">Status: Accepted</p>
      </div>

      {acceptedMembers.map((member, idx) => (
        <div key={idx} className="w-full max-w-2xl p-4 bg-gray-50 border rounded-xl mb-4">
          <p><strong>Name:</strong> {member.name}</p>
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Register Number:</strong> {member.registerNumber}</p>
          <p><strong>Department:</strong> {member.department}</p>
          <p className="text-green-500 font-semibold">Status: Accepted</p>
        </div>
      ))}

      {pendingInvitations.map((invitation, idx) => (
        <div key={idx} className="w-full max-w-2xl p-4 bg-gray-50 border rounded-xl mb-4">
          <p><strong>Name:</strong> {invitation.name}</p>
          <p><strong>Email:</strong> {invitation.email}</p>
          <p><strong>Register Number:</strong> {invitation.registerNumber}</p>
          <p><strong>Department:</strong> {invitation.department}</p>
          <p className="text-yellow-500 font-semibold">Status: Pending</p>
        </div>
      ))}

      <div className="mt-6 flex gap-4">
        {remainingInvites > 0 && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Invite Member
          </button>
        )}

        {acceptedMembers.length + 1 >= 2 && (
          <button
            onClick={handleConfirmTeam}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Confirm Team
          </button>
        )}
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
    </div>
  );
}

export default Student_Dashboard;

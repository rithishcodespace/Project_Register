import { useState } from 'react';
import CreateForm from './CreateForm';
import InviteForm from './InviteForm';
import TeamDetails from './TeamDetails';
//import { useLockBodyScroll } from './hooks/useLockBodyScroll';

function StudentDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: '',
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

 // useLockBodyScroll(isCreateOpen || isInviteOpen);

  return (
    <div className="h-[29rem] flex flex-col items-center justify-center px-6 pt-16">
      {!teamCreated && (
        <div className="w-full flex justify-end -mt-12 mb-6">
          <button
            className="px-4 py-2 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
            onClick={() => {}}
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

      {isCreateOpen && <CreateForm {...{ createForm, handleCreateChange, handleCreateSubmit, departments, setIsCreateOpen }} />}
      {isInviteOpen && <InviteForm {...{ inviteForm, handleInviteChange, handleInviteSubmit, departments, setIsInviteOpen }} />}
    </div>
  );
}

export default StudentDashboard;

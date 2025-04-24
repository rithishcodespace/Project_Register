import { useState, useEffect } from 'react';

// Scroll lock hook
function useLockBodyScroll(lock) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lock]);
}

export default function Student_Dashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    cluster: '',
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

  // Lock scroll when any modal is open
  useLockBodyScroll(isCreateOpen || isInviteOpen);

  function generateTeamId() {
    const timestamp = Date.now(); // Get current timestamp
    const randomPart = Math.floor(Math.random() * 1000); // Generate a random part for added uniqueness
    setteamId(`team-${timestamp}-${randomPart}`);
}

  const[teamId,setteamId] = useState();

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6">
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

      <div className="w-[95%] max-w-[60rem] h-[32rem] rounded-xl bg-white flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">
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

            <div className="w-full">
              <div className="grid grid-cols-5 bg-gray-200 px-4 py-2 rounded-t">
                <div className="font-semibold bg-gray-200">Name</div>
                <div className="font-semibold bg-gray-200">Email</div>
                <div className="font-semibold bg-gray-200 pl-3 ml-14">Register No</div>
                <div className="font-semibold bg-gray-200 ml-20">Department</div>
                <div className="font-semibold text-right bg-gray-200">Action</div>
              </div>

              <div className="space-y-1 bg-grey-500">
                {Array.from({ length: totalMembers }).map((_, idx) => {
                  const isCreator = idx === 0;
                  const memberData = !isCreator ? members[idx - 1] : null;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-5 items-center bg-white px-4 py-2 rounded shadow"
                    >
                      <div className="bg-white">
                        {isCreator
                          ? createForm.name
                          : memberData
                          ? memberData.name
                          : '-'}
                      </div>

                      <div className="text-sm text-gray-600 bg-white w-[18rem]" style={{ wordBreak: 'break-word' }}>
                        {isCreator
                          ? createForm.email
                          : memberData
                          ? memberData.email
                          : '-'}
                      </div>

                      <div className="bg-white pl-3 ml-14" style={{ wordBreak: 'break-word' }}>
                        {isCreator
                          ? createForm.registerNumber
                          : memberData
                          ? memberData.registerNumber
                          : '-'}
                      </div>

                      <div className="bg-white ml-20">
                        {isCreator
                          ? createForm.cluster
                          : memberData
                          ? memberData.department
                          : '-'}
                      </div>

                      <div className="text-right bg-white">
                        {!isCreator && !memberData && (
                          <button
                            onClick={() => setIsInviteOpen(true)}
                            className="px-3 py-1 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
                          >
                            Invite
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4 bg-white">New Project Invitation</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4 bg-white">
              {[ 
                { field: 'name', label: 'Your Name', type: 'text' },
                { field: 'email', label: 'Your Email', type: 'email' },
                { field: 'registerNumber', label: 'Register Number', type: 'text' },
                { field: 'cluster', label: 'Cluster', type: 'text' },
              ].map(({ field, label, type }) => (
                <div key={field} className="bg-white">
                  <label className="block text-sm font-medium text-gray-700 bg-white">{label}</label>
                  <input
                    name={field}
                    value={createForm[field]}
                    onChange={handleCreateChange}
                    type={type}
                    required
                    className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-between bg-white space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => generateTeamId()}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4 bg-white">Invite a Member</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4 bg-white">
              {[ 
                { field: 'name', label: 'Name', type: 'text' },
                { field: 'email', label: 'Email', type: 'email' },
                { field: 'registerNumber', label: 'Register Number', type: 'text' },
                { field: 'department', label: 'Department', type: 'text' },
              ].map(({ field, label, type }) => (
                <div key={field} className="bg-white">
                  <label className="block text-sm font-medium text-gray-700 bg-white">{label}</label>
                  <input
                    name={field}
                    value={inviteForm[field]}
                    onChange={handleInviteChange}
                    type={type}
                    required
                    placeholder={`Enter ${label}`}
                    className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
                  />
                </div>
              ))}
              <div className="mt-6 flex bg-white justify-between space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

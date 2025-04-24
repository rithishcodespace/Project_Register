import { useState } from 'react';

export default function Student_Dashboard() {
  // Create Team modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    projectName: '',
    cluster: '',
    totalMembers: 1,
    deadline: '',
  });
  const [teamCreated, setTeamCreated] = useState(false);

  // Invite Member modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [members, setMembers] = useState([]);

  // Handlers for Create Team form
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((f) => ({
      ...f,
      [name]:
        name === 'totalMembers'
          ? Math.max(1, Number(value))
          : value,
    }));
  };
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setTeamCreated(true);
    setIsCreateOpen(false);
  };

  // Handlers for Invite Member form
  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((f) => ({ ...f, [name]: value }));
  };
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    setMembers((m) => [...m, inviteForm]);
    setInviteForm({ name: '', email: '', department: '' });
    setIsInviteOpen(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Top Invitations button (hidden after team creation) */}
      {!teamCreated && (
        <div className="w-full flex justify-end -mt-12 mb-8">
          <button
            className="px-4 py-2 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition"
            onClick={() => {/* invitation logic */}}
          >
            Invitations
          </button>
        </div>
      )}

      {/* Main Create-Team box */}
      <div className="w-[60rem] h-[32rem] rounded-xl bg-red-500 flex flex-col items-center justify-center gap-4 p-6 overflow-y-auto">
        {!teamCreated ? (
          <>
            <h1 className="text-purple-500 text-2xl font-bold">
              CREATE YOUR OWN TEAM
            </h1>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              CREATE
            </button>
          </>
        ) : (
          <>
            <h2 className="text-white text-2xl font-semibold">
              {createForm.projectName}
            </h2>
            <p className="text-white">Cluster: {createForm.cluster}</p>
            <p className="text-white">Deadline: {createForm.deadline}</p>

            {/* Header Row */}
            <div className="w-full mt-4">
              <div className="grid grid-cols-4 bg-gray-200 px-4 py-2 rounded-t">
                <div className="font-semibold">Name</div>
                <div className="font-semibold">Email</div>
                <div className="font-semibold">Department</div>
                <div className="font-semibold text-right">Action</div>
              </div>

              {/* Data Rows */}
              <div className="space-y-1">
                {Array.from({ length: createForm.totalMembers }).map((_, idx) => {
                  const isCreator = idx === 0;
                  const memberData = !isCreator ? members[idx - 1] : null;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-4 items-center bg-white px-4 py-2 rounded shadow"
                    >
                      {/* Name */}
                      <div>
                        {isCreator
                          ? createForm.name
                          : memberData
                          ? memberData.name
                          : '-'}
                      </div>

                      {/* Email */}
                      <div className="text-sm text-gray-600">
                        {isCreator
                          ? createForm.email
                          : memberData
                          ? memberData.email
                          : '-'}
                      </div>

                      {/* Department */}
                      <div>
                        {isCreator
                          ? createForm.cluster
                          : memberData
                          ? memberData.department
                          : '-'}
                      </div>

                      {/* Action */}
                      <div className="text-right">
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

      {/* Create Team Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              New Project Invitation
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {[
                { field: 'name', label: 'Your Name', type: 'text' },
                { field: 'email', label: 'Your Email', type: 'email' },
                { field: 'projectName', label: 'Project Name', type: 'text' },
                { field: 'cluster', label: 'Cluster', type: 'text' },
                {
                  field: 'totalMembers',
                  label: 'Total Members',
                  type: 'number',
                  min: 1,
                },
                { field: 'deadline', label: 'Deadline', type: 'date' },
              ].map(({ field, label, type, min }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    name={field}
                    value={createForm[field]}
                    onChange={handleCreateChange}
                    type={type}
                    min={min}
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite a Member</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              {[
                { field: 'name', label: 'Name', type: 'text' },
                { field: 'email', label: 'Email', type: 'email' },
                { field: 'department', label: 'Department', type: 'text' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    name={field}
                    value={inviteForm[field]}
                    onChange={handleInviteChange}
                    type={type}
                    placeholder={`Enter ${label}`}
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-between space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
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

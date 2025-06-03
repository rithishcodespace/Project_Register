import React, { useState, useEffect } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

const InvitationPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const selector = useSelector((Store) => Store.userSlice);

  // Fetch latest invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!selector.reg_num) return;
      try {
        const resp = await instance.get(
          `/student/request_recived/${selector.reg_num}`
        );
        if (resp.status === 200 && resp.data.length) {
          const inv = resp.data[0];
          const userRes = await instance.get(
            `/student/get_student_details_by_regnum/${inv.from_reg_num}`
          );
          if (userRes.status === 200) {
            const student = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
            setInvitations([{
              ...student,
              status: inv.status,
              from_reg_num: inv.from_reg_num,
              to_reg_num: inv.to_reg_num
            }]);
          }
        }
      }catch (err) {
        console.error(err);
      }
    };
    fetchInvitations();
  }, [selector.reg_num]);

  const handleAction = async (invite, status, reason = '') => {
    setLoadingId(invite.reg_num);
    try {
      await instance.patch(
        `/student/team_request/${status}/${invite.to_reg_num}/${invite.from_reg_num}`,
        { reason }  // send reason when rejecting
      );
      setInvitations(invites =>
        invites.map(i =>
          i.reg_num === invite.reg_num ? { ...i, status } : i
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setRejectingId(null);
    }
  };

  const onReasonChange = (regNum, text) => {
    setRejectionReasons(prev => ({ ...prev, [regNum]: text }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl text-center font-bold mb-6">Invitations</h1>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            {['Name','Email','Reg. No','Dept','Action'].map(h => (
              <th key={h} className="p-3 border bg-white">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invitations.map(invite => (
            <tr key={invite.reg_num}>
              <td className="px-4 py-2 border">{invite.name}</td>
              <td className="px-4 py-2 border">{invite.emailId}</td>
              <td className="px-4 py-2 border">{invite.reg_num}</td>
              <td className="px-4 py-2 border">{invite.dept}</td>

              <td className="px-4 py-2 border text-center">
                {invite.status === 'interested' ? (
                  rejectingId === invite.reg_num ? (
                    <div className="space-y-2">

                      <textarea
                        className="w-full border px-2 py-1 rounded resize-none"
                        rows={3}
                        placeholder="Reason for rejection"
                        value={rejectionReasons[invite.reg_num] || ''}
                        onChange={e => onReasonChange(invite.reg_num, e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">


                        <button
                          className="px-4 py-2 bg-gray-300 rounded"
                          onClick={() => setRejectingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
                          disabled={loadingId === invite.reg_num}
                          onClick={() =>
                            handleAction(invite, 'reject',rejectionReasons[invite.reg_num] || '')
                          }
                        >
                          {loadingId === invite.reg_num ? 'Rejecting…' : 'Submit'}
                        </button>


                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handleAction(invite, 'accept')}
                        className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={loadingId === invite.reg_num}
                      >
                        {loadingId === invite.reg_num ? 'Accepting…' : 'Accept'}
                      </button>

                      <button
                        onClick={() => setRejectingId(invite.reg_num)}
                        className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={loadingId === invite.reg_num}
                      >
                        Reject
                      </button>
                    </div>
                  )
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      invite.status === 'accept' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {invite.status === 'accept' ? 'Accepted' : 'Rejected'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationPage;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Team_Details() {
  const { teamId } = useParams();
  const guideRegNum = useSelector((state) => state.userSlice).reg_num;
  console.log(guideRegNum);

  const [teamDetails, setTeamDetails] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const verifiedWeeksRes = await instance.get(`/guide/no_of_weeks_verified/${teamId}`);
        const verifiedWeekNum = parseInt(verifiedWeeksRes.data);
        const nextWeek = verifiedWeekNum + 1;

        const teamRes = await instance.get(`/guide/gets_entire_team/${teamId}`);
        const team = teamRes.data[0];
        setTeamDetails(team);

        const progressField = `week${nextWeek}_progress`;
        if (team[progressField]) {
          setCurrentWeek(nextWeek);
        } else {
          setCurrentWeek(null);
        }
      } catch (error) {
        console.error(error);
        alert('Error fetching team data');
      }
    };

    fetchData();
  }, [teamId, guideRegNum]);

  const handleSubmit = async () => {
    if (status === 'accept' && !remarks) {
      alert('Please provide remarks');
      return;
    }
    if (status === 'reject' && !reason) {
      alert('Please provide reason for rejection');
      return;
    }

    try {
      const payload = {
        ...(status === 'accept' ? { remarks, reason: null } : {}),
        ...(status === 'reject' ? { reason, remarks: null } : {}),
      };

      const res = await instance.patch(
        `/guide/verify_weekly_logs/${guideRegNum}/${currentWeek}/${status}/${teamId}`,
        payload
      );

      alert(res.data);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error submitting verification');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center relative">
        <button
          onClick={() => navigate('/guide')}
          className="absolute bg-blue-500 left-0 rounded-md px-4 py-2 text-white hover:bg-blue-600"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold">Team Details</h1>
      </div>

      <p className="mt-2 flex justify-center text-left border-b border-gray-300 pb-2 text-gray-700 font-mono text-lg">
        Team ID: <span className="text-blue-600">{teamId}</span>
      </p>

      {teamDetails && (
        <div className="mb-4 mt-5">
          <p><strong>Guide RegNum:</strong> {teamDetails.guide_reg_num}</p>
          <p><strong>Project ID:</strong> {teamDetails.project_id}</p>
        </div>
      )}

      {currentWeek ? (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Week {currentWeek} Progress</h2>
          <p className="mb-2">{teamDetails[`week${currentWeek}_progress`]}</p>

          {!status && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setStatus('accept')}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => setStatus('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}

          {status === 'accept' && (
            <>
              <textarea
                placeholder="Enter remarks"
                className="w-full p-2 border rounded mt-4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit Acceptance
              </button>
            </>
          )}

          {status === 'reject' && (
            <>
              <textarea
                placeholder="Enter reason for rejection"
                className="w-full p-2 border rounded mt-4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit Rejection
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No recent updates from the team.</p>
      )}
    </div>
  );
}

export default Team_Details;

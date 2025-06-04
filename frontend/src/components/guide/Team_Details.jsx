import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Team_Details() {
  const { teamId } = useParams();
  const guideRegNum = useSelector((state) => state.userSlice).reg_num;

  const [teamDetails, setTeamDetails] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const [isWeekComplete, setIsWeekComplete] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const verifiedWeeksRes = await instance.get(`/guide/no_of_weeks_verified/${teamId}`);
      const verifiedWeekNum = parseInt(verifiedWeeksRes.data);
      let nextWeek = isNaN(verifiedWeekNum) ? 1 : verifiedWeekNum + 1;

      const teamRes = await instance.get(`/guide/gets_entire_team/${teamId}`);
      const team = teamRes.data;
      setTeamDetails(team);

      const progressField = `week${nextWeek}_progress`;

      const allSubmitted = team.every(
        (member) => member[progressField] && member[progressField].trim() !== ''
      );

      setIsWeekComplete(allSubmitted);
      if (team.length > 0 && team[0][progressField]) {
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

      {teamDetails.length>0 && (
        <div className="mb-4 mt-5">
          <p><strong>Guide RegNum:</strong> {guideRegNum}</p>
          <p><strong>Project ID:</strong> {teamDetails[0].project_id}</p>
        </div>
      )}

      {currentWeek ? (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl bg-white font-semibold mb-2">Week {currentWeek} Progress</h2>
          {teamDetails.map((member, index) => (
            <div key={index} className="mb- p-3 flex  rounded bg-white">
              <h3 className="font-semibold flex mr-4 bg-white text-blue-700">
                {member.name} ({member.reg_num}) : 
              </h3>
              <p className="text-black bg-white flex ">
                {member[`week${currentWeek}_progress`] || 'No progress submitted.'}
              </p>
            </div>
          ))}


          {!status && (
            <div className="flex gap-4 bg-white mt-4">
  <button
    onClick={() => setStatus('accept')}
    disabled={!isWeekComplete}
    className={`px-4 py-2 rounded text-white ${isWeekComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
  >
    Accept
  </button>
  <button
    onClick={() => setStatus('reject')}
    disabled={!isWeekComplete}
    className={`px-4 py-2 rounded text-white ${isWeekComplete ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
  >
    Reject
  </button>
</div>

          )}

          {status === 'accept' && (
            <>
              <textarea
                placeholder="Enter remarks"
                className="w-full p-2 border bg-white rounded mt-4"
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
                className="w-full p-2 bg-white border rounded mt-4"
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

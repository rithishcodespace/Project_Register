import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

function Schedule_review() {
  const [reviewDate, setReviewDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [reason, setReason] = useState('');

  const userselector = useSelector((state) => state.userSlice);
  const teamselector = useSelector((state) => state.teamSlice);
  const statusSelector = useSelector((state) => state.teamStatusSlice);

  const reg_num = userselector.reg_num;
  const team_id = teamselector.length > 0 ? teamselector[0].team_id : null;
  const project_id = statusSelector?.projectId;
  const project_name = statusSelector?.projectName;
  const team_lead = teamselector[0]?.from_reg_num;
  const mentor_reg_num = userselector.mentor_reg_num;

  useEffect(() => {
    const fetchReviewRequests = async () => {
      if (!team_id) return;

      try {
        const res = await instance.get(`/student/schedule_review/${project_id}`);
        const existingRequest = res.data.find((req) => req.team_id === team_id);
        if (existingRequest) {
          setAlreadyRequested(true);
        }
      } catch (err) {
        console.error("Error fetching review requests", err);
      }
    };

    fetchReviewRequests();
  }, [project_id, team_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const payload = {
        project_name,
        team_lead,
        review_date: reviewDate,
        start_time: startTime,
        isOptional: isOptional ? "optional" : "",
        reason: isOptional ? reason : null,
        mentor_reg_num: isOptional ? mentor_reg_num : null
      };

      const res = await instance.post(
        `/student/send_review_request/${team_id}/${project_id}/${reg_num}`,
        payload
      );

      setMessage(res.data);
      setAlreadyRequested(true);
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Request failed');
      } else {
        setError('Network error');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4 text-center mb-4">Schedule Review</h2>
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block font-medium mb-1">Select Review Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              required
              disabled={alreadyRequested}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Select Start Time</label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={alreadyRequested}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="optional"
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
              disabled={alreadyRequested}
              className="mr-2"
            />
            <label htmlFor="optional" className="font-medium">
              Optional Review
            </label>
          </div>

          {isOptional && (
            <div>
              <label className="block font-medium mb-1">Reason for Optional Review</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={alreadyRequested}
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full text-white py-2 rounded transition ${
              alreadyRequested
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={alreadyRequested}
          >
            {alreadyRequested ? 'Review Request Already Sent' : 'Send Review Request'}
          </button>

          {message && <p className="text-green-600 font-medium">{message}</p>}
          {error && <p className="text-red-600 font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Schedule_review;

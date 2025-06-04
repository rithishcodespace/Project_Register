import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

function Schedule_review() {
  const [reviewDate, setReviewDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [getReview, setGetReview] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);

  const userselector = useSelector((state) => state.userSlice);
  const teamselector = useSelector((state) => state.teamSlice);
  const statusSelector = useSelector((state) => state.teamStatusSlice);
  

  const reg_num = userselector.reg_num
  const team_id = teamselector.length > 0 ? teamselector[0].team_id : null;
  const project_id = teamselector.length > 0 ? statusSelector.project_id : null;
  const project_name= teamselector.length > 0 ? statusSelector.project_name : null;
  const team_lead = teamselector[0]?.from_reg_num;
  const expert_reg_num = teamselector.length > 0 ? userselector.sub_expert_reg_num : null;
  const guide_reg_num = teamselector.length > 0 ? userselector.guide_reg_num : null;
  const mentor_reg_num = teamselector.length > 0 ? userselector.mentor_reg_num : null;

 useEffect(() => {
  const print = () => {
    console.log("hai");
  };
  print(); 
}, []); 



  useEffect(() => {
    const fetchReviewRequests = async () => {
      if (!expert_reg_num || !team_id) return;

      try {
        const res = await instance.get(`/sub_expert/fetch_review_requests/${expert_reg_num}`);
        const existingRequest = res.data.find((req) => req.team_id === team_id);

        if (existingRequest) {
          console.log('Review request already sent for this team.');
  
          setAlreadyRequested(true);
        }
      } catch (err) {
        console.error("Error fetching review requests", err);
      }
    };

    fetchReviewRequests();
  }, [expert_reg_num, team_id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await instance.post(
        `/student/send_review_request/${team_id}/${project_id}/${reg_num}`,
        {
          project_name,
          team_lead,
          review_date: reviewDate,
          start_time: startTime,
          isOptional,
          reason,
          mentor_reg_num         }
      );
      console.log(team_id);
      

      setMessage(res.data);
      setAlreadyRequested(true); // prevent resubmission
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Request failed');
      } else {
        setError('Network error');
      }
    }
  };

 useEffect(() => {
  const fetchReviewByProjectId = async () => {
    if (!project_id) return;

    try {
      const res = await instance.get(`/student/schedule_review/${project_id}`);
      setGetReview(res.data);
      console.log(" Fetched Review Details:", res.data);
    } catch (err) {
      console.error(" Error fetching review by project_id:", err);
    }
  };

  fetchReviewByProjectId();
}, [project_id]);





  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4 text-center mb-4">Schedule Review</h2>
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white">

        <div className='bg-white'>
          <label className="block bg-white  font-medium mb-1">Select Review Date</label>
          <input
            type="date"
            className="w-full bg-white border border-gray-300 rounded px-3 py-2"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            required
            disabled={alreadyRequested}
          />
        </div>

        <div className='bg-white'>
          <label className="block bg-white font-medium mb-1">Select Start Time</label>
          <input
            type="time"
            className="w-full border bg-white border-gray-300 rounded px-3 py-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={alreadyRequested}
          />
        </div>

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

        {message && <p className="text-green-600 font-medium bg-white">{message}</p>}
        {error && <p className="text-red-600 font-medium bg-white">{error}</p>}
        {alreadyRequested && !message && (
          <p className="text-yellow-600 bg-white font-medium">
            You've already submitted a review request. Please wait for response.
          </p>
        )}
      </form>
    </div></div>
  );
}

export default Schedule_review;


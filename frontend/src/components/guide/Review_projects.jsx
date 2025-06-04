import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function ReviewProjects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);

  const [guideReviewRequests, setGuideReviewRequests] = useState([]);
  const [expertReviewRequests, setExpertReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guideTeams,setGuideTeams] = useState([])
  const [ExpertTeams,setExpertTeams] = useState([])
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [upcomingReviews, setUpcomingReviews] = useState({});


  const fetchReviewRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const [guideRes, expertRes] = await Promise.all([
        instance.get(`/guide/fetch_review_requests/${guideRegNum}`),
        instance.get(`/sub_expert/fetch_review_requests/${guideRegNum}`)
      ]);

      setGuideReviewRequests(guideRes.data);
      setExpertReviewRequests(expertRes.data);
    } catch (err) {
      setError('Failed to fetch review requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingReviews = async (teams) => {
  const reviewMap = {};
  for (const team of teams) {
    try {
      const teamId = team.from_team_id;
      const res = await instance.get(`/guide/fetch_upcoming_reviews/${teamId}`);
      reviewMap[teamId] = res.data;
    } catch (error) {
      console.log(`No upcoming reviews for team ${team.from_team_id}`);
    }
  }
  setUpcomingReviews(reviewMap);
};


useEffect(() => {
  const fetchGuideRequests = async () => {
    try {
      const res = await instance.get(`/guide/fetch_guiding_teams/${guideRegNum}`);
      setGuideTeams(res.data);
      fetchUpcomingReviews(res.data); // Fetch reviews after teams are loaded
    } catch (error) {
      console.log(error);
    }
  };

  if (guideRegNum) {
    fetchGuideRequests();
  }
}, [guideRegNum]);



useEffect(() => {
  const fetchExpertRequests = async () => {
    try {
      const res = await instance.get(`/sub_expert/fetch_teams/${guideRegNum}`);
      setExpertTeams(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (guideRegNum) {
    fetchExpertRequests();
  }
}, [guideRegNum]);


  useEffect(() => {
    if (guideRegNum) fetchReviewRequests();
  }, [guideRegNum]);

  const handleMarkAttendance = async (reviewId) => {
  try {
    const res = await instance.patch(`/sub_expert/mark_attendance/${reviewId}`);
    alert(res.data); // "attendance marked successfully!"
    await fetchUpcomingReviews([...guideTeams]); // Refresh to re-check button visibility
  } catch (err) {
    console.error(err);
    alert(err.response?.data || 'Failed to mark attendance');
  }
};


  const handleReviewAction = async (request, status, isGuide) => {
    try {
      setLoading(true);
      setError(null);

      const {
        request_id,
        project_id,
        project_name,
        team_lead,
        review_date,
        start_time,
        review_title,
        team_id,
      } = request;

      const url = isGuide
        ? `/guide/add_review_details/${request_id}/${status}/${guideRegNum}/${team_id}`
        : `/sub_expert/add_review_details/${request_id}/${status}/${guideRegNum}/${team_id}`;

      const body = {
        project_id,
        project_name,
        team_lead,
        review_date: new Date(review_date).toISOString().slice(0, 10),
        start_time,
        review_title,
        reason: status === 'reject' ? rejectReason : '',
        ...(status === 'accept' && !isGuide ? { temp_meeting_link: meetingLink } : {}),
      };

      const res = await instance.post(url, body);
      alert(res.data);
      setRejectingRequestId(null);
      setAcceptingRequestId(null);
      setRejectReason('');
      setMeetingLink('');
      await fetchReviewRequests();
    } catch (err) {
      setError(`Failed to ${status} the request`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  

  const renderReviewRequests = (requests, title, isGuide) => (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {requests.length === 0 && <p>No requests found.</p>}

      {requests.map((req) => {
        const isRejecting = rejectingRequestId === req.request_id;
        const isAccepting = acceptingRequestId === req.request_id;

        return (
          <div key={req.request_id} className="border bg-white rounded p-4 mb-4 shadow-sm">
            <p><strong>Project:</strong> {req.project_name}</p>
            <p><strong>Team Lead:</strong> {req.team_lead}</p>
            <p><strong>Review Date:</strong> {req.review_date}</p>
            <p><strong>Start Time:</strong> {req.start_time}</p>
            <p><strong>Review Title:</strong> {req.review_title}</p>

            {/* Reject Flow */}
            {isRejecting && (
              <div className="mt-4">
                <textarea
                  placeholder="Enter rejection reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="border p-2 w-full mb-2"
                  rows={3}
                />
                <button
                  onClick={() => handleReviewAction(req, 'reject', isGuide)}
                  disabled={!rejectReason.trim() || loading}
                  className="bg-red-600 text-white px-4 py-2 rounded mr-2"
                >
                  Submit Reject
                </button>
                <button
                  onClick={() => {
                    setRejectingRequestId(null);
                    setRejectReason('');
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Accept Flow for Expert */}
            {isAccepting && !isGuide && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter meeting link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="border p-2 w-full mb-2"
                />
                <button
                  onClick={() => handleReviewAction(req, 'accept', isGuide)}
                  disabled={!meetingLink.trim() || loading}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                >
                  Submit Accept
                </button>
                <button
                  onClick={() => {
                    setAcceptingRequestId(null);
                    setMeetingLink('');
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!isRejecting && !isAccepting && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (isGuide) {
                      handleReviewAction(req, 'accept', true);
                    } else {
                      setAcceptingRequestId(req.request_id);
                    }
                  }}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setRejectingRequestId(req.request_id);
                    setRejectReason('');
                  }}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Review Projects</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {renderReviewRequests(guideReviewRequests, 'Guide Review Requests', true)}
      {renderReviewRequests(expertReviewRequests, 'Subject Expert Review Requests', false)}
 {Object.entries(upcomingReviews).map(([teamId, reviews]) =>
  reviews.map((rev, index) => {
const reviewDateTime = new Date(`${rev.review_date}T${rev.start_time}`);
const deadline = new Date(reviewDateTime);
deadline.setDate(deadline.getDate() + 1);
deadline.setHours(23, 59, 59, 999);


const now = new Date();
const isWithinAttendancePeriod = now >= reviewDateTime && now <= deadline;
const isAbsent = now > deadline;


    return (
      <div key={`${teamId}-${index}`} className="p-3 border rounded bg-white mb-3">
        <p><strong>Project:</strong> {rev.project_name}</p>
        <p><strong>Review Title:</strong> {rev.review_title}</p>
        <p><strong>Date:</strong> {new Date(rev.review_date).toISOString().slice(0, 10)}</p>
        <p><strong>Time:</strong> {rev.start_time}</p>
        <p><strong>Meeting Link:</strong> <a href={rev.meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 underline">{rev.meeting_link}</a></p>

       <button
  onClick={() => handleMarkAttendance(rev.review_id)}
  className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
>
  Mark Attendance
</button>


{isAbsent && (
  <p className="mt-3 text-red-600 font-semibold">Attendance: Absent</p>
)}

      </div>
    );
  })
)}

    </div>
  );
}

export default ReviewProjects;

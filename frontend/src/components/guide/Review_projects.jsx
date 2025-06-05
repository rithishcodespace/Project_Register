import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function ReviewProjects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);

  const [guideReviewRequests, setGuideReviewRequests] = useState([]);
  const [expertReviewRequests, setExpertReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guideTeams, setGuideTeams] = useState([]);
  const [expertTeams, setExpertTeams] = useState([]);
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [upcomingReviews, setUpcomingReviews] = useState({});
  
  // New states for meeting end time functionality
  const [clickedMeetings, setClickedMeetings] = useState(new Set());
  const [endTimes, setEndTimes] = useState({});
  const [submittingEndTime, setSubmittingEndTime] = useState(null);

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
        fetchUpcomingReviews(res.data);
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

  // Handle meeting link click
  const handleMeetingLinkClick = (reviewKey) => {
    setClickedMeetings(prev => new Set([...prev, reviewKey]));
  };

  // Handle end time submission
  const handleEndTimeSubmit = async (review) => {
    const reviewKey = review.key;
    const endTime = endTimes[reviewKey];
    
    if (!endTime || !endTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
      alert('Please enter a valid end time in HH:MM:SS format');
      return;
    }

    try {
      setSubmittingEndTime(reviewKey);
      
      
      const response = await instance.patch(`/sub_expert/mark_end_time/${review.review_id || review.id}`, {
        project_id: review.project_id,
        "end_time": endTime,
        reviewer_reg_num: guideRegNum
      });

      alert('Mark end time updated!');
      
      // Clear the end time input and remove from clicked meetings
      setEndTimes(prev => {
        const newEndTimes = { ...prev };
        delete newEndTimes[reviewKey];
        return newEndTimes;
      });
      
      setClickedMeetings(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewKey);
        return newSet;
      });

    } catch (error) {
      alert('Failed to mark end time. Please try again.');
      console.error('Error marking end time:', error);
    } finally {
      setSubmittingEndTime(null);
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

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().slice(0, 10);
  };

  // Helper function to check if review time has arrived
  const isReviewTimeReached = (reviewDate, startTime) => {
    const now = new Date();
    
    // Extract date from ISO string
    const reviewDateOnly = reviewDate.split('T')[0];
    
    // Create a Date object for the review date and time
    const reviewDateTime = new Date(`${reviewDateOnly}T${startTime}`);
    
    // Check if current time is >= review time
    return now >= reviewDateTime;
  };

  // Helper function to sort reviews by date and time
  const sortReviewsByDateTime = () => {
    const allReviews = [];

    Object.entries(upcomingReviews).forEach(([teamId, reviews]) => {
      reviews.forEach((rev, index) => {
        const reviewWithKey = { ...rev, key: `${teamId}-${index}` };
        allReviews.push(reviewWithKey);
      });
    });

    // Sort by date and time (ascending - closest first)
    allReviews.sort((a, b) => {
      const dateA = a.review_date.split('T')[0];
      const dateB = b.review_date.split('T')[0];
      
      // First compare dates
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      
      // If dates are same, compare times
      return a.start_time.localeCompare(b.start_time);
    });

    return allReviews;
  };

  const sortedReviews = sortReviewsByDateTime();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Review Projects</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {renderReviewRequests(guideReviewRequests, 'Guide Review Requests', true)}
      {renderReviewRequests(expertReviewRequests, 'Subject Expert Review Requests', false)}

      {/* Upcoming Reviews Section - Sorted by Date & Time */}
      {sortedReviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Upcoming Reviews</h2>
          {sortedReviews.map((rev) => {
            const isClicked = clickedMeetings.has(rev.key);
            const endTime = endTimes[rev.key] || '';
            const isSubmitting = submittingEndTime === rev.key;

            return (
              <div key={rev.key} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 mb-4 shadow-sm">
                <p><strong>Project:</strong> {rev.project_name}</p>
                <p><strong>Review Title:</strong> {rev.review_title || 'N/A'}</p>
                <p><strong>Date:</strong> {rev.review_date.split('T')[0]}</p>
                <p><strong>Time:</strong> {rev.start_time}</p>
                <p><strong>Google Meet Link:</strong> 
                  {rev.meeting_link ? (
                    isReviewTimeReached(rev.review_date, rev.start_time) ? (
                      <a 
                        href={rev.meeting_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 underline ml-2 hover:text-blue-800 font-medium"
                        onClick={() => handleMeetingLinkClick(rev.key)}
                      >
                         Join Meeting
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-500 cursor-not-allowed">
                        📅 Meeting starts at {rev.start_time} on {rev.review_date.split('T')[0]}
                      </span>
                    )
                  ) : (
                    <span className="ml-2 text-gray-500">Google Meet link not available</span>
                  )}
                </p>
                
                {/* Meeting End Time Section */}
                {rev.meeting_link && isReviewTimeReached(rev.review_date, rev.start_time) && (
                  <div className="mt-4 p-3 bg-white-50 border border-white-200 rounded">
                    <p className="text-sm text-yellow-800 mb-2">
                      📝 <strong>Important:</strong> Please mark the meeting end time after completing the review session.
                    </p>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="HH:MM:SS (e.g., 14:30:00)"
                        value={endTime}
                        onChange={(e) => setEndTimes(prev => ({
                          ...prev,
                          [rev.key]: e.target.value
                        }))}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
                        disabled={isSubmitting}
                      />
                      
                      <button
                        onClick={() => handleEndTimeSubmit(rev)}
                        disabled={!isClicked || isSubmitting || !endTime.trim()}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          !isClicked || !endTime.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : isSubmitting
                            ? 'bg-white-400 text-white cursor-wait'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                        title={!isClicked ? 'Please join the meeting first to enable this button' : ''}
                      >
                        {isSubmitting ? 'Submitting...' : 'Mark End Time'}
                      </button>
                    </div>
                    
                    {!isClicked && (
                      <p className="text-xs text-gray-600 mt-1">
                        * Button will be enabled after you join the meeting
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show message if no upcoming reviews */}
      {sortedReviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No upcoming reviews scheduled.</p>
        </div>
      )}
    </div>
  );
}

export default ReviewProjects;
import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function ReviewProjects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);

  const [guideReviewRequests, setGuideReviewRequests] = useState([]);
  const [expertReviewRequests, setExpertReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');

  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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
    </div>
  );
}

export default ReviewProjects;

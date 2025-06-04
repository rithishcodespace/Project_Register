import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function ReviewProjects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);

  const [guideReviewRequests, setGuideReviewRequests] = useState([]);
  const [expertReviewRequests, setExpertReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch review requests from both endpoints and store separately
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

  // Unified accept/reject handler
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
        review_date: new Date(review_date).toISOString().slice(0, 10), // 👈 Fix here
        start_time,
        review_title,
        reason: status === 'reject' ? rejectReason : '',
      };


      const res = await instance.post(url, body);
      alert(res.data);
      setRejectingRequestId(null);
      setRejectReason('');
      await fetchReviewRequests();
    } catch (err) {
      setError(`Failed to ${status} the request`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render UI for either guide or expert requests
  const renderReviewRequests = (requests, title, isGuide) => (
    <div className="mb-10" >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {requests.length === 0 && <p>No requests found.</p>}

      {requests.map((req) => (
        <div key={req.request_id} className="border bg-white rounded p-4 mb-4 shadow-sm ">
          <p className='bg-white'><strong className='bg-white'>Project:</strong> {req.project_name}</p>
          <p className='bg-white'><strong className='bg-white'>Team Lead:</strong> {req.team_lead}</p>
          <p className='bg-white'><strong className='bg-white'>Review Date:</strong> {req.review_date}</p>
          <p className='bg-white'><strong className='bg-white'>Start Time:</strong> {req.start_time}</p>
          <p className='bg-white'><strong className='bg-white'>Review Title:</strong> {req.review_title}</p>

          {rejectingRequestId === req.request_id ? (
            <div className="mt-4 bg-white">
              <textarea
                placeholder="Enter rejection reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border bg-white p-2 w-full mb-2"
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
          ) : (
            <div className="mt-4 bg-white">
              <button
                onClick={() => handleReviewAction(req, 'accept', isGuide)}
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
      ))}
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

import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Review_projects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

  // Helper function to check if review_date is in the future
  const isFutureDate = (dateStr) => {
    const now = new Date();
    const reviewDate = new Date(dateStr);
    return reviewDate > now;
  };

  useEffect(() => {
    const fetchAllReviewRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch guide review requests
        const guideRes = await instance.get(`/guide/fetch_review_requests/${guideRegNum}`);
        // Fetch subject expert review requests
        const subExpertRes = await instance.get(`/sub_expert/fetch_review_requests/${guideRegNum}`);

        // Combine results
        const combined = [...guideRes.data, ...subExpertRes.data];

        // Filter to future review dates only
        const filtered = combined.filter(req => isFutureDate(req.review_date));

        setReviewRequests(filtered);
      } catch (err) {
        console.error('Error fetching review requests:', err);
        setError('Failed to load review requests.');
      }
      setLoading(false);
    };

    if (guideRegNum) {
      fetchAllReviewRequests();
    }
  }, [guideRegNum]);

  // Handler for Accept / Reject button click
  const handleAction = async (request, status) => {
    setError(null);

    // If reject, require reason first
    if (status === 'reject') {
      setRejectingRequestId(request.request_id);
      setRejectReason('');
      return;
    }

    // For accept, directly send the request
    await submitReviewStatus(request, status);
  };

  // Function to submit review status (accept/reject) to backend
  const submitReviewStatus = async (request, status) => {
    setActionLoading(true);
    setError(null);

    // Extract needed params from request
    const {
      request_id,
      project_id,
      project_name,
      team_lead,
      review_date,
      start_time,
      review_no,
      team_id,
      guideRegNum,
      expert_reg_num
    } = request;

    // Prepare payload body
    const body = {
      project_id,
      project_name,
      team_lead,
      review_date,
      start_time,
      review_no,
      ...(status === 'reject' ? { reject_reason: rejectReason } : {})
    };

    try {
      // Determine the API and params based on if guide or expert (based on presence of guideRegNum or expert_reg_num)
      // Here, I assume if guideRegNum === current guideRegNum => it's a guide request; else expert request
      let url = '';
      let paramRegNum = '';

      if (guideRegNum === guideRegNum) {
        url = `/guide/add_review_details/${request_id}/${status}/${guideRegNum}/${team_id}`;
        paramRegNum = guideRegNum;
      } else {
        url = `/sub_expert/add_review_details/${request_id}/${status}/${guideRegNum}/${team_id}`;
        paramRegNum = expert_reg_num;
      }

      // POST request
      const res = await instance.post(url, body);

      alert(res.data || 'Action completed successfully.');

      // After action, remove this request from list or refresh list
      setReviewRequests(prev =>
        prev.filter(r => r.request_id !== request_id)
      );
      setRejectingRequestId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error submitting review status:', err);
      setError('Failed to update review status.');
    }

    setActionLoading(false);
  };

  // Submit reject reason form
  const handleRejectSubmit = (request) => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }
    submitReviewStatus(request, 'reject');
  };

  if (loading) return <div>Loading review requests...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Review Projects</h1>

      {reviewRequests.length === 0 && <p>No review requests available.</p>}

      {reviewRequests.map((req) => (
        <div
          key={req.request_id}
          className="border p-4 mb-4 rounded shadow-md"
        >
          <p><strong>Project Name:</strong> {req.project_name}</p>
          <p><strong>Project ID:</strong> {req.project_id}</p>
          <p><strong>Team ID:</strong> {req.team_id}</p>
          <p><strong>Team Lead:</strong> {req.team_lead}</p>
          <p><strong>Review Date:</strong> {new Date(req.review_date).toLocaleDateString()}</p>
          <p><strong>Start Time:</strong> {req.start_time}</p>
          <p><strong>File:</strong> <a href={req.file} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download/View</a></p>

          {/* Show Accept and Reject buttons or reject reason form */}
          {rejectingRequestId === req.request_id ? (
            <div className="mt-2">
              <textarea
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border p-2 w-full mb-2"
                rows={3}
              />
              <button
                onClick={() => handleRejectSubmit(req)}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded mr-2"
              >
                Submit Reject
              </button>
              <button
                onClick={() => {
                  setRejectingRequestId(null);
                  setRejectReason('');
                }}
                disabled={actionLoading}
                className="bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <button
                onClick={() => handleAction(req, 'accept')}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleAction(req, 'reject')}
                disabled={actionLoading}
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
}

export default Review_projects;

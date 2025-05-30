import React, { useState } from 'react';

const sampleReviews = [
  {
    team_id: 'S5G1',
    project_name: 'AI Chatbot',
    review_date: '2025-05-28',
    meet_link: 'https://meet.google.com/abc-defg-hij',
    attendance: '',
    marks: '',
    feedback: '',
    submitted: false,
  },
  {
    team_id: 'S7G2',
    project_name: 'Blockchain Ledger',
    review_date: '2025-05-28',
    meet_link: 'https://meet.google.com/xyz-pqrw-stu',
    attendance: '',
    marks: '',
    feedback: '',
    submitted: false,
  },
];

function Review_projects() {
  const [reviews, setReviews] = useState(sampleReviews);

  const handleChange = (index, field, value) => {
    const updated = [...reviews];
    updated[index][field] = value;
    setReviews(updated);
  };

  const handleSubmit = (index) => {
    const updated = [...reviews];
    updated[index].submitted = true;
    setReviews(updated);
    alert(`Review submitted for team ${updated[index].team_id}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Conduct Reviews</h2>

      {reviews.map((review, index) => (
        <div
          key={review.team_id}
          className="bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Team ID: {review.team_id}
          </h3>
          <p className="text-sm text-gray-600 mb-1">Project: {review.project_name}</p>
          <p className="text-sm text-gray-600 mb-2">Date: {review.review_date}</p>
          <a
            href={review.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Join Google Meet
          </a>

          {review.submitted ? (
            <div className="mt-4 text-green-600 font-semibold">✔ Review Submitted</div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block font-medium">Attendance:</label>
                <select
                  value={review.attendance}
                  onChange={(e) => handleChange(index, 'attendance', e.target.value)}
                  className="border border-gray-300 p-2 rounded"
                >
                  <option value="">-- Select --</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium">Enter Marks:</label>
                <input
                  type="number"
                  className="border border-gray-300 p-2 rounded w-32"
                  value={review.marks}
                  onChange={(e) => handleChange(index, 'marks', e.target.value)}
                  disabled={review.attendance === 'Absent'}
                />
              </div>

              <div>
                <label className="block font-medium">Feedback / Suggestions:</label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded"
                  rows={3}
                  value={review.feedback}
                  onChange={(e) => handleChange(index, 'feedback', e.target.value)}
                  disabled={review.attendance === 'Absent'}
                />
              </div>

              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleSubmit(index)}
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Review_projects;

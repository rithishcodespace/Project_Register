import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

const initialQueries = [
  {
    id: 1,
    student: 'Arun Kumar',
    question: 'Can we submit our design phase by next Monday?',
    answer: '',
  },
  {
    id: 2,
    student: 'Meena S',
    question: 'Should we use React or plain HTML for frontend?',
    answer: 'Yes, use React as per the project guidelines.',
  },
];

function Guide_queries() {
  const [queries, setQueries] = useState(initialQueries);
  const [replyInputs, setReplyInputs] = useState({});

  const handleReplyChange = (id, value) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendReply = (id) => {
    const updated = queries.map((q) =>
      q.id === id ? { ...q, answer: replyInputs[id] } : q
    );
    setQueries(updated);
    setReplyInputs((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="p-6  min-h-screen">
      <h2 className="text-3xl text-center font-bold mb-6"> Student Queries</h2>

      <div className="grid gap-6">
        {queries.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow-md">
            <div className="mb-2">
              <span className="font-semibold text-blue-600">{q.student}</span> asked:
              <p className="text-lg mt-1">{q.question}</p>
            </div>

            {q.answer ? (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                <strong>Your Answer:</strong> {q.answer}
              </div>
            ) : (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-lg w-full"
                  placeholder="Type your reply here..."
                  value={replyInputs[q.id] || ''}
                  onChange={(e) => handleReplyChange(q.id, e.target.value)}
                />
                <button
                  onClick={() => handleSendReply(q.id)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <SendHorizonal className="bg-purple-500" size={18} />
                  Send
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guide_queries;

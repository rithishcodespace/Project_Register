import React, { useState, useRef, useEffect } from 'react';

const dummyQueries = [
  {
    id: 1,
    question: 'Can we submit the design phase next week?',
    answer: 'Yes, please submit before Friday.',
  },
  {
    id: 2,
    question: 'Should we include flowcharts in the report?',
    answer: '',
  },
];

function Queries() {
  const [queries, setQueries] = useState(dummyQueries);
  const [newQuery, setNewQuery] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();

    const newEntry = {
      id: queries.length + 1,
      question: newQuery,
      answer: '',
    };

    setQueries([...queries, newEntry]);
    setNewQuery('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queries]);

  return (
    <div className="flex flex-col">
      <div className=" text-black text-2xl text-center font-semibold px-4 py-3 ">
        Guide Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-20">
        {queries.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-purple-500 text-white p-3 rounded-lg max-w-xs shadow-md">
                {q.question}
              </div>
            </div>

            {q.answer && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-300 text-gray-800 p-3 rounded-lg max-w-xs shadow-sm">
                  {q.answer}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 w-full flex items-center p-3 border-t border-gray-300 bg-white"
      >
        <input
          type="text"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          placeholder="Type your query..."
          className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <button
          type="submit"
          className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}

<<<<<<< HEAD
export default Queries;
=======
export default Queries;
>>>>>>> 96955cb0a97b878b6433892f0b8bc2a8df9e5c07

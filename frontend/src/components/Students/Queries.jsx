import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function Queries() {
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const chatEndRef = useRef(null);
  const selector = useSelector((store) => store.teamSlice);

  // Fetch queries on mount and every 3 seconds
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:1234/student/get_queries_sent_by_my_team/${selector[0].team_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (Array.isArray(response.data)) {
          setQueries(response.data);
        } else {
          console.error("Response is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };

    fetchQueries(); // Initial fetch
    const interval = setInterval(fetchQueries, 3000); // Poll every 3s
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queries]);

  // Handle sending a new query
  const handleSend = async (e) => {
    e.preventDefault();
    if (newQuery.trim() === '') return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `http://localhost:1234/student/add_query/${selector[0].name}/${selector[0].guide_reg_num}`,
        {
          "query": newQuery,
          "team_id": selector[0].team_id,
          "project_id": selector[0].project_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewQuery('');
    } catch (error) {
      console.error("Error sending query:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-black text-2xl text-center font-semibold px-4 py-3">
        Guide Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-20">
        {queries.map((q) => (
          <div key={q.query_id} className="space-y-2">
            {/* User Query with Sender Name */}
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-600 pr-2">{q.asked_by}</span>
              <div className="bg-purple-500 text-white p-3 rounded-lg max-w-xs shadow-md">
                {q.query}
              </div>
            </div>

            {/* Guide Reply (if exists) */}
            {q.reply && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-300 text-gray-800 p-3 rounded-lg max-w-xs shadow-sm">
                  {q.reply}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field to Send New Query */}
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
          disabled={newQuery.trim() === ''}
          className={`ml-2 px-4 py-2 rounded-full text-white ${
            newQuery.trim() === ''
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Queries;

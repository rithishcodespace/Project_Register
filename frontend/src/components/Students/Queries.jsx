import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function Queries() {
  const [queries, setQueries] = useState([]);  
  const [newQuery, setNewQuery] = useState(''); 
  const chatEndRef = useRef(null);
  const selector = useSelector((Store)=>Store.teamSlice);

  async function submitQuery()
  {
    try{
       if(newQuery.length <= 0)alert("Query field is empty!");
       let token = localStorage.getItem("accessToken");
       let response = await axios.post(`http://localhost:1234/student/add_query/${selector[0].name}`,{
         "team_id":selector.team_id,
         "project_id":selector.project_id,
         "query":newQuery
       })
    }
    catch(error)
    {
      console.log("ERROR:",error);
    }
  }

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

    fetchQueries(); // Fetch once immediately
    const interval = setInterval(fetchQueries, 3000); // Then every 3s
    return () => clearInterval(interval); // Clear on unmount
  }, []);

  // Handle sending a new query
  const handleSend = async (e) => {
    e.preventDefault();
    if (newQuery.trim() === '') return;

    try {
      let token = localStorage.getItem("accessToken");
      await axios.post(
        'http://localhost:1234/student/send_query',
        {
          query: newQuery,
          team_id: selector[0].team_id,
          team_member: selector[0].team_leader, // or whoever is sending
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queries]);

  return (
    <div className="flex flex-col">
      <div className="text-black text-2xl text-center font-semibold px-4 py-3">
        Guide Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-20">
        {queries.map((q) => (
          <div key={q.query_id} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-purple-500 text-white p-3 rounded-lg max-w-xs shadow-md">
                {q.query}
              </div>
            </div>

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
          onClick={submitQuery}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Queries;

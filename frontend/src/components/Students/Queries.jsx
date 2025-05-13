import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Store } from 'lucide-react';

function Queries() {
  const [queries, setQueries] = useState([]);  
  const [newQuery, setNewQuery] = useState(''); 
  const chatEndRef = useRef(null);
  const selector = useSelector((Store)=>Store.userSlice);

  // Fetch queries when the component mounts
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        let token = localStorage.getItem("accessToken")
        const response = await axios.get(`http://localhost:1234/student/get_queries_sent_by_my_team/${selector.project_id}`,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        }); 
        
        // Ensure response.data is an array before setting the state
        if (Array.isArray(response.data)) {
          setQueries(response.data);  // Set the fetched queries to state
        } else {
          console.error('Response is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching queries:', error);
      }
    };

    fetchQueries();
  }, []); // Empty dependency array means it runs once when the component mounts

  // Handle sending a new query
  const handleSend = async (e) => {
    e.preventDefault();

    if (newQuery.trim() === '') return;

    const newEntry = {
      question: newQuery,
      answer: '', // The answer will be empty initially
    };

    try {
      // Send the new query to the backend
      await axios.post('/api/guide/sent_query', newEntry);  // Replace with your actual endpoint
      setQueries([...queries, { ...newEntry, id: queries.length + 1 }]); // Add the new query to the list
      setNewQuery(''); // Clear the input field
    } catch (error) {
      console.error('Error sending query:', error);
    }
  };

  useEffect(() => {
    // Scroll to the latest query whenever the queries state is updated
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queries]);

  return (
    <div className="flex flex-col">
      <div className="text-black text-2xl text-center font-semibold px-4 py-3">
        Guide Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-20">
        {Array.isArray(queries) && queries.map((q) => (
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

export default Queries;

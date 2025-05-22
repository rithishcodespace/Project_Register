import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Progress_Update() {
    const userselector = useSelector((State) => State.userSlice);
    const teamselector = useSelector((State) => State.teamSlice);

    
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await instance.get(`/student/fetchDeadlines/${teamselector[0].team_id}`);
        console.log("Deadlines fetched:", res.data);
        setDeadlines(res.data);
        console.log("res.data");
        
      } catch (error) {
        console.error("Error fetching deadlines:", error);
      }
    };
    fetchDeadlines();

    
  },[]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Progress Update (Console Log Check)</h2>
      <p className="text-sm text-gray-600">Open your browser console to see the fetched data.</p>
    </div>
  );
}

export default Progress_Update;

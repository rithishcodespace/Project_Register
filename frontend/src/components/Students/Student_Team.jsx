import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useSelector} from "react-redux";

function Student_Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const selector = useSelector(Store => Store.userSlice)

  async function fetchTeam() {
    try {
      let token = localStorage.getItem("accessToken");
      let reg_num = selector.reg_num;
      let response;
      if (reg_num) {
         response = await axios.get(`http://localhost:1234/student/getTeamDetails/${reg_num}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.error("No reg_num available!");
      }

      if (response.status === 200) {
        setTeam(response.data || []); // assuming your API returns { teamDetails: [...] }
        console.log("team members array:",response.data);
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br min-h-60">
      <h1 className="text-3xl font-bold text-purple-500 text-center mb-8">
        Team Information
      </h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-5">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : team.length === 0 ? (
          <p className="text-center text-gray-500">Team not created/conformed yet</p>
        ) : (
          team.map((member, index) => (
            <div
              key={index}
              className="flex flex-col bg-white sm:flex-row sm:items-center justify-between border-b py-4"
            >
              <div>
                <p className="text-lg bg-white font-semibold text-gray-800">
                  {member.name}{' '}
                  {member.isLead && (
                    <span className="text-sm bg-white text-yellow-500 font-bold ml-2">
                      👑 Team Lead
                    </span>
                  )}
                </p>
                <p className="text-sm bg-white text-gray-600">{member.email}</p>
              </div>
              <div className="text-sm text-gray-700 mt-2 sm:mt-0">
                <p className="bg-white">
                  Reg No: <span className="bg-white font-medium">{member.reg_num}</span>
                </p>
                <p className="bg-white">
                  Cluster: <span className="bg-white font-medium">{member.dept}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Student_Team;

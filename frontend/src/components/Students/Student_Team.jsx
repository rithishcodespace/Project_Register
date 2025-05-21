import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
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
         response = await instance.get(`/student/getTeamDetails/${reg_num}`);
      } else {
        console.error("No reg_num available!");
      }

      if (response.status === 200) {
        setTeam(response.data || []); 
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
      <h1 className="text-3xl font-bold text-black-500 text-center mb-8">
        Team Information
      </h1><div className="flex justify-center">
      <div className="flex justify-center "></div>
        {loading ? (
          <p className="text-center flex text-gray-500">Loading...</p>
        ) : team.length === 0 ? (
          <p className="text-center bg-white p-2 rounded-md text-gray-500">Team not created/conformed yet</p>
        ) : (
            <div className="overflow-x-auto">
  <div className="overflow-x-auto w-full rounded-lg shadow-md border border-gray-200">
  <table className="w-full  divide-y divide-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-6 py-3 text-left text-lg font-bold text-black-700 bg-white tracking-wide">Name</th>
        <th className="px-6 py-3 text-left text-lg font-bold text-black-700 bg-white tracking-wide">Register Number</th>
        <th className="px-6 py-3 text-left text-lg font-bold text-black-700 bg-white tracking-wide">Department</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
  {team
    .filter((member) => !member.status) // first, only team lead
    .map((member, index) => (
      <tr key={`lead-${index}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
        <td className="px-6 py-4 bg-white text-sm text-gray-900 font-medium">
          {member.name}
          <span className="ml-2 inline-block bg-white text-yellow-700 font-semibold text-xs px-2 py-0.5 rounded-full">
            👑 Team Lead
          </span>
          <div className="text-xs bg-white text-gray-500">{member.email}</div>
        </td>
        <td className="px-6 py-4 bg-white text-sm text-gray-700">{member.reg_num}</td>
        <td className="px-6 py-4 bg-white text-sm text-gray-700">{member.dept}</td>
      </tr>
    ))}

  {team
    .filter((member) => member.status) // then, rest of the members
    .map((member, index) => (
      <tr key={`member-${index}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
        <td className="px-6 py-4 bg-white text-sm text-gray-900 font-medium">
          {member.name}
          <div className="text-xs bg-white text-gray-500">{member.email}</div>
        </td>
        <td className="px-6 py-4 bg-white text-sm text-gray-700">{member.reg_num}</td>
        <td className="px-6 py-4 bg-white text-sm text-gray-700">{member.dept}</td>
      </tr>
    ))}
</tbody>

  </table>
</div>

</div>

        )}
      </div>
    </div>
  );
}

export default Student_Team;
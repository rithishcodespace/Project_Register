import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';
import { Bell } from 'lucide-react';

function Staff_dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [guideRequests, setGuideRequests] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [reasonMap, setReasonMap] = useState({});
  const reg_num = useSelector((state) => state.userSlice.reg_num);

  const [GuideTeams, setGuideTeams] = useState([]);
  const [SubTeams, setSubTeams] = useState([]);

  // semesters you want to show at once
  const semestersToShow = [5, 7];

  const fetchRequests = async () => {
    try {
      const results = await Promise.allSettled([
        instance.get(`/guide/getrequests/${reg_num}`),
        instance.get(`/expert/getrequests/${reg_num}`),
        instance.get(`/guide/fetch_guiding_teams/${reg_num}`),
        instance.get(`/sub_expert/fetch_teams/${reg_num}`),
      ]);

      const [guideRes, expertRes, guideTeamsRes, subTeamsRes] = results;

      if (guideRes.status === "fulfilled") {
        setGuideRequests(typeof guideRes.value.data === 'string' ? [] : guideRes.value.data);
      }
      if (expertRes.status === "fulfilled") {
        setExpertRequests(typeof expertRes.value.data === 'string' ? [] : expertRes.value.data);
      }
      if (guideTeamsRes.status === "fulfilled") {
        setGuideTeams(guideTeamsRes.value.data);
      }
      if (subTeamsRes.status === "fulfilled") {
        setSubTeams(subTeamsRes.value.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (type, status, team_id, semester) => {
    const reason = reasonMap[`${type}_${team_id}`];
    if (status === "reject" && !reason) {
      alert("Please provide a reason for rejection.");
      return;
    }

    const endpoint =
      type === "guide"
        ? `/guide/accept_reject/${status}/${team_id}/${semester}/${reg_num}`
        : `/sub_expert/accept_reject/${status}/${team_id}/${semester}/${reg_num}`;

    try {
      const res = await instance.patch(endpoint, { reason: reason || "Accepted" });
      alert(res.data);
      fetchRequests();
      setReasonMap((prev) => {
        const newMap = { ...prev };
        delete newMap[`${type}_${team_id}`];
        return newMap;
      });
    } catch (error) {
      alert(error.response?.data || `Error handling ${type} request`);
    }
  };

  const renderRequestCard = (req, type) => (
    <div key={`${type}_${req.from_team_id}`} className="bg-white rounded p-3 mb-2">
      <p className="font-semibold bg-white text-gray-900">
        {type.charAt(0).toUpperCase() + type.slice(1)} request from team{" "}
        <span className="text-blue-600 bg-white">{req.from_team_id}</span> for project:{" "}
        <strong className='bg-white'>{req.project_name || req.project_id}</strong>
      </p>
      <div className="mt-3  bg-white flex items-center gap-3">
        <button
          onClick={() => handleAction(type, "accept", req.from_team_id, req.team_semester)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition"
        >
          Accept
        </button>
        <button
          onClick={() => handleAction(type, "reject", req.from_team_id, req.team_semester)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition"
        >
          Reject
        </button>
      </div>
      <input
        type="text"
        placeholder="Reason (required if rejecting)"
        value={reasonMap[`${type}_${req.from_team_id}`] || ""}
        onChange={(e) =>
          setReasonMap({
            ...reasonMap,
            [`${type}_${req.from_team_id}`]: e.target.value,
          })
        }
        className="mt-2 bg-white w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  // Filter teams by semester
  const filterTeamsBySemester = (teams, sem) =>
    Array.isArray(teams) ? teams.filter((team) => team.team_semester === sem) : [];

  return (
    <div className="p-6  min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
  {/* Centered Welcome Message */}
  <div className="flex-1 flex flex-col items-center">
    <h1 className="text-3xl font-bold text-gray-900">
      Welcome back, {useSelector((state) => state.userSlice.name)}!
    </h1>
  </div>

  {/* Notification Bell on the Right */}
  <div className="relative">
    <button
      className="p-2 hover:text-blue-600"
      onClick={() => setShowNotifications(!showNotifications)}
      aria-label="Toggle notifications"
    >
      <Bell className="w-7 h-7" />
      {(guideRequests.length + expertRequests.length) > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
          {guideRequests.length + expertRequests.length}
        </span>
      )}
    </button>
  </div>
</header>


      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-6 top-20 w-96 bg-white shadow-lg border rounded-md z-20 max-h-96 overflow-y-auto p-5">
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-red-600 font-bold text-xl"
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          >
            ×
          </button>

          {(guideRequests.length === 0 && expertRequests.length === 0) ? (
            <p className="text-center text-gray-500">No pending requests</p>
          ) : (
            <>
              {guideRequests.map((req) => renderRequestCard(req, "guide"))}
              {expertRequests.map((req) => renderRequestCard(req, "expert"))}
            </>
          )}
        </div>
      )}

      {/* Teams Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Guide - Semester 5 */}
  <section className="bg-white rounded shadow p-6">
    <h2 className="text-xl font-bold mb-4 bg-white text-gray-800">Guide - Semester 5</h2>
    {filterTeamsBySemester(GuideTeams, 5).length > 0 ? (
      <ul className="list-none list-inside space-y-1 text-gray-700">
        {filterTeamsBySemester(GuideTeams, 5).map((team) => (
          <li key={team.from_team_id} className='bg-white cursor-pointer'>
            <span className="font-semibold  bg-white">{team.from_team_id}</span> - {team.project_name}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 bg-white ">No Guide students found for Semester 5.</p>
    )}
  </section>

  {/* Guide - Semester 7 */}
  <section className="bg-white rounded shadow p-6">
    <h2 className="text-xl font-bold mb-4 pointer bg-white  text-gray-800">Guide - Semester 7</h2>
    {filterTeamsBySemester(GuideTeams, 7).length > 0 ? (
      <ul className="list-none list-inside space-y-1 text-gray-700">
        {filterTeamsBySemester(GuideTeams, 7).map((team) => (
          <li key={team.from_team_id} className=' bg-white cursor-pointer'>
            <span className="font-semibold">{team.from_team_id}</span> - {team.project_name}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 bg-white ">No Guide students found for Semester 7.</p>
    )}
  </section>

  {/* Subexpert - Semester 5 */}
  <section className="bg-white rounded shadow p-6">
    <h2 className="text-xl font-bold mb-4 bg-white text-gray-800">Subexpert - Semester 5</h2>
    {filterTeamsBySemester(SubTeams, 5).length > 0 ? (
      <ul className="list-none list-inside space-y-1 text-gray-700">
        {filterTeamsBySemester(SubTeams, 5).map((team) => (
          <li key={team.from_team_id} className='bg-white cursor-pointer'>
            <span className="font-semibold  bg-white">{team.from_team_id}</span> - {team.project_name}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 bg-white">No Subexpert students found for Semester 5.</p>
    )}
  </section>

  {/* Subexpert - Semester 7 */}
  <section className="bg-white rounded shadow p-6">
    <h2 className="text-xl font-bold mb-4 bg-white text-gray-800">Subexpert - Semester 7</h2>
    {filterTeamsBySemester(SubTeams, 7).length > 0 ? (
      <ul className="list-none list-inside space-y-1 bg0white text-gray-700">
        {filterTeamsBySemester(SubTeams, 7).map((team) => (
          <li key={team.from_team_id} className='bg-white cursor-pointer'>
            <span className="font-semibold bg-white">{team.from_team_id}</span> - {team.project_name}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 bg-white">No Subexpert students found for Semester 7.</p>
    )}
  </section>
</div>
    </div>
  );
}

export default Staff_dashboard;

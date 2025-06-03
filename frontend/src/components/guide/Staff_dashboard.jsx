import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Staff_dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [guideRequests, setGuideRequests] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [reasonMap, setReasonMap] = useState({});
  const [GuideTeams, setGuideTeams] = useState([]);
  const [SubTeams, setSubTeams] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // For guide team progress
  const navigate = useNavigate();

  const reg_num = useSelector((state) => state.userSlice.reg_num);
  const name = useSelector((state) => state.userSlice.name);

  // Fetch verified weeks for teams
  const fetchVerifiedWeeks = async (teams) => {
    const updated = await Promise.all(
      teams.map(async (team) => {
        try {
          const res = await instance.get(`/guide/no_of_weeks_verified/${team.from_team_id}`);
          return { ...team, verifiedWeeks: res.data || 0 };
        } catch {
          return { ...team, verifiedWeeks: 0 };
        }
      })
    );
    return updated;
  };

  // Fetch progress data ONLY for guide teams, store results in progressMap
  const fetchProgressForTeams = async (teams) => {
    const map = {};
    for (const team of teams) {
      try {
        const res = await instance.get(`/guide/gets_the_progress_updated_team_members/${team.from_team_id}`);
        map[team.from_team_id] = res.data || null;
        console.log(` Progress for team ${team.from_team_id}:`, res.data);
      } catch (err) {
        console.error(` Failed to fetch progress for team ${team.from_team_id}:`, err.response?.data || err.message);
        map[team.from_team_id] = null;
      }
    }
    setProgressMap(map);
  };

  // Fetch all required data: requests, guide teams, subexpert teams
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
        const updatedGuideTeams = await fetchVerifiedWeeks(guideTeamsRes.value.data);
        setGuideTeams(updatedGuideTeams);

        // Fetch progress ONLY for guide teams
        fetchProgressForTeams(updatedGuideTeams);
      }
      if (subTeamsRes.status === "fulfilled") {
        setSubTeams(subTeamsRes.value.data);

        // No progress fetch for subTeams (per your requirement)
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle accept/reject actions
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

  // Render notification request cards
  const renderRequestCard = (req, type) => (
    <div key={`${type}_${req.from_team_id}`} className="bg-white rounded p-3 mb-2">
      <p className="font-semibold bg-white text-gray-900">
        {type.charAt(0).toUpperCase() + type.slice(1)} request from team{" "}
        <span className="text-blue-600 bg-white">{req.from_team_id}</span> for project:{" "}
        <strong className='bg-white'>{req.project_name || req.project_id}</strong>
      </p>
      <div className="mt-3 bg-white flex items-center gap-3">
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
        className="mt-2 bg-white w-full border border-gray-300 rounded px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {name}!
          </h1>
        </div>
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
        <div className="absolute right-14 top-28 w-96 bg-white shadow-lg border rounded-md z-20 max-h-96 overflow-y-auto p-5">
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-red-600 font-bold text-xl"
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          >
            ×
          </button>

          {(guideRequests.length === 0 && expertRequests.length === 0) ? (
            <p className="text-center bg-white text-gray-500">No pending requests</p>
          ) : (
            <>
              {guideRequests.map((req) => renderRequestCard(req, "guide"))}
              {expertRequests.map((req) => renderRequestCard(req, "expert"))}
            </>
          )}
        </div>
      )}

      {/* Teams Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Guide Teams */}
        <section className="bg-white rounded shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800 bg-white">Guide Teams</h2>
          {GuideTeams.length > 0 ? (
            <table className="min-w-full border-t text-left p-2 text-md text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b bg-white">Team ID</th>
                  <th className="px-4 py-2 border-b bg-white">Project Name</th>
                  <th className="px-4 py-2 border-b bg-white">Semester</th>
                  <th className="px-4 py-2 border-b bg-white">Verified Weeks</th>
                </tr>
              </thead>
              <tbody>
                {GuideTeams.map((team) => (
                  <tr
                    key={team.from_team_id}
                    className="bg-white hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`team-details/${team.from_team_id}`)}
                  >

                    <td className="px-4 py-2 border-b bg-white">{team.from_team_id}</td>
                    <td className="px-4 py-2 border-b bg-white">{team.project_name}</td>
                    <td className="px-4 py-2 border-b bg-white">{team.team_semester}</td>
                    <td className="px-4 py-2 gap-10 flex  border-b bg-white">
                      <p className='flex bg-white'>{team.verifiedWeeks}/12</p>
                      {(team.verifiedWeeks) && progressMap[team.from_team_id] ? (
                        <p className="flex  bg-white  text-green-600 text-sm mt-1">Weekly log Updated</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 bg-white">No Guide teams found.</p>
          )}
        </section>

        {/* Subexpert Teams */}
        <section className="bg-white rounded shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800 bg-white">Subexpert Teams</h2>
          {SubTeams.length > 0 ? (
            <table className="min-w-full border-t text-left text-md text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b bg-white">Team ID</th>
                  <th className="px-4 py-2 border-b bg-white">Project Name</th>
                  <th className="px-4 py-2 border-b bg-white">Semester</th>
                </tr>
              </thead>
              <tbody>
                {SubTeams.map((team) => (
                  <tr key={team.from_team_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b bg-white">{team.from_team_id}</td>
                    <td className="px-4 py-2 border-b bg-white">{team.project_name}</td>
                    <td className="px-4 py-2 border-b bg-white">{team.team_semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 bg-white">No Subexpert teams found.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Staff_dashboard;

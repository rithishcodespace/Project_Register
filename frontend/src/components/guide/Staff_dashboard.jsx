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
  const semester = 5; // You may dynamically get this from user or team info

  const fetchRequests = async () => {
    try {
      const [guideRes, expertRes] = await Promise.all([
        instance.get(`/guide/getrequests/${reg_num}`),
        instance.get(`/expert/getrequests/${reg_num}`),
      ]);

      setGuideRequests(typeof guideRes.data === 'string' ? [] : guideRes.data);
      setExpertRequests(typeof expertRes.data === 'string' ? [] : expertRes.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };



  useEffect(() => {
    if (showNotifications||!showNotifications) {
      fetchRequests();
    }
  }, [showNotifications]);

  const handleAction = async (type, status, team_id) => {
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
    } catch (error) {
      alert(error.response?.data || `Error handling ${type} request`);
    }
  };

  const renderRequest = (req, type) => (
    <div
      key={`${type}_${req.from_team_id}`}
      className="border-b pb-4 mb-4 last:border-none last:pb-0 last:mb-0"
    >
      <p className="text-gray-800 font-semibold">
        <span className="capitalize">{type}</span> request from team{" "}
        <span className="text-blue-600">{req.from_team_id}</span> for project:{" "}
        <strong>{req.project_name || req.project_id}</strong>
      </p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleAction(type, "accept", req.from_team_id)}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Accept
        </button>

        <button
          onClick={() => handleAction(type, "reject", req.from_team_id)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Reject
        </button>
      </div>

      <input
        type="text"
        placeholder="Reason (for rejection)"
        value={reasonMap[`${type}_${req.from_team_id}`] || ""}
        onChange={(e) =>
          setReasonMap({
            ...reasonMap,
            [`${type}_${req.from_team_id}`]: e.target.value,
          })
        }
        className="mt-2 w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <button
          className="relative p-2 hover:text-blue-500"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="w-6 h-6" />

          {(guideRequests.length + expertRequests.length) > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {guideRequests.length + expertRequests.length}
            </span>
          )}
        </button>

      </div>

      {showNotifications && (
        <div className="absolute right-6 top-16 w-[26rem] bg-white shadow-lg border rounded-md z-10">
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {guideRequests.length === 0 && expertRequests.length === 0 ? (
              <p className="text-gray-500 text-center">No requests found</p>
            ) : (
              <>
                {guideRequests.map((req) => renderRequest(req, "guide"))}
                {expertRequests.map((req) => renderRequest(req, "expert"))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff_dashboard;

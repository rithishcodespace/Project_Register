import React, { useEffect, useState } from "react";
import axios from "axios";

const TimeLine = () => {
  const [timelines, setTimelines] = useState([]);
  const [newTimeline, setNewTimeline] = useState({ name: "", startTime: "", endTime: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editTimeline, setEditTimeline] = useState({ id: "", name: "", startTime: "", endTime: "" });

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      const res = await axios.get("/admin/get_timelines");
      setTimelines(res.data.map(t => ({
        
        name: t.name,
        startTime: t.start_date,
        endTime: t.end_date
      })));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { name, startTime, endTime } = newTimeline;
    if (!name || !startTime || !endTime) return;

    try {
      await axios.post("/admin/addTimeLine", {
        name,
        start_date: startTime,
        end_date: endTime,
      });
      setNewTimeline({ name: "", startTime: "", endTime: "" });
      fetchTimelines();
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/remove_timeline/${id}`);
      fetchTimelines();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEditClick = (index) => {
    const item = timelines[index];
    setEditIndex(index);
    setEditTimeline({
      id: item.id,
      name: item.name,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  };

  const handleEditSave = async () => {
    const { id, name, startTime, endTime } = editTimeline;
    try {
      await axios.patch(`/admin/update_timeline_id/${id}`, {
        name,
        start_date: startTime,
        end_date: endTime,
      });
      setEditIndex(null);
      fetchTimelines();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-center mt-6 mb-6">Timeline Management</h2>
      <div className="max-w-5xl mx-auto mt-2 p-6 bg-white rounded-2xl shadow">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              value={newTimeline.name}
              onChange={(e) => setNewTimeline({ ...newTimeline, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={newTimeline.startTime}
              onChange={(e) => setNewTimeline({ ...newTimeline, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End Date</label>
            <input
              type="date"
              value={newTimeline.endTime}
              onChange={(e) => setNewTimeline({ ...newTimeline, endTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 font-semibold"
          >
            Add
          </button>
        </form>

        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">#</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Start Date</th>
              <th className="p-3 border">End Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timelines.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No timeline added yet.
                </td>
              </tr>
            ) : (
              timelines.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editTimeline.name}
                        onChange={(e) => setEditTimeline({ ...editTimeline, name: e.target.value })}
                        className="px-2 py-1 border rounded-md w-full"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="p-3 border bg-white">
                    {editIndex === index ? (
                      <input
                        type="date"
                        value={editTimeline.startTime}
                        onChange={(e) => setEditTimeline({ ...editTimeline, startTime: e.target.value })}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      new Date(item.startTime).toLocaleDateString()
                    )}
                  </td>
                  <td className="p-3 border">
                    {editIndex === index ? (
                      <input
                        type="date"
                        value={editTimeline.endTime}
                        onChange={(e) => setEditTimeline({ ...editTimeline, endTime: e.target.value })}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      new Date(item.endTime).toLocaleDateString()
                    )}
                  </td>
                  <td className="p-3 border space-x-2">
                    {editIndex === index ? (
                      <button
                        onClick={handleEditSave}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(index)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TimeLine;

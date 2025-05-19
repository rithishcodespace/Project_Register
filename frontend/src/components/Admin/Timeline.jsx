import React, { useState } from "react";

const TimeLine = () => {
  const [timelines, setTimelines] = useState([]);
  const [newTimeline, setNewTimeline] = useState({ name: "", startTime: "", endTime: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editTimeline, setEditTimeline] = useState({ name: "", startTime: "", endTime: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTimeline.name || !newTimeline.startTime || !newTimeline.endTime) return;

    setTimelines([...timelines, newTimeline]);
    setNewTimeline({ name: "", startTime: "", endTime: "" });
  };

  const handleDelete = (index) => {
    const updated = timelines.filter((_, i) => i !== index);
    setTimelines(updated);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditTimeline({ ...timelines[index] });
  };

  const handleEditSave = (index) => {
    const updated = [...timelines];
    updated[index] = editTimeline;
    setTimelines(updated);
    setEditIndex(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Timeline Manager</h2>

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6"
      >
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            value={newTimeline.name}
            onChange={(e) =>
              setNewTimeline({ ...newTimeline, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={newTimeline.startTime}
            onChange={(e) =>
              setNewTimeline({ ...newTimeline, startTime: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            value={newTimeline.endTime}
            onChange={(e) =>
              setNewTimeline({ ...newTimeline, endTime: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 font-semibold"
        >
          Add
        </button>
      </form>

      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">#</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Start Time</th>
            <th className="p-3 border">End Time</th>
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
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editTimeline.name}
                      onChange={(e) =>
                        setEditTimeline({
                          ...editTimeline,
                          name: e.target.value,
                        })
                      }
                      className="px-2 py-1 border rounded-md w-full"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="p-3 border">
                  {editIndex === index ? (
                    <input
                      type="datetime-local"
                      value={editTimeline.startTime}
                      onChange={(e) =>
                        setEditTimeline({
                          ...editTimeline,
                          startTime: e.target.value,
                        })
                      }
                      className="px-2 py-1 border rounded-md"
                    />
                  ) : (
                    new Date(item.startTime).toLocaleString()
                  )}
                </td>
                <td className="p-3 border">
                  {editIndex === index ? (
                    <input
                      type="datetime-local"
                      value={editTimeline.endTime}
                      onChange={(e) =>
                        setEditTimeline({
                          ...editTimeline,
                          endTime: e.target.value,
                        })
                      }
                      className="px-2 py-1 border rounded-md"
                    />
                  ) : (
                    new Date(item.endTime).toLocaleString()
                  )}
                </td>
                <td className="p-3 border space-x-2">
                  {editIndex === index ? (
                    <button
                      onClick={() => handleEditSave(index)}
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
                    onClick={() => handleDelete(index)}
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
  );
};

export default TimeLine;

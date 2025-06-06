import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import instance from "../../utils/axiosInstance";

const ScheduleReview = () => {
  const userSelector = useSelector((state) => state.userSlice);
  const reg_num = userSelector.reg_num;

  const teamSelector = useSelector((state) => state.teamSlice);
  const statusSelector = useSelector((state) => state.teamStatusSlice);

  const [form, setForm] = useState({
    project_id: "",
    project_name: "",
    team_lead: "",
    review_date: "",
    start_time: "",
    isOptional: "",
    reason: "",
    mentor_reg_num: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Populate the form fields from selectors
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      project_id: statusSelector.projectId || "",
      project_name: statusSelector.projectName || "",
      team_lead: teamSelector[0]?.from_reg_num || "",
      mentor_reg_num: userSelector.mentor_reg_num || ""
    }));
  }, [statusSelector.projectId, statusSelector.projectName, teamSelector, userSelector.mentor_reg_num]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const team_id = teamSelector[0]?.team_id;
    const project_id = form.project_id;

    if (!team_id || !project_id || !reg_num) {
      alert("Missing required fields.");
      return;
    }

    const formData = new FormData();

    // Required fields
    formData.append("team_id", team_id);  // REQUIRED FOR BACKEND MULTER
    formData.append("project_id", project_id);
    formData.append("project_name", form.project_name);
    formData.append("team_lead", form.team_lead);
    formData.append("mentor_reg_num", form.mentor_reg_num);
    formData.append("review_date", form.review_date);
    formData.append("start_time", form.start_time);
    formData.append("isOptional", form.isOptional);
    formData.append("reason", form.reason);

    // Attach file with the correct key
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop().toLowerCase();
      if (["pdf", "doc", "docx"].includes(fileExt)) {
        formData.append("report", selectedFile);
      } else if (["ppt", "pptx"].includes(fileExt)) {
        formData.append("ppt", selectedFile);
      } else if (["zip", "rar"].includes(fileExt)) {
        formData.append("outcome", selectedFile);
      } else {
        alert("Unsupported file format.");
        return;
      }
    }

    try {
      const res = await instance.post(
        `/student/send_review_request/${team_id}/${project_id}/${reg_num}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(res.data);

      // Reset form
      setForm({
        project_id: statusSelector.projectId || "",
        project_name: statusSelector.projectName || "",
        team_lead: teamSelector[0]?.from_reg_num || "",
        review_date: "",
        start_time: "",
        isOptional: "",
        reason: "",
        mentor_reg_num: userSelector.mentor_reg_num || ""
      });
      setSelectedFile(null);
    } catch (error) {
      alert(error.response?.data || "Error submitting request");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">Schedule Review</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden inputs */}
        <input type="hidden" name="project_id" value={form.project_id} />
        <input type="hidden" name="project_name" value={form.project_name} />
        <input type="hidden" name="team_lead" value={form.team_lead} />
        <input type="hidden" name="mentor_reg_num" value={form.mentor_reg_num} />
        <input type="hidden" name="team_id" value={teamSelector[0]?.team_id} />

        <input
          type="date"
          name="review_date"
          onChange={handleInput}
          value={form.review_date}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="time"
          name="start_time"
          onChange={handleInput}
          value={form.start_time}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="isOptional"
          onChange={handleInput}
          value={form.isOptional}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Review Type</option>
          <option value="regular">Monthly Review</option>
          <option value="optional">Optional Review</option>
        </select>

        {form.isOptional === "optional" && (
          <input
            name="reason"
            onChange={handleInput}
            value={form.reason}
            placeholder="Reason for Optional Review"
            className="w-full p-2 border rounded"
            required
          />
        )}

        <div className="flex flex-col gap-2">
          <label>Upload a File (Report, PPT, or Outcome):</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Review Request
        </button>
      </form>
    </div>
  );
};

export default ScheduleReview;

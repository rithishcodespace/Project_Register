import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProjectProgress = () => {
  const student = JSON.parse(localStorage.getItem('studentData'));
  const reg_num = student?.reg_num;
  const team_id = student?.team_id; // make sure team_id is stored in localStorage
  const selector = useSelector((state) => state.userSlice);

  const [contribution, setContribution] = useState('');
  const [progress, setProgress] = useState('');
  const [phase, setPhase] = useState('');
  const [week, setWeek] = useState(0);
  const [canUpdate, setCanUpdate] = useState(false);
  const [message, setMessage] = useState('');

  const phaseLabels = [
    'phase1_progress',
    'phase2_progress',
    'phase3_progress',
    'phase4_progress',
    'phase5_progress',
    'phase6_progress',
  ];

  const getNextPhase = (currentPhase) => {
    const index = phaseLabels.indexOf(currentPhase);
    return index !== -1 && index + 1 < phaseLabels.length ? phaseLabels[index + 1] : null;
  };

  const fetchEligibility = async () => {
    try {
      // 1. Get current phase and status
      const res = await axios.get(`http://localhost:1234/student/check_phase_eligibility/${selector.reg_num}`,{withCredentials:true});
      let currentPhase = res.data.allowedPhase;
      const weekNumber = res.data.weekNumber;
      const isMonday = res.data.isMonday;

      // 2. Check all team member progress
      const teamRes = await axios.get(`http://localhost:1234/student/team_progress/${team_id}/${currentPhase.replace('_progress', '')}`,{withCredentials:true});
      const allMembers = teamRes.data;

      const allCompleted = allMembers.every(member => parseInt(member.progress) === 100);

      // 3. Advance phase if all done
      const finalPhase = allCompleted ? getNextPhase(currentPhase) || currentPhase : currentPhase;

      setPhase(finalPhase);
      setWeek(weekNumber);
      setCanUpdate(isMonday && !res.data.alreadyUpdated);

      if (!isMonday) {
        setMessage("Updates allowed only on Mondays");
      } else if (res.data.alreadyUpdated) {
        setMessage("You already submitted this phase this week");
      } else {
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching eligibility data");
    }
  };

  const handleUpdate = async () => {
    if (!canUpdate) return;

    try {
      const res = await axios.post(
        `http://localhost:1234/student/update_progress/${phase}/${selector.reg_num}`,
        { contribution, progress },
        { withCredentials: true }
      );
      setMessage(res.data);
      fetchEligibility(); // Refresh the page state after update
    } catch (err) {
      setMessage(err.response?.data || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold text-center mb-4">Weekly Progress Update</h2>

      <p className="text-center text-blue-600 font-medium mb-4">
        Week {week} | Updating: {phase.replace('_progress', '').toUpperCase()}
      </p>

      <div className="mb-4">
        <label className="block font-semibold">Current Phase</label>
        <input
          type="text"
          value={phase.replace('_progress', '').toUpperCase()}
          disabled
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Description</label>
        <input
          type="text"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Example: Circuit built, report submitted..."
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Your Phase Progress (%)</label>
        <input
          type="number"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Ex: 50 or 100"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={!canUpdate}
        className={`w-full py-2 mt-2 text-white rounded ${canUpdate ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
      >
        {canUpdate ? "Submit Update" : "Not Allowed"}
      </button>

      {message && (
        <p className="text-center mt-4 text-red-600 font-medium">{message}</p>
      )}
    </div>
  );
};

export default ProjectProgress;

// [
//   {
//     "id": 1,
//     "title": "Problem Statement Definition",
//     "description": "Clearly define the problem your project aims to solve, including the background, objectives, and scope."
//   },
//   {
//     "id": 2,
//     "title": "Feasibility Analysis",
//     "description": "Conduct a feasibility study to assess the technical, financial, and operational viability of the project."
//   },
//   {
//     "id": 3,
//     "title": "System Design & Architecture",
//     "description": "Create a high-level design diagram (flowchart, UML, ERD) that outlines the project architecture."
//   },
//   {
//     "id": 4,
//     "title": "Technical Specifications",
//     "description": "List the technologies, tools, frameworks, and hardware/software requirements."
//   },
//   {
//     "id": 5,
//     "title": "Project Timeline & Milestones",
//     "description": "Set up a timeline with key milestones (e.g., Phase 1 completion, Mid-Evaluation, Final Submission)."
//   },
//   {
//     "id": 6,
//     "title": "Resource Allocation",
//     "description": "Identify the team members, their roles, and the resources required for the project."
//   },
//   {
//     "id": 7,
//     "title": "Database Design",
//     "description": "Design the database schema, including tables, fields, relationships, and data types."
//   },
//   {
//     "id": 8,
//     "title": "Frontend Development",
//     "description": "Develop the user interface (UI/UX) and ensure cross-platform compatibility."
//   },
//   {
//     "id": 9,
//     "title": "Backend Development",
//     "description": "Implement the core logic, server-side APIs, and integrate with the database."
//   },
//   {
//     "id": 10,
//     "title": "Testing & Quality Assurance",
//     "description": "Perform unit testing, integration testing, and user acceptance testing (UAT)."
//   },
//   {
//     "id": 11,
//     "title": "Documentation",
//     "description": "Maintain comprehensive documentation for system design, user guide, and technical references."
//   },
//   {
//     "id": 12,
//     "title": "Final Presentation & Report Submission",
//     "description": "Prepare a final project report (outcome, report, PPT) and present the project to the evaluation panel."
//   }
// ]

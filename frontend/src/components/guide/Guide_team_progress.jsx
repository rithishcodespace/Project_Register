import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useSelector } from 'react-redux';

const COLORS = ['#10b981', '#e5e7eb']; // green, gray

function Guide_team_progress() {
  const selector = useSelector((state) => state.userSlice);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`http://localhost:1234/guide/fetch_mentoring_teams/${selector.reg_num}`, {
        withCredentials: true,
      });
      const mentoringTeams = res.data;

      const allTeamData = await Promise.all(
        mentoringTeams.map(async (team) => {
          const progressRes = await axios.get(
            `http://localhost:1234/guide/fetch_progress_by_project_id/${team.project_id}`,
            { withCredentials: true }
          );
          const members = progressRes.data;

          const guideVerified = members[0]?.guide_verified || 0;

          let currentWeek = 0;
          for (let i = 1; i <= 12; i++) {
            const field = `week${i}_progress`;
            if (members.every((m) => m[field] && m[field].trim() !== '')) {
              currentWeek = i;
            } else {
              break;
            }
          }

          const showButtons = currentWeek > guideVerified;

          const verifiedPercent = parseFloat((guideVerified * (100 / 12)).toFixed(2));
          const remainingPercent = 100 - verifiedPercent;

          const progress = [
            { name: 'Verified', value: verifiedPercent },
            { name: 'Remaining', value: remainingPercent },
          ];

          return {
            id: team.from_team_id,
            project_id: team.project_id,
            projectTitle: team.project_name,
            members,
            guide_verified: guideVerified,
            currentWeek,
            showButtons,
            progress,
          };
        })
      );

      setTeams(allTeamData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (teamId) => {
    try {
      await axios.patch(
        `http://localhost:1234/guide/verify_weekly_logs/${selector.reg_num}/${teamId}`,
        {},
        { withCredentials: true }
      );
      alert('Verified Successfully!');
      fetchTeams();
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="p-6 min-h-screen ">
      <h1 className="text-4xl font-bold text-center text-black mb-10">Student irogress</h1>

      {teams.length === 0 ? (
        <p className="text-center text-gray-500  text-lg">No teams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-3 gap-8">
          {teams.map((team, idx) => (
            <div key={idx} className="bg-white rounded-2xl  shadow-md border border-purple-200 overflow-hidden hover:shadow-xl transition">
              <div className="bg-white px-4 py-3">
                <h2 className="text-xl bg-white font-bold text-black-800">{team.projectTitle}</h2>
                <p className="text-sm bg-white mt-2 text-purple-600">Team ID: {team.id}</p>
              </div>

              <div className="p-2 bg-white">
            
                <p className="text-gray-700 bg-white text-center ">Verified Weeks: {team.guide_verified} / 12</p>

                {team.showButtons ? (
                  <div className="mt-4 bg-white">
                    <p className="text-gray-800 bg-white font-semibold text-center mb-2">
                      Week {team.currentWeek} Progress by Team Members
                    </p>
                    <ul className="space-y-2 bg-white p-3 rounded-lg">
                      {team.members.map((member, i) => {
                        const field = `week${team.currentWeek}_progress`;
                        return (
                          <li key={i} className="text-sm bg-white text-gray-600">
                            <span className="font-semibold bg-white text-gray-800">{member.name}:</span>{' '}
                            {member[field] ? (
                              member[field]
                            ) : (
                              <em className="text-gray-400 bg-white">No update</em>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="text-center mt-1 bg-white">
                      <button
                        onClick={() => handleVerify(team.id)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium px-5 py-2 rounded-lg shadow hover:scale-105 transition"
                      >
                         Accept Progress
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm bg-white text-gray-500 mt-3 italic">
                    {team.currentWeek === team.guide_verified
                      ? `Week ${team.currentWeek} already verified`
                      : `Waiting for all members to update Week ${team.guide_verified + 1}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Guide_team_progress;

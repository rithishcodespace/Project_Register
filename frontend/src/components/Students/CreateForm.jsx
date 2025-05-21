// import React from 'react';
// import {useDispatch} from "react-redux";
// import { addUser } from '../../utils/userSlice';

// function CreateForm({ createForm, handleCreateChange, handleCreateSubmit, departments, setIsCreateOpen }) {

//   return (
//     <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 px-4">
//       <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
//         <h2 className="text-xl font-semibold mb-4 bg-white">New Project Invitation</h2>
//         <form onSubmit={handleCreateSubmit} className="space-y-4 bg-white">
//           <div className="bg-white">
//             <label className="block text-sm font-medium text-gray-700 bg-white">Your Name</label>
//             <input
//               name="name"
//               value={createForm.name}
//               onChange={handleCreateChange}
//               type="text"
//               required
//               className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
//             />
//           </div>
//           <div className="bg-white">
//             <label className="block text-sm font-medium text-gray-700 bg-white">Your Email</label>
//             <input
//               name="email"
//               value={createForm.email}
//               onChange={handleCreateChange}
//               type="email"
//               required
//               className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
//             />
//           </div>
//           <div className="bg-white">
//             <label className="block text-sm font-medium text-gray-700 bg-white">Register Number</label>
//             <input
//               name="registerNumber"
//               value={createForm.registerNumber}
//               onChange={handleCreateChange}
//               type="text"
//               required
//               className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
//             />
//           </div>
//           <div className="bg-white">
//             <label className="block text-sm font-medium text-gray-700 bg-white">Department</label>
//             <select
//               name="department"
//               value={createForm.department}
//               required
//               className="mt-1 bg-white block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
//               onChange={handleCreateChange}
//             >
//               <option value="">Select Department</option>
//               {departments.map((dept) => (
//                 <option key={dept} value={dept}>{dept}</option>
//               ))}
//             </select>
//           </div>
//           <div className="mt-6 flex justify-between bg-white space-x-2">
//             <button
//               type="button"
//               onClick={() => setIsCreateOpen(false)}
//               className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
//             >
//               Create
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreateForm;
//  const [expertsList] = useState([
//     'Expert Alpha', 'Expert Beta', 'Expert Gamma', 'Expert Delta', 'Expert Epsilon'
//   ]);
//   const [guidesList] = useState([
//     'Guide One', 'Guide Two', 'Guide Three', 'Guide Four', 'Guide Five'
//   ]);
{/* <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Select at least 3 Experts:</h3>
              <div className="flex flex-wrap gap-3">
                {expertsList.map((expert) => (
                  <button
                    key={expert}
                    onClick={() => toggleExpertSelection(expert)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedExperts.includes(expert)
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                    }`}
                  >
                    {expert}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Select at least 3 Guides:</h3>
              <div className="flex flex-wrap gap-3">
                {guidesList.map((guide) => (
                  <button
                    key={guide}
                    onClick={() => toggleGuideSelection(guide)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedGuides.includes(guide)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
                    }`}
                  >
                    {guide}
                  </button>
                ))}
              </div>
            </div> */}
//  const toggleExpertSelection = (expertName) => {
//     setSelectedExperts((prev) =>
//       prev.includes(expertName) ? prev.filter((e) => e !== expertName) : [...prev, expertName]
//     );
//   };

//   const toggleGuideSelection = (guideName) => {
//     setSelectedGuides((prev) =>
//       prev.includes(guideName) ? prev.filter((g) => g !== guideName) : [...prev, guideName]
//     );
// //   };
//   const [selectedExperts, setSelectedExperts] = useState([]);
//   const [selectedGuides, setSelectedGuides] = useState([]);


  //  const [userStatus, setUserStatus] = useState('loading');

  // function checkUserStatus() {
  //   try {
  //     if (!teamStatus.teamConformationStatus) {
  //       setUserStatus('no_team');
  //     } else {
  //       const member = teamStatus?.teamMembers?.[0];
  //       if (member?.project_id) {
  //         setUserStatus('has_project');
  //       } else {
  //         setUserStatus('no_project');
  //       }
  //     }
  //   } catch (e) {
  //     console.error('Invalid teamStatus in store', e);
  //     setUserStatus('no_team');
  //   }
  // }

  //  if (userStatus === 'no_team') {
  //   return (
  //     <div className="flex justify-center items-center mt-20">
  //       <h1 className="text-2xl font-bold text-red-500">First Form a Team!!</h1>
  //     </div>
  //   );
  // }

 

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Eye } from 'lucide-react'; // Make sure to install lucide-react or replace with your own icon

// // // const Project_Details = () => {
// // //   const [projectData, setProjectData] = useState([]);
// // //   const [selectedProject, setSelectedProject] = useState(null);
// // //   const [viewModalOpen, setViewModalOpen] = useState(false);

// // //   async function getProjects() {
// // //     try {
// // //       const accessToken = localStorage.getItem("accessToken");
// // //       const response = await axios.get("http://localhost:1234/teacher/getprojects", {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${accessToken?.trim()}`
// // //         }
// // //       });

// // //       if (response.status === 200) {
// // //         console.log("Received projects:", response.data);
// // //         setProjectData(response.data);
// // //       } else {
// // //         alert("Sorry, no data");
// // //       }
// // //     } catch (error) {
// // //       console.log("Error fetching projects:", error.message);
// // //     }
// // //   }

// // //   useEffect(() => {
// // //     getProjects();
// // //   }, []);

// //   const handleView = (projectId) => {
// //     const selected = projectData.find(proj => proj.id === projectId);
// //     setSelectedProject(selected);
// //     setViewModalOpen(true);
// //   };

//   return (
//     <div className="p-6 w-full max-w-7xl mx-auto">
//       <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Posted Projects</h2>

//       <div className="overflow-x-auto">
//         <table className="min-w-full rounded-2xl shadow-md border-separate border-spacing-y-2">
//           <thead>
//             <tr className="bg-purple-100 text-purple-800 text-left text-sm">
//               <th className="py-2 px-4 w-64 text-xl">Project Name</th>
//               <th className="py-2 px-4 w-64 text-xl">Cluster</th>
//               <th className="py-2 px-4 w-80 text-xl">Description</th>
//               <th className="py-2 px-4 text-xl">Action</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white">
//             {projectData.map((proj, i) => (
//               <tr key={i} className="bg-white transition">
//                 <td className="py-2 px-4">{proj.project_name || proj.project_id}</td>
//                 <td className="py-2 px-4">{proj.cluster}</td>
//                 <td className="py-2 px-4">{proj.description}</td>
//                 <td className="py-2 px-4">
//                   <div className="flex gap-4 items-center">
//                     <button onClick={() => handleView(proj.id)} title="View">
//                       <Eye className="text-blue-500 hover:scale-110 transition-transform" size={20} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {viewModalOpen && selectedProject && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
//             <h3 className="text-xl font-semibold text-purple-700 mb-4">Project Details</h3>
//             <p><strong>Name:</strong> {selectedProject.project_name}</p>
//             <p><strong>Cluster:</strong> {selectedProject.cluster}</p>
//             <p><strong>Description:</strong> {selectedProject.description}</p>

//             <div className="mt-4 text-right">
//               <button
//                 className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
//                 onClick={() => setViewModalOpen(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Project_Details;

import React, { useEffect, useState } from 'react';

const Project_Details = () => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const dummyData = [
    {
      id: 1,
      project_name: "AI-Based Student Evaluator",
      cluster: "Artificial Intelligence",
      description: "A machine learning model to evaluate student performance based on assignment submissions.",
      project_phase: "Planning",
      deadline: "2025-05-30"
    },
    {
      id: 2,
      project_name: "Smart Attendance System",
      cluster: "Internet of Things",
      description: "An RFID and camera-based attendance system that logs student entry and exit.",
      project_phase: "Development",
      deadline: "2025-06-15"
    },
    {
      id: 3,
      project_name: "Online Exam Portal",
      cluster: "Web Development",
      description: "A secure online platform for conducting MCQ and written exams with timer and auto-submission.",
      project_phase: "Testing",
      deadline: "2025-05-20"
    },
    {
      id: 4,
      project_name: "Green Energy Monitor",
      cluster: "Sustainable Technology",
      description: "A dashboard to track and analyze solar panel energy production using Node-RED and MQTT.",
      project_phase: "Completed",
      deadline: "2025-04-10"
    },
    {
      id: 5,
      project_name: "E-Learning App",
      cluster: "Mobile Development",
      description: "A Flutter-based mobile app for course content delivery with quizzes and live sessions.",
      project_phase: "Design",
      deadline: "2025-07-01"
    }
  ];

  useEffect(() => {
    setProjectData(dummyData);
  }, []);

  const handleRowClick = (projectId) => {
    const selected = projectData.find(proj => proj.id === projectId);
    setSelectedProject(selected);
    setViewModalOpen(true);
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Posted Projects</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-2xl shadow-md border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-purple-100 text-purple-800 text-left text-sm">
              <th className="py-2 px-4 w-64 text-xl">Project Name</th>
              <th className="py-2 px-4 w-64 text-xl">Cluster</th>
              <th className="py-2 px-4 w-80 text-xl">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projectData.map((proj, i) => (
              <tr
                key={i}
                onClick={() => handleRowClick(proj.id)}
                className="bg-white transition hover:scale-[1.01] cursor-pointer"
              >
                <td className="py-2 px-4">{proj.project_name || proj.project_id}</td>
                <td className="py-2 px-4">{proj.cluster}</td>
                <td className="py-2 px-4">{proj.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Project Details</h3>
            <p><strong>Name:</strong> {selectedProject.project_name}</p>
            <p><strong>Cluster:</strong> {selectedProject.cluster}</p>
            <p><strong>Description:</strong> {selectedProject.description}</p>
            <p><strong>Project Phase:</strong> {selectedProject.project_phase}</p>
            <p><strong>Deadline:</strong> {selectedProject.deadline}</p>

            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project_Details;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import CSE from '../../assets/CSE.jpeg';
import AIDS from '../../assets/AIDS.jpeg';
import IT from '../../assets/IT.jpeg';
import AIML from '../../assets/AIML.jpeg';
import CT from '../../assets/CT.jpeg';
import AGRI from '../../assets/AGRI.jpeg';
import ECE from '../../assets/ECE.jpeg';
import EIE from '../../assets/EIE.jpeg';
import EEE from '../../assets/EEE.jpeg';
import MECH from '../../assets/MECH.jpeg';
import FT from '../../assets/FT.jpeg';
import FD from '../../assets/FD.jpeg';

export default function Student_Progress() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  // Static image mapping
  const departmentImages = {
    CSE, AIDS, IT, AIML, CT, AGRI,
    ECE, EIE, EEE, MECH, FT, FD,
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:1234/api/departments");
      const departmentsData = res.data.map((dept) => ({
        name: dept,
        image: departmentImages[dept] || CSE, // fallback image
      }));
      setDepartments(departmentsData);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleNavigate = (cluster) => {
    navigate(`/teacher/student_progress/${cluster}`);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Choose Department</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {departments.map((dept, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => handleNavigate(dept.name)}
          >
            <div className="bg-blue-100 rounded-full mb-4">
              <img src={dept.image} alt={dept.name} className="rounded-full w-24 h-24 object-cover" />
            </div>
            <h2 className="text-lg font-semibold">{dept.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

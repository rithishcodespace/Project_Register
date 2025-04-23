import React from 'react';
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

export default function StudentProgress() {
  const departments = [
    { name: "CSE", image: CSE },
    { name: "AIDS", image: AIDS },
    { name: "IT", image: IT },
    { name: "AIML", image: AIML },
    { name: "CT", image: CT },
    { name: "AGRI", image: AGRI },
    { name: "ECE", image: ECE },
    { name: "EIE", image: EIE },
    { name: "EEE", image: EEE },
    { name: "MECH", image: MECH },
    { name: "FT", image: FT },
    { name: "FD", image: FD },
  ];

  return (
    <div className="p-6 bg- rounded-md min-h-screen">
      <h1 className="text-2xl bg- font-bold mb-6 text-center">Choose Department</h1>
      <div className="grid grid-cols-1 bg- sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-blue-100  rounded-full mb-4">
              <img src={dept.image} alt={dept.name} className="rounded-full w-24 h-24 object-cover" />
            </div>
            <h2 className="text-lg bg-white font-semibold">{dept.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

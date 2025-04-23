import React from 'react';

export default function StudentProgress() {
  const departments = ["CSE", "AIDS", "IT", "AIML", "CT", "AGRI", "ECE", "EIE", "EEE", "MECH", "FT", "FD"];
  const image = ["","https://tse4.mm.bing.net/th?id=OIP.rZP_bamLv95p1-rtT6Pu_gHaEK&pid=Api&P=0&h=180","https://tse3.mm.bing.net/th?id=OIP.Xa4ucCkGGrZ_63seCKYNSAHaE8&pid=Api&P=0&h=180",""]

  return (
    <div className="p-6 bg- rounded-md min-h-screen">
      <h1 className="text-2xl bg- font-bold mb-6 text-center">Choose Department</h1>
      <div className="grid grid-cols-1 bg-  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <img src={image.index} className='rounded-full'></img>
            </div>
            <h2 className="text-lg bg-white font-semibold">{dept}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

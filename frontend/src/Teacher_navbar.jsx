import React from 'react';
import college_img from "./assets/college_img.png";
import { Home, UploadCloud, FileText, BarChart2, LogOut } from "lucide-react";

function Teacher_navbar() {
  return (
    <div className="w-1/5 h-screen bg-white rounded-lg flex flex-col   py-6">
      <img 
        src={college_img} 
        className="w-1/2 bg-white ml-16 mb-6" 
        alt="College Logo" 
      />

      <div className="flex bg-white ml-16 mb-10">
        <Home size={30} className="mr-3  bg-white text-gray-500" />
        <p className="text-xl bg-white  text-gray-500">Dashboard</p>
      </div>

      <div className="flex ml-16 bg-white mb-10">
        <UploadCloud size={30} className="mr-3  bg-white text-gray-500" />
        <p className="text-xl bg-white  text-gray-500">Upload Task</p>
      </div>

      <div className="flex  bg-white ml-16 mb-10">
        <FileText size={30} className="mr-3 bg-white  text-gray-500" />
        <p className="text-xl bg-white  text-gray-500">Posted Tasks</p>
      </div>

      <div className="flex ml-16 bg-white mb-10">
        <BarChart2 size={30} className="mr-3 bg-white text-gray-500" />
        <p className="text-xl text-gray-500 bg-white">Student Progress</p>
      </div>

      <div className="flex ml-16  mt-auto bg-white">
        <LogOut size={30} className="mr-3 bg-white text-gray-500" />
        <p className="text-xl text-gray-500 bg-white">Logout</p>
      </div>
    </div>
  );
}

export default Teacher_navbar;

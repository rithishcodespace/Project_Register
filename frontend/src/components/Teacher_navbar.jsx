import React from 'react';
import college_img from "./assets/college_img.png";
import { Home, UploadCloud, FileText, BarChart2, LogOut } from "lucide-react";
import { Navigate, useNavigate } from 'react-router-dom';

function Teacher_navbar() {

  const navigate = useNavigate()

  return (
    <div className="w-1/5 h-screen bg-white flex flex-col py-6 overflow-y-auto min-w-[200px] sm:w-1/4 md:w-1/5">


      <img 
        src={college_img} 
        className="w-1/2 bg-white ml-16 mb-12" 
        alt="College Logo" 
      />

      <div className="flex bg-white ml-10 mb-12">
        <Home size={30} className="mr-3  bg-white text-gray-500 " />
        <p className="text-xl bg-white  text-gray-500">Dashboard</p>
      </div>

      <div className="flex ml-10 bg-white mb-12">
        <UploadCloud size={30} className="mr-3  bg-white text-gray-500" />
        <p className="text-xl bg-white  text-gray-500">Add Projects</p>
      </div>

      <div className="flex  bg-white ml-10 mb-12">
        <FileText size={30} className="mr-3 bg-white  text-gray-500" />
        <p className="text-xl bg-white  text-gray-500">Posted Projects</p>
      </div>

      <div className="flex ml-10 bg-white mb-12">
        <BarChart2 size={30} className="mr-3 bg-white text-gray-500" />
        <p className="text-xl text-gray-500 bg-white">Student Progress</p>
      </div>

      <div onClick={()=>{}} className="flex ml-20 mb-4 mt-auto bg-white">
        <LogOut size={30} className="mr-3 bg-white rotate-180 text-gray-500" />
        <p className="text-xl text-gray-500 bg-white">Logout</p>
      </div>
    </div>
  );
}

export default Teacher_navbar;

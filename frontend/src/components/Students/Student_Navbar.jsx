import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText,Users, BarChart2, LogOut } from 'lucide-react';
import college_img from "../../assets/college_img.png";

function Student_navbar() {
  const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
      navigate("/"); // Redirect to login
    };

    const isActive = (path) => {
      const currentPath = location.pathname;
      if (path === "") return currentPath === "/student"; // Match only the dashboard route exactly
      return currentPath.endsWith(path) || currentPath === `/student/${path}`;
    };

    const navDiv = (path) =>
      `ml-10 mb-6 flex items-center rounded-lg px-3 w-60 py-2 ${
        isActive(path) ? "bg-purple-400 text-white" : "bg-white text-gray-700"
      }`;
    

      const navImg = (path) =>
        `w-11 rounded-md ${
          isActive(path)
            ? "bg-purple-400 text-white"
            : "bg-transparent text-gray-600 group-hover:text-purple-400 "
        }`;
      
      const navText = (path) =>
        `text-lg px-2 py-1 rounded-md ${
          isActive(path)
            ? "bg-purple-400 text-white"
            : "bg-white text-gray-600 group-hover:text-purple-600"
        }`;
      

    return (
      <div className="w-1/5 h-screen bg-white flex flex-col py-6 overflow-y-auto min-w-[200px] sm:w-1/4 md:w-1/5 shadow-md">
        <img 
          src={college_img} 
          className="w-1/2 mx-auto bg-white mb-12" 
          alt="College Logo" 
        />

        <Link to="." className={`${navDiv("")} group`}>
          <Home size={24} className={`mr-3 ${navImg("")}`} />
          <p className={`${navText("")}`}>Dashboard</p>
        </Link>

        <Link to="Project_Details" className={`${navDiv("Project_Details")} group`}>
          <FileText size={24} className={`mr-3 ${navImg("Project_Details")}`} />
          <p className={`${navText("Project_Details")}`}>Project Details</p>
        </Link>

        <Link to="Students_team" className={`${navDiv("Students_team")} group`}>
          <Users size={24} className={`mr-3 ${navImg("Students_team")}`} />
          <p className={`${navText("Students_team")}`}>Student_team</p>
        </Link>

        <Link to="Progress_update" className={`${navDiv("Progress_update")} group`}>
          <BarChart2 size={24} className={`mr-3 ${navImg("Progress_update")}`} />
          <p className={`${navText("Progress_update")}`}>Progress update</p>
        </Link>

        <button 
          onClick={handleLogout} 
          className="ml-24 mt-auto mb-5 flex bg-white items-center text-gray-600 hover:text-red-500"
        >
          <LogOut size={24} className="mr-5 bg-white rotate-180" />
          <p className="text-lg bg-white">Logout</p>
        </button>
      </div>
    );
}

export default Student_navbar
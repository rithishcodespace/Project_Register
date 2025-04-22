import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, UserPlus,FilePlus, BarChart2,CheckCircle, LogOut } from 'lucide-react';
import college_img from "../../assets/college_img.png";


function Admin_Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
      navigate("/"); // Redirect to login
    };

    const isActive = (path) => {
      const currentPath = location.pathname;
      if (path === "") return currentPath === "/admin"; // Match only the dashboard route exactly
      return currentPath.endsWith(path) || currentPath === `/admin/${path}`;
    };

    const navDiv = (path) =>
      `ml-10 mb-6 flex items-center rounded-lg px-3 w-60 py-2 bg-white  ${
        isActive(path) ? "bg-[rgb(158,67,255)]" : "hover:"
      }`;

    const navImg = (path) =>
      `w-11 color-[rgb(158,67,255)] bg-white ${
        isActive(path) ? "bg-[rgb(158,67,255)] text-white" : "bg-transparent text-gray-600 colour-white group-hover:text-blue-600"
      }`;

    const navText = (path) =>
      `text-lg px-2 py-1 rounded-md bg-white  ${
        isActive(path) ? "bg-[rgb(158,67,255)] text-white" : "text-gray-600 group-hover:text-blue-600"
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

        <Link to="Add_users" className={`${navDiv("Add_users")} group`}>
          <UserPlus size={24} className={`mr-3 ${navImg("Add_users")}`} />
          <p className={`${navText("Add_users")}`}>Add users</p>
        </Link>


        <Link to="Add_project" className={`${navDiv("Add_project")} group`}>
          <FilePlus size={24} className={`mr-3 ${navImg("Add_project")}`} />
          <p className={`${navText("Add_project")}`}>Add Project</p>
        </Link>

        <Link to="Posted_projects" className={`${navDiv("Posted_projects")} group`}>
          <CheckCircle size={24} className={`mr-3 ${navImg("Posted_projects")}`} />
          <p className={`${navText("Posted_projects")}`}>Posted Projects</p>
        </Link>

        <Link to="students_progress" className={`${navDiv("students_progress")} group`}>
          <BarChart2 size={24} className={`mr-3 ${navImg("students_progress")}`} />
          <p className={`${navText("students_progress")}`}>Students progress</p>
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

export default Admin_Navbar
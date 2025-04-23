import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, UploadCloud, FileText, BarChart2, LogOut } from 'lucide-react';
import college_img from "../../assets/college_img.png";
import menu from "../../assets/menu.png"
import wrong from "../../assets/wrong.png"

function Teacher_navbar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (path) => {
    const currentPath = location.pathname;
    if (path === "") return currentPath === "/teacher";
    return currentPath.endsWith(path) || currentPath === `/teacher/${path}`;
  };

  const navDiv = (path) =>
    `ml-3 mb-10 flex items-center rounded-lg  px-3 py-2  ${
      isActive(path) ? "bg-purple-400 text-white" : "bg-white"
    } ${isOpen ? "w-52" : "w-12 "}`;


  const navIcon = (path) =>
    ` ${
      isActive(path) ? "bg-purple-400 text-white" : "bg-transparent bg-white text-gray-600 colour-white group-hover:text-purple-600"
    }`;

  const navText = (path) =>
    `ml-3 text-lg font-medium   ${
      isOpen ? "opacity-100" : "opacity-0 hidden"
    } ${isActive(path) ?  "bg-purple-400 text-white" : "text-gray-600 bg-white group-hover:text-purple-600"}`;

  return (
    <div
      className= {`fixed top-0 pb-5 left-0 h-screen bg-white flex flex-col py-6 overflow-y-auto shadow-2xl z-50 transition-all duration-500 ease-in-out
         ${isOpen ? "w-64" : "w-24"}`}
    >
      {/* Toggle Button */}
      <button
      onClick={toggleSidebar}
      className={`relative top-3 left-5 w-12 h-10 p-2 bg-white text-black rounded-md transition-all ${isOpen ? "left-48" : "left-5"} `}
>     
     <img
      src={isOpen ? wrong : menu}
      alt="Toggle Sidebar"
      className="w-full h-full object-contain bg-white border-none text-red-500"
     />
     </button>

      {/* Logo */}
      <div className="h-32 bg-white mt-6">
        <img
          src={college_img}
          className={`w-1/2 mx-auto bg-white mb-12 transition-all duration-300 ${isOpen ? "w-1/2" : "w-2/3 mt-7"}`}
          alt="College Logo"
        />
      </div>

      <div className="bg-white px-2">
        <Link to="." className={` ${navDiv("")} group`}>
          <Home size={24} className={navIcon("")} />
          <p className={navText("")}>Dashboard</p>
        </Link>

        <Link to="add" className={`${navDiv("add")} group`}>
          <UploadCloud size={24} className={navIcon("add")} />
          <p className={navText("add")}>Add Projects</p>
        </Link>

        <Link to="posted_projects" className={`${navDiv("posted_projects")} group`}>
          <FileText size={24} className={navIcon("posted_projects")} />
          <p className={navText("posted_projects")}>Posted Projects</p>
        </Link>

        <Link to="student_progress" className={`${navDiv("student_progress")} group`}>
          <BarChart2 size={24} className={navIcon("student_progress")} />
          <p className={navText("student_progress")}>Student Progress</p>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className=" ml-3 flex items-center mt-auto mb-5 px-3 py-2 text-gray-600 hover:text-red-500"
        >
          <LogOut size={24} className="mr-5 bg-white rotate-180"/>
          <p className={`ml-3 bg-white text-lg transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            Logout
          </p>
        </button>
      </div>
    </div>
  );
}

export default Teacher_navbar;

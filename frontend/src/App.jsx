import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import TeacherDashBoard from "./components/Teacher/TeacherDashBoard";
import TeacherAdd from "./components/Teacher/TeacherAdd";
import StudentProgress from "./components/Teacher/StudentProgress";
import PostedProjects from "./components/Teacher/PostedProjects";
import Student from "./components/Students/Student";
import Teacher from "./components/Teacher/Teacher";
import './index.css';
import Student_Dashboard from "./components/Students/Student_Dashboard";
import Progress_Update from "./components/Students/Progress_Update";
import Project_Details from "./components/Students/Project_Details";
import Student_Team from "./components/Students/Student_Team";
import Admin from "./components/Admin/Admin";
import Add_Users from "./components/Admin/Add_Users";
import Students_Progress from "./components/Admin/Students_Progress";
import Add_Project from "./components/Admin/Add_Project";
import Posted_project from "./components/Admin/Posted_project";
import Admin_Dashboard from "./components/Admin/Admin_Dashboard";
import Create_team from "./components/Teacher/Create_team";
import Cluster from "./components/Teacher/Cluster";
import { Provider } from "react-redux";
import ProjDetails from "./components/Teacher/ProjDetails";
import Store from "./utils/Store";
import InvitationPage from "./components/Students/InvitationPage";
import ProtectedRoute from "./utils/ProtectedRoute"; 

function App() {
  return (
    <Provider store={Store}>
      <BrowserRouter>
        <Routes>

          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* 🔐 Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <Student />
              </ProtectedRoute>
            }
          >
            <Route index element={<Student_Dashboard />} />
            <Route path="Progress_update" element={<Progress_Update />} />
            <Route path="Project_Details" element={<Project_Details />} />
            <Route path="Students_team" element={<Student_Team />} />
            <Route path="invitations" element={<InvitationPage />} />
          </Route>

          {/* 🔐 Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Teacher />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashBoard />} />
            <Route path="add" element={<TeacherAdd />} />
            <Route path="posted_projects" element={<PostedProjects />} />
            <Route path="student_progress" element={<StudentProgress />} />
            <Route path="student_progress/:cluster" element={<Cluster />} />
            <Route path="student_progress/project_details/:id" element={<Cluster />} />
            <Route path="student_progress/project_details/:cluster/:id" element={<ProjDetails />} />

          </Route>

          {/* 🔐 Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Admin_Dashboard />} />
            <Route path="Add_users" element={<Add_Users />} />
            <Route path="Add_Project" element={<Add_Project />} />
            <Route path="posted_projects" element={<Posted_project />} />
            <Route path="students_progress" element={<Students_Progress />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

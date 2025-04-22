import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom"
import Login from "./components/Login/Login";
import TeacherDashBoard from "./components/Teacher/TeacherDashBoard";
import TeacherAdd from "./components/Teacher/TeacherAdd";
import Teacher_navbar from "./components/Teacher/Teacher_navbar";
import StudentProgress from "./components/Teacher/StudentProgress";
import PostedProjects from "./components/Teacher/PostedProjects";
import Student from "./components/Students/Student";
import Teacher from "./components/Teacher/Teacher";
import './index.css';
import Student_Dashboard from "./components/Students/Student_Dashboard";
import Progress_Update from "./components/Students/Progress_Update";
import Project_Details from "./components/Students/Project_Details";
import Student_Team from "./components/Students/Student_Team";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>

        <Route path="/student" element={<Student />}>
        b <Route index element={<Student_Dashboard />} />
          <Route path="Progress_update" element={<Progress_Update/>} />
          <Route path="Project_Details" element={<Project_Details/>} />
          <Route path="Students_team" element={<Student_Team/>} />
        </Route>

        <Route path="/teacher" element={<Teacher />}>
          <Route index element={<TeacherDashBoard />} />
          <Route path="add" element={<TeacherAdd />} />
          <Route path="posted_projects" element={<PostedProjects />} />
          <Route path="student_progress" element={<StudentProgress />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App

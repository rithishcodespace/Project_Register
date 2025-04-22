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

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}>

        </Route>
           <Route path="/student" element={<Student />}>
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

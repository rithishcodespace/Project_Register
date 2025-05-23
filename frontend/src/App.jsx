import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login/Login";
import TeacherDashBoard from "./components/Teacher/TeacherDashBoard";
import TeacherAdd from "./components/Teacher/TeacherAdd";
import PostedProjects from "./components/Teacher/PostedProjects";
import Student from "./components/Students/Student";
import Teacher from "./components/Teacher/Teacher";
import './index.css';
import Student_Dashboard from "./components/Students/Student_Dashboard";
import Progress_Update from "./components/Students/Progress_Update";
import Project_Details from "./components/Students/Project_Details";
import Student_Team from "./components/Students/Schedule_review";
import Admin from "./components/Admin/Admin";
import Add_Users from "./components/Admin/Add_Users";
import Students_Progress from "./components/Admin/Students_Progress";
import Posted_project from "./components/Admin/Posted_project";
import Admin_Dashboard from "./components/Admin/Admin_Dashboard";
import Create_team from "./components/Teacher/Create_team";
import { Provider } from "react-redux";
import ProjDetails from "./components/Teacher/ProjDetails";
import { Store } from "./utils/Store";
import InvitationPage from "./components/Students/InvitationPage";
import ProtectedRoute from "./utils/ProtectedRoute"; 
import SubjectExpertDashboard from "./components/Subject_expert/Student_export_dashboard";
import Subject_expert_remarks from "./components/Subject_expert/Subject_expert_remarks";
import Subject_expert from "./components/Subject_expert/Subject_expert";
import Guide from "./components/guide/guide";
import Guide_dashboard from "./components/guide/Guide_dashboard";
import Guide_queries from "./components/guide/Guide_queries";
import Guide_team_progress from "./components/guide/Guide_team_progress";
import Queries from "./components/Students/Queries";
import {getProfile} from "./services/authService";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import Proj_Details from "./components/Students/Proj_Details";
import ProjectFileUpload from "./components/Students/ProjectFileUpload";
import Admin_project_details from "./components/Admin/Admin_project_details";
import TimeLine from "./components/Admin/Timeline";
import TeamListByDepartment from "./components/Admin/TeamListByDepartment";
import NotFound from "./NotFound";
import Student_expert_review from "./components/Subject_expert/Student_expert_review";
import Schedule_review from "./components/Students/Schedule_review";
import ChangeTimeLine from "./components/Admin/ChangeTimeLine";



const Loader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile(dispatch, navigate);
  }, [dispatch, navigate]);

  return <div class="flex justify-center items-center h-40">
  <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
</div>
;
};

function App() {

  return (
    <Provider store={Store}>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Loader />} />

          <Route path="/login" element={<Login />} />

          <Route path="/student" element={<Student />}>
            <Route index element={<Student_Dashboard />} />
            <Route path="Progress_update" element={<Progress_Update />} />
            <Route path="Project_Details" element={<Project_Details />} />
            <Route path="review" element={<Schedule_review/>} />
            <Route path="invitations" element={<InvitationPage />} />
            <Route path="queries" element={<Queries />} />
           <Route path="Project_Details/proj_details/:id" element={<Proj_Details/>} />
           <Route path="upload-project-files" element={<ProjectFileUpload/>} />
           
          </Route>

          <Route path="/teacher" element={<Teacher />}>
            <Route index element={<TeacherDashBoard />} />
            <Route path="add" element={<TeacherAdd />} />
            <Route path="posted_projects" element={<PostedProjects />} />
            <Route path="student_progress/project_details/:cluster/:id" element={<ProjDetails />} />
          </Route>

          <Route path="/admin" element={<Admin />}>
            <Route index element={<Admin_Dashboard />} /> 
            <Route path="add_users" element={<Add_Users />} />
            <Route path="posted_projects" element={<Posted_project />} />
            <Route path="students_progress" element={<Students_Progress />} />
            <Route path="/admin/posted_projects/:project_id" element={<Admin_project_details />} />
            <Route path="student_progress/:cluster" element={<Admin_project_details />} />
            <Route path="TimeLine" element={<TimeLine/>}/>
            <Route path="team_list/:department" element={<TeamListByDepartment />} />
            <Route path="/admin/team_progress/:project_id" element={<Admin_project_details />} />
             <Route path="change-timeline" element={<ChangeTimeLine/>} />
          </Route>

          <Route path="/subject_expert" element={<Subject_expert />}>
            <Route index element={<SubjectExpertDashboard />} />
            <Route path="review" element={<Student_expert_review />} />
            <Route path="remarks" element={<Subject_expert_remarks />} />
          </Route>

          <Route path="/guide" element={<Guide />}>
            <Route index element={<Guide_dashboard />} />
            <Route path="queries" element={<Guide_queries />} />
            <Route path="team_progress" element={<Guide_team_progress />} />
            {/* <Route path="/guide/team_progress/:id" element={<TeamDetails/>} /> */}
          </Route>

          <Route path="*" element={<NotFound/>} />
          
        </Routes>

      </BrowserRouter>
    </Provider>
  );
}

export default App;
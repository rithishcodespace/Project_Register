import {BrowserRouter as Router,Routes,Route, BrowserRouter} from "react-router-dom"
import Login from "./Login";
import Signup from "./Signup";
import Student from "./Student";
import Teacher from "./Teacher";
import './index.css';

function App() {

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/student" element={<Student/>}></Route>
      <Route path="/teacher" element={<Teacher/>}></Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App

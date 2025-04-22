import {BrowserRouter as Router,Routes,Route, BrowserRouter} from "react-router-dom"
import Login from "./Login";
import Signup from "./Signup";
import Student from "./Student";

function App() {

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/student" element={<Student/>}></Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App

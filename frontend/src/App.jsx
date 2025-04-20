import {BrowserRouter as Router,Routes,Route, BrowserRouter} from "react-router-dom"
import Login from "./Login";
import Signup from "./Signup";

function App() {

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App

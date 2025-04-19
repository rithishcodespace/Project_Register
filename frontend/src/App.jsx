import {BrowserRouter as Router,Routes,Route, BrowserRouter} from "react-router-dom"
import Login from "./Login";

function App() {

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}></Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App

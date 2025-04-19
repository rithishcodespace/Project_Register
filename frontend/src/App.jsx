import "./Login.css";
import Google from "./assets/google_img.png";
import Lock from "./assets/lock_img.png";
import {BrowserRouter as Router,Routes,Route, BrowserRouter} from "react-router-dom"

function App() {
  return (
    <>
       <div className="login_div">
        <p className="Login"> Login</p><br />
        <div className="lnamediv"><p className="symbol">@</p><input className="lname" type="text" name="username" placeholder="Username"/></div>
        <div className="lpassdiv"><img src={Lock} className="lock" alt="Lock" /><input type="password" className="lpass" name="password" placeholder="Password"/></div>
        <button className="lbutton">Submit</button>
        <p style={{backgroundColor:"white"}}>or</p>
        <div className="gdiv"><img
      src={Google}
      alt="Google logo"
      className="google-logo"
    /><button className="glogin">Sign in with google</button></div>
       </div>
    </>
  );
}

export default App

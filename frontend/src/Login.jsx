import { useState } from "react";
import "./Login.css";
import Google from "./assets/google_img.png";
import Lock from "./assets/lock_img.png";
import {BrowserRouter as Router,Routes,Route, BrowserRouter, useNavigate} from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";
import Signup from "./Signup";

function Login() {
    
  const [name,setname] = useState("");
  const [password,setpassword] = useState("");
  const [showpassword,setshowpassword] = useState(false);
  const navigate = useNavigate()

  return (
    <>
    <div className="box"/>
    <div className="login_div">
      <p className="Login">Login</p><br />
  
      <div className="lnamediv">
        <p className="symbol">@</p>
        <input 
          onChange={(e)=>{setname(e.target.value)}}
          className="lname" 
          type="text" 
          name="username" 
          placeholder="E-mail" 
        />
      </div>
  
      <div className="lpassdiv" style={{ position: "relative" }}>
        <img 
          src={Lock} 
          className="lock" 
          alt="Lock" 
        />
        <input 
          onChange={(e)=>{setpassword(e.target.value)}}
          type={showpassword ? "text" : "password"} 
          className="lpass" 
          name="password" 
          placeholder="Password" 
        />
         <span
      onClick={() => setshowpassword(!showpassword)}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        color: "#555",
        fontSize: "18px",
        backgroundColor:"white"
      }}
    >
      {showpassword ? <FaEyeSlash style={{backgroundColor:'white',fontSize:"120%"}} /> : <FaEye style={{backgroundColor:'white',fontSize:"120%"}} />}
    </span><><p style={{fontSize:"000"}}>.</p></>
      </div>
  
      <button onClick={()=>{}} className="lbutton">Submit</button>
      
      <p style={{ backgroundColor: "white", marginBottom: "5%" ,fontSize:"110%"}}>or</p>
  
      <div className="gdiv">
        <img 
          src={Google} 
          className="google-logo" 
          alt="Google logo" 
        />
        <button className="glogin"  onClick={()=>{}}>Continue with Google</button>
        
      </div>
      <div className="dsignup">
        <p className="psignup">Don't have an account? <a href="" onClick={()=>navigate('/signup')}  className="linksignup">sign up</a></p>
      </div>
    </div>
  </>
  )
}

export default Login
import { useState } from "react";
import "./Login.css";
import Google from "../../assets/google_img.png";
import Lock from "../../assets/lock_img.png";
import {BrowserRouter as Router,Routes,Route, BrowserRouter, useNavigate} from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";
import college_img from "../../assets/college_img.png"
import axios from "axios";

function Login() {
    
  const [emailId,setemailId] = useState("");
  const [password,setpassword] = useState("");
  const [showpassword,setshowpassword] = useState(false);
  const navigate = useNavigate()

  const handleLogin = async(e) => {
    e.preventDefault();
    console.log(emailId,password);
    let response = await axios.post("http://localhost:1234/auth/login",{"emailId":emailId,"password":password},{
      headers:{
        "Content-Type":"application/json"
      }
    })
    console.log(response);
    if(response.status === 200)
    {
      // nav
    }
    else{
      // invalid
    }
  }

  return (
    <>
   
    <div className="login_div"> 
      <img src={college_img} style={{width:"50%",marginTop:"-6%",marginLeft:"25%", backgroundColor:"white",zIndex:1}} alt="" />
      <p className="Login">Hi, Welcome back</p><br />
  
      <div className="lnamediv">
        <p className="symbol">@</p>
        <input 
          onChange={(e)=>{setemailId(e.target.value)}}
          className="lname" 
          type="email" 
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
  
      <button onClick={handleLogin} className="lbutton">Submit</button>
      <div className="divider">
      <hr />
      <span>or</span>
      </div>
  
      <div className="gdiv">
        <img 
          src={Google} 
          className="google-logo" 
          alt="Google logo" 
        />
        <button className="glogin"  onClick={()=>{}}>Continue with Google</button>
        
      </div>
    </div>
  </>
  )
}

export default Login
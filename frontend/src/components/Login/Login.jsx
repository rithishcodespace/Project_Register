import { useState } from "react";
import "./Login.css";
import Google from "../../assets/google_img.png";
import Lock from "../../assets/lock_img.png";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";
import college_img from "../../assets/college_img.png";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/userSlice";

function Login() {
  const [emailId, setemailId] = useState("");
  const [password, setpassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentUserData, setStudentUserData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1234/auth/login", {
        emailId,
        password,
      }, {
       withCredentials:true
      });

      if (response.status === 200) {
        const { accessToken, refreshToken, role, reg_num } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        dispatch(addUser(response.data));

        if (role === "student") {
          // Check if project_type exists
          const projectTypeRes = await axios.get(`http://localhost:1234/student/get_project_type/${reg_num}`);
          const projectType = projectTypeRes.data?.project_type;

          if (projectType === "INTERNAL") {
            navigate("/student");
          } else if (projectType === "EXTERNAL") {
            navigate("/ext_student");
          } else {
            // No project_type set
            setStudentUserData(response.data);
            setShowStudentPopup(true);
          }
        } else {
          // Other roles
          if (role === "admin") navigate("/admin");
          else if (role === "teacher") navigate("/teacher");
          else if (role === "guide") navigate("/guide");
          else if (role === "sub_expert") navigate("/subject_expert");
          else alert("Unknown role");
        }
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Invalid login");
    }
  };

  const handleStudentChoice = async (type) => {
    if (!studentUserData) return;
    const reg_num = studentUserData.reg_num;
    const projectType = type === "internal" ? "INTERNAL" : "EXTERNAL";

    try {
      await axios.patch(
        `http://localhost:1234/student/alter_project_status/${reg_num}/${projectType}`
      );

      setShowStudentPopup(false);

      if (projectType === "INTERNAL") {
        navigate("/student");
      } else {
        navigate("/ext_student");
      }
    } catch (err) {
      console.error("Failed to update project type", err);
      alert("Failed to set project type");
    }
  };

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log("Firebase ID Token:", idToken);

      const res = await axios.post("http://localhost:1234/auth/google-login", {
        token: idToken,
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      console.log("Google login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-in error:", error);
      alert("Google login failed. Try again.");
    }
  }

  return (
    <>
      <div className="login_div">
        <img src={college_img} style={{ width: "50%", marginTop: "-6%", marginLeft: "25%", backgroundColor: "white", zIndex: 1 }} alt="" />
        <p className="Login">Hi, Welcome back</p><br />

        <div className="lnamediv">
          <p className="symbol">@</p>
          <input
            onChange={(e) => { setemailId(e.target.value) }}
            className="lname"
            type="email"
            name="username"
            placeholder="E-mail"
            required
          />
        </div>

        <div className="lpassdiv" style={{ position: "relative" }}>
          <img src={Lock} className="lock" alt="Lock" />
          <input
            onChange={(e) => { setpassword(e.target.value) }}
            type={showpassword ? "text" : "password"}
            className="lpass"
            name="password"
            placeholder="Password"
            required
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
              backgroundColor: "white"
            }}
          >
            {showpassword ? <FaEyeSlash style={{ backgroundColor: 'white', fontSize: "120%" }} /> : <FaEye style={{ backgroundColor: 'white', fontSize: "120%" }} />}
          </span><><p style={{ fontSize: "000" }}>.</p></>
        </div>

        <button onClick={handleLogin} className="lbutton">Submit</button>

        <div className="divider">
          <hr />
          <span>or</span>
        </div>

        <div className="gdiv" onClick={handleGoogleLogin}>
          <img src={Google} className="google-logo" alt="Google logo" />
          <button className="glogin">Continue with Google</button>
        </div>
      </div>

      {/* Student internal/external popup */}
      {showStudentPopup && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            textAlign: "center",
            minWidth: "300px"
          }}>
            <h3>Are you an internal or external student?</h3>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-around" }}>
              <button onClick={() => handleStudentChoice("internal")} style={{ padding: "10px 20px", cursor: "pointer" }}>Internal</button>
              <button onClick={() => handleStudentChoice("external")} style={{ padding: "10px 20px", cursor: "pointer" }}>External</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;

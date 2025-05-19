import { useState } from "react";
import "./Login.css";
import Google from "../../assets/google_img.png";
import Lock from "../../assets/lock_img.png";
import college_img from "../../assets/college_img.png";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LockIcon from '@mui/icons-material/Lock';
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
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1234/auth/login", {
        emailId,
        password,
      }, { withCredentials: true });

      if (response.status === 200) {
        const { accessToken, refreshToken, role, reg_num } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        dispatch(addUser(response.data));

        if (role === "student") {
          const projectTypeRes = await axios.get(`http://localhost:1234/student/get_project_type/${reg_num}`);
          const projectType = projectTypeRes.data?.project_type;

          if (projectType === "INTERNAL") {
            navigate("/student");
          } else if (projectType === "EXTERNAL") {
            navigate("/ext_student");
          } else {
            setStudentUserData(response.data);
            setShowStudentPopup(true);
          }
        } else {
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

  const updateProjectTypeAndNavigate = async (projectType, companyName, projName) => {
    if (!studentUserData) return;
    const reg_num = studentUserData.reg_num;

    try {
      await axios.patch(
        `http://localhost:1234/student/alter_project_status/${reg_num}/${projectType}`,
        { company: companyName, project_name: projName }
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

  const handleExternalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany.trim() || !projectName.trim()) {
      alert("Please enter both company name and project name.");
      return;
    }
    await updateProjectTypeAndNavigate("EXTERNAL", selectedCompany, projectName);
  };

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await axios.post("http://localhost:1234/auth/google-login", {
        token: idToken,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-in error:", error);
      alert("Google login failed. Try again.");
    }
  }

  return (
    <>
      <div className="login_div">
        <form className="bg-white">
          <img
            src={college_img}
            style={{
              width: "50%",
              marginTop: "-6%",
              marginLeft: "25%",
              backgroundColor: "white"
            }}
            alt=""
          />
          <p className="Login">Hi, Welcome back</p><br />

          <div className="lnamediv bg-white">
            <p className="symbol">@</p>
            <input
              onChange={(e) => setemailId(e.target.value)}
              className="lname"
              type="email"
              name="username"
              placeholder="E-mail"
              required
            />
          </div>

          <div className="lpassdiv" style={{ position: "relative" }}>
            <LockIcon className="lock" />
            <input
              onChange={(e) => setpassword(e.target.value)}
              type={showpassword ? "text" : "password"}
              className="lpass"
              name="password"
              placeholder="Password"
              required
            />
            <span
              onClick={() => setshowpassword(!showpassword)}
              style={{
                position: "absolute", right: "10px", top: "50%",
                transform: "translateY(-50%)", cursor: "pointer", color: "#555", fontSize: "18px"
              }}
            >
              {showpassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <button onClick={handleLogin} className="lbutton">Submit</button>

          <div className="divider">
            <hr /><span>or</span>
          </div>

          <div className="gdiv" onClick={handleGoogleLogin}>
            <img src={Google} className="google-logo" alt="Google logo" />
            <button className="glogin">Continue with Google</button>
          </div>
        </form>
      </div>

      {/* Popup for selecting project type and company/project name */}
      {showStudentPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            background: "white", padding: "30px", borderRadius: "8px", textAlign: "center", minWidth: "300px"
          }}>
            {!selectedProjectType && (
              <>
                <h1 className="text-md md:text-xl font-semibold bg-white text-gray-800 mb-4">
                  Are you an internal or external student?
                </h1>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => updateProjectTypeAndNavigate("INTERNAL", "", "")}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-700"
                  >
                    Internal
                  </button>
                  <button
                    onClick={() => setSelectedProjectType("EXTERNAL")}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
                  >
                    External
                  </button>
                </div>
              </>
            )}

            {selectedProjectType === "EXTERNAL" && (
              <>
                <h1 className="text-md md:text-xl bg-white font-semibold text-gray-800 mb-4">Enter Company & Project Details</h1>
                <form onSubmit={handleExternalSubmit} className="bg-white">
                  <input
                    type="text"
                    placeholder="Enter company name"
                    className="w-full p-2 border bg-white rounded mb-4"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Enter project name"
                    className="w-full p-2 bg-white border rounded mb-4"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Login;

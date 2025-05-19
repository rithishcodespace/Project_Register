import axios from "axios";
import { addUser } from "../utils/userSlice";

export const getProfile = async (dispatch, navigate) => {
  try {
    const response = await axios.get("http://localhost:1234/profile/view", {
      withCredentials: true
    });

    if (response.status === 200) {
      const userData = response.data.data;
      console.log("Profile Data:", userData);
      dispatch(addUser(userData));

      // Role-based redirection
      if (userData.role) {
        routeUserByRole(userData.role, navigate);
      } else {
        console.error("User role not found. Redirecting to login...");
        navigate("/login");
      }
    } else {
      console.error("Failed to fetch profile:", response.status);
      navigate("/login");
    }
  } catch (error) {
    console.error("Error fetching profile:", error.response ? error.response.data.message : error.message);
    navigate("/login");
  }
};

// Role-based navigation function
const routeUserByRole = (role, navigate) => {
  switch (role) {
    case "student":
      navigate("/student");
      break;
    case "teacher":
      navigate("/teacher");
      break;
    case "admin":
      navigate("/admin");
      break;
    case "guide":
      navigate("/guide");
      break;
    case "sub_expert":
      navigate("/subject_expert");
      break;
    case "ext_student":
        navigate("/student")
    default:
      console.error("Invalid user role. Redirecting to login...");
      navigate("/login");
      break;
  }
};


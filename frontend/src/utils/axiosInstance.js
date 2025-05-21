import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create an Axios instance
const instance = axios.create({
  baseURL: "http://localhost:1234",
  withCredentials: true
});

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data.message;
      if (message === "TokenExpired" || message === "TokenMissing") {
        window.location.href = "/login"; // force reload to login
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
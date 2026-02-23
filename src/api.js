import axios from "axios";
baseURL: "http://localhost:3000/api"


const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;

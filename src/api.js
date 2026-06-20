import axios from "axios";
baseURL: "https://ecommerce-backend-node-demo.onrender.com/api"


const API = axios.create({
  baseURL: "https://ecommerce-backend-node-demo.onrender.com/api",
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

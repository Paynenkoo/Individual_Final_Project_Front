import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5050/api",
  withCredentials: true, // для cookie-сесій, якщо вони є
});

// автоматично підставляємо JWT з localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;

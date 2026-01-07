 
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5050/api"; 

const api = axios.create({
  baseURL: BASE_URL.replace(/\/+$/, ""), 
  withCredentials: true,                 
});

export default api;

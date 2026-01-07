import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";

const api = axios.create({baseURL,
    withCredentials:true,
});
export default api;

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
const API_URL = `${BASE_URL}/api`;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from "axios";
import { getToken } from "./token";
const api = axios.create({
  // baseURL: `deployed_url`,
  baseURL: "http://10.222.37.118:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (attach token)

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

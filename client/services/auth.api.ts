import api from "./apiClient";

export const signupAPI = (data: any) => api.post("/auth/signup", data);
export const loginAPI = (data: any) => api.post("/auth/login", data);
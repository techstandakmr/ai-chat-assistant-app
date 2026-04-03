import api from "./apiClient";

export const getProfileAPI = () => api.get("/user/profile");
export const updateUserAPI = (data: any) => api.patch("/user/update-user", data);
export const deleteAccountAPI = (data: any) => api.delete("/user/delete-account", {data});

export const sendOTPAPI = (data: any) => api.post("/user/send-otp", data);
export const verifyOTPAPI = (data: any) => api.post("/user/verify-otp", data);

import axiosInstance from './axiousInstance';

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data; 
};

export const registerUser = async (name, email, password, role = 'student') => {
  const response = await axiosInstance.post('/auth/register', { name, email, password, role });
  return response.data; // Expects { success: true, message: "..." }
};

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
   return response.data; 
};
// --- API FUNCTIONS for Password Reset ---
export const requestPasswordResetAPI = async (data) => { // { email }
    const response = await axiosInstance.post('/auth/request-password-reset', data);
    return response.data; // Expects { success: true, message: "..." }
};

export const verifyPasswordResetOtpAPI = async (data) => { // { email, otp }
    const response = await axiosInstance.post('/auth/verify-password-reset-otp', data);
    // Expects { success: true, message: "...", resetToken: "..." } on success
    return response.data;
};

export const resetPasswordWithTokenAPI = async (token, data) => { // token from URL, data = { password }
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, data);
    return response.data; // Expects { success: true, message: "..." }
};

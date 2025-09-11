import axiosInstance from './axiousInstance';

export const getAllUsersAdmin = async () => {
    const response = await axiosInstance.get('/users');
    return response.data; // { success, count, data }
};

export const getAllStudentsAdmin = async () => {
    const response = await axiosInstance.get('/users/students');
    return response.data; // { success, count, data (students with name, email, _id) }
};

export const updateUserAdmin = async (userId, updateData) => {
    const response = await axiosInstance.put(`/users/${userId}`, updateData);
    return response.data; // { success, data }
};

export const deleteUserAdmin = async (userId) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data; // { success, message, data }
};

export const getUserByIdAdmin = async (userId) => {
     const response = await axiosInstance.get(`/users/${userId}`);
     return response.data; // { success, data }
};

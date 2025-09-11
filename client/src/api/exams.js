import axiosInstance from './axiousInstance';

// --- Admin ---
export const createExam = async (examData) => {
    const response = await axiosInstance.post('/exams', examData);
    return response.data; // { success, data }
};

export const getAllExamsAdmin = async () => {
    const response = await axiosInstance.get('/exams');
    return response.data; // { success, count, data }
};

export const updateExamAdmin = async (examId, updateData) => {
    const response = await axiosInstance.put(`/exams/${examId}`, updateData);
    return response.data; // { success, data }
};

export const deleteExamAdmin = async (examId) => {
    const response = await axiosInstance.delete(`/exams/${examId}`);
    return response.data; // { success, message, data }
};

export const assignStudentToExamAdmin = async (examId, studentId) => {
     const response = await axiosInstance.put(`/exams/${examId}/assign/${studentId}`);
     return response.data; // { success, message, data }
};

// --- Student ---
export const getMyAssignedExamsStudent = async () => {
    const response = await axiosInstance.get('/exams/my-exams');
    return response.data; // { success, count, data }
};

// --- Common (Admin or Assigned Student) ---
export const getExamDetails = async (examId) => {
    const response = await axiosInstance.get(`/exams/${examId}`);
     // IMPORTANT: Ensure backend populates questions IF needed for this view
    // e.g., For starting exam, only need questions IDs maybe, then fetch separately?
    // Let's assume backend provides populated questions here for exam start
    return response.data; // { success, data (with populated questions) }
};
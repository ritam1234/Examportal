import axiosInstance from './axiousInstance';

// --- Admin ---
export const addQuestion = async (questionData) => {
  const response = await axiosInstance.post('/questions', questionData);
  return response.data; // { success, data }
};

export const getAllQuestions = async () => {
  const response = await axiosInstance.get('/questions');
  return response.data; // { success, count, data }
};

export const updateQuestion = async (questionId, updateData) => {
  const response = await axiosInstance.put(`/questions/${questionId}`, updateData);
  return response.data; // { success, data }
};

export const deleteQuestion = async (questionId) => {
  const response = await axiosInstance.delete(`/questions/${questionId}`);
  return response.data; // { success, message, data }
};

export const getQuestionById = async (questionId) => {
    const response = await axiosInstance.get(`/questions/${questionId}`);
    return response.data; // { success, data }
}

// Potentially a route to get multiple questions by ID if needed for exam page:
// export const getQuestionsByIds = async (ids) => {
//   const response = await axiosInstance.post('/questions/batch', { ids });
//   return response.data; // { success, data } - Requires backend route
// };

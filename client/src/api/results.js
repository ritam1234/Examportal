import axiosInstance from './axiousInstance';

// --- Student ---
export const submitExamAnswers = async (examId, answers) => {
  // answers should be like [{ questionId: '...', selectedOption: '...' }]
  const response = await axiosInstance.post(`/results/submit/${examId}`, { answers });
  return response.data; // { success, message, data (result object) }
};

export const getMyResultsList = async () => {
  const response = await axiosInstance.get('/results/my-results');
  return response.data; // { success, count, data (list of results) }
};

// --- Admin ---
export const getAllResultsAdmin = async (filters = {}) => {
  // Example: filters = { examId: '...', studentId: '...' }
  const response = await axiosInstance.get('/results', { params: filters });
  return response.data; // { success, count, data }
};


// --- Common (Admin or Student who took it) ---
export const getResultDetailsById = async (resultId) => {
  const response = await axiosInstance.get(`/results/${resultId}`);
   // Ensure backend populates answers.questionId.questionText etc.
  return response.data; // { success, data (detailed result object) }
};
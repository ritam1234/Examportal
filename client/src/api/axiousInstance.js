import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      
      console.error("Unauthorized access - 401 Interceptor");
    }
    return Promise.reject(error); 
  }
);

export default axiosInstance;
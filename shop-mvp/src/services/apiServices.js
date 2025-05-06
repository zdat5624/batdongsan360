import axios from 'axios';

const apiServices = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request interceptor để thêm token vào header
apiServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('Request URL:', config.url); // Log URL
    // console.log('Token:', token); // Log token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // console.log('Authorization Header:', config.headers['Authorization']); // Log header
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý khi token hết hạn
apiServices.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data); // Log lỗi
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem("userId"); // Xóa userId khi token hết hạn
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiServices;
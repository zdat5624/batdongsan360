
import axios from 'axios';
//src/api/axiosConfig.js 

// Lấy địa chỉ API từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL; // VITE_API_URL=http://localhost:8080

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL, // Đặt baseURL từ biến môi trường
});

// Interceptor để tự động thêm token vào header Authorization và xử lý Content-Type
axiosInstance.interceptors.request.use(
    (config) => {
        // Thêm token vào header Authorization
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Nếu dữ liệu gửi đi là FormData, không đặt Content-Type để trình duyệt tự xử lý
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            // Nếu không phải FormData, đặt Content-Type mặc định là application/json
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý lỗi phản hồi (response)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi chung, ví dụ: nếu token hết hạn
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
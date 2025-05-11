import axios from 'axios';
import { message } from 'antd'; // Nhập message từ Ant Design để hiển thị thông báo

// Lấy địa chỉ API từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL; // VITE_API_URL=http://localhost:8080

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Cấu hình message của Ant Design
message.config({
    top: 20,
    duration: 4, // Thời gian hiển thị thông báo (4 giây)
    maxCount: 3,
    zIndex: 9999,
});

// Interceptor để tự động thêm token vào header Authorization và xử lý Content-Type
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi phản hồi (response)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401: // Unauthorized
                    if (error.config?.url !== '/api/auth/login') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                    break;
                case 403: // Forbidden
                    message.error(
                        error.response?.data?.message || 'Bạn không có quyền truy cập tài nguyên này!'
                    );
                    // Tùy chọn: Chuyển hướng đến trang lỗi quyền
                    window.location.href = '/forbidden';
                    break;
                case 404: // Not Found
                    message.error(
                        error.response?.data?.message || 'Tài nguyên không tồn tại hoặc không được tìm thấy!'
                    );
                    // Tùy chọn: Chuyển hướng đến trang lỗi 404
                    window.location.href = '/not-found';
                    break;
                default:
                // Xử lý các lỗi khác nếu cần
                // message.error('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } else {
            // Xử lý lỗi không có phản hồi (ví dụ: lỗi mạng)
            message.error('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng!');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
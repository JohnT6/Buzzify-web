import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

// Thêm interceptor cho request để đính kèm token vào header
instance.interceptors.request.use(function (config) {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Thêm interceptor cho response để xử lý dữ liệu và lỗi tập trung
instance.interceptors.response.use(function (response) {
    // Trả về phần data của response để code ở ngoài gọn hơn
    return response && response.data ? response.data : response;
}, function (error) {
    // Xử lý các lỗi global như 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
        // Có thể thực hiện logout hoặc chuyển hướng trang tại đây
        console.error('Phiên đăng nhập hết hạn');
    }
    return Promise.reject(error);
});

export default instance;

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const errorMessage = error.response.data?.error || '';
            if (errorMessage === 'Token is not valid' || errorMessage === 'No token, authorization denied') {
                localStorage.removeItem('token');
                localStorage.removeItem('client');
                // Redirect to login page
                window.location.href = '/login?error=expired';
            }
        }
        return Promise.reject(error);
    }
);

export default api;


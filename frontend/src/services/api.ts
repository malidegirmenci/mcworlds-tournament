// src/services/api.ts
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';


console.log("API Base URL:", apiBaseUrl); 

const apiClient = axios.create({
    baseURL: apiBaseUrl, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor (Aynı kalır)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

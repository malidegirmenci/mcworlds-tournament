// src/services/api.ts
import axios from 'axios';

const rawViteApiUrl = import.meta.env.VITE_API_BASE_URL;
console.log("Raw VITE_API_BASE_URL from import.meta.env:", rawViteApiUrl);
console.log("Type of VITE_API_BASE_URL:", typeof rawViteApiUrl);

let apiBaseUrl: string;

if (rawViteApiUrl && typeof rawViteApiUrl === 'string' && rawViteApiUrl.trim() !== '') {
    apiBaseUrl = rawViteApiUrl;
    console.log("Using VITE_API_BASE_URL:", apiBaseUrl);
} else {
    apiBaseUrl = 'http://localhost:8000/api/v1';
    console.warn("VITE_API_BASE_URL is not defined or empty, falling back to localhost:", apiBaseUrl);
}

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
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

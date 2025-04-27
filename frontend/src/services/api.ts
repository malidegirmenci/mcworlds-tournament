// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        // localStorage'dan token'ı oku
        const token = localStorage.getItem('authToken'); 
        if (token) {
            // Eğer token varsa, Authorization başlığını ayarla
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // Güncellenmiş config ile devam et
    },
    (error) => {
        // İstek hatası olursa işle
        return Promise.reject(error);
    }
);

export default apiClient;
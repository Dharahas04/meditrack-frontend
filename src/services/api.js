import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const isPublicAuth =
        config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

    if (token && !isPublicAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;

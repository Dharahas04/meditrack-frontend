import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:8080/api",
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
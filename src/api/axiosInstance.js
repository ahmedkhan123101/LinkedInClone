import axios from 'axios';
import { message } from 'antd';
import { store } from '../redux/store.js';
import { logout } from '../redux/slices/authSlice.js';

let accessToken = null

export const setAccessToken = (token) => {
    accessToken = token
}

export const clearAccessToken = () => {
    accessToken = null
}

const axiosInstance = axios.create({
    baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/v1',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

let refreshPromise = null

axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true

            if (!refreshPromise) {
                refreshPromise = axiosInstance.post('/auth/refresh-token')
                    .then(({ data }) => setAccessToken(data.access.token))
                    .catch((refreshError) => {
                        clearAccessToken()
                        store.dispatch(logout())
                        throw refreshError
                    })
                    .finally(() => { refreshPromise = null })
            }

            try {
                await refreshPromise
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                return Promise.reject(refreshError)
            }
        }
        if (error.response) {
            const { status, data } = error.response;

            if (status !== 404) {
                message.error(data?.message || "An error occurred");
            }
        }

        else if (error.request) {
            console.error("No response received from server.");
            message.error({
                content: "Network Error: Server unreachable.",
                key: 'network_error_key'
            });
        }
        else {
            message.error({
                content: "Request Error: " + error.message,
                key: 'request_error_key'
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
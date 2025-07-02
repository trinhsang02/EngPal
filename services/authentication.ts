import axios from 'axios';
import { API_CONFIG } from './api';

const api = axios.create(API_CONFIG);

export async function loginApi(username: string, password: string) {
    try {
        const res = await axios.post(`${API_CONFIG.baseURL}/api/login`, { username, password });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Login failed');
    }
}

export async function registerApi(username: string, password: string) {
    try {
        const res = await axios.post(`${API_CONFIG.baseURL}/api/register`, { username, password });
        return res.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Register failed');
    }
}

export async function forgotPasswordApi(username: string, password: string) { }

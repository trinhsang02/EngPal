import axios from 'axios';
import { API_CONFIG } from './api';

const api = axios.create(API_CONFIG);

export async function suggestWords(query: string) {
    try {
        const res = await api.get(`${API_CONFIG.baseURL}/api/word/suggest`, { params: { query } });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch word suggestions');
    }
}

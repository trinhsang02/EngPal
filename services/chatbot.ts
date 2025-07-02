import axios from 'axios';
import { API_CONFIG } from './api';

const api = axios.create(API_CONFIG);

export const getChatbotResponse = async (message: string) => {
    try {
        const response = await api.post(`${API_CONFIG.baseURL}/api/chatbot/answer`, { question: message });
        return response.data;
    } catch (error) {
        console.error('Error fetching chatbot response:', error);
        throw error;
    }
}
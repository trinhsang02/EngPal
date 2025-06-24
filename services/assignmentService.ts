import axios from 'axios';
import { AssignmentRequest, AssignmentResponse } from './model';
import { API_CONFIG } from './api';

const api = axios.create(API_CONFIG);

export const getSuggestionTopics = async (): Promise<string[]> => {
    try {
        const response = await api.get<{ topics: string[] }>(`${API_CONFIG.baseURL}/api/assignment/suggest-topics`);
        return response.data.topics;
    } catch (error: any) {
        throw new Error('Failed to get suggestion topics');
    }
};

// API call function
export const generateAssignment = async (requestData: AssignmentRequest): Promise<AssignmentResponse> => {
    try {
        const response = await api.post<AssignmentResponse>(`${API_CONFIG.baseURL}/api/assignment/generate`, requestData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to generate assignment');
    }
}; 
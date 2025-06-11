import axios from 'axios';
import { ReviewRequest, ReviewResponse } from './model';
import { API_CONFIG } from './api';

// Create axios instance
const api = axios.create(API_CONFIG);

export const getReview = async (requestData: ReviewRequest): Promise<ReviewResponse> => {
    try {
        // Validate request data
        if (!requestData.content || requestData.content.trim() === '') {
            throw new Error('Nội dung bài viết không được để trống');
        }

        const wordCount = requestData.content.trim().split(/\s+/).length;
        if (wordCount < 10) {
            throw new Error('Bài viết phải dài tối thiểu 10 từ');
        }
        if (wordCount > 1000) {
            throw new Error('Bài viết không được dài hơn 1000 từ');
        }

        console.log('Sending request to:', `${API_CONFIG.baseURL}/api/review/generate`);
        console.log('Request data:', {
            ...requestData,
            content: requestData.content.substring(0, 100) + (requestData.content.length > 100 ? '...' : '')
        });

        const response = await api.post<ReviewResponse>('/api/review/generate', requestData);
        console.log('Response received:', response.data);

        return response.data;
    } catch (error: any) {
        console.error('API Error:', {
            message: error.message,
            url: `${API_CONFIG.baseURL}/api/review/generate`,
            data: {
                ...requestData,
                content: requestData.content.substring(0, 100) + (requestData.content.length > 100 ? '...' : '')
            }
        });

        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
        }
        if (error.message === 'Network Error') {
            throw new Error('Cannot connect to server. Please check your internet connection.');
        }
        throw new Error(error.message || 'Failed to get review. Please try again.');
    }
}; 
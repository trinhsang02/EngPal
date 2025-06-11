import axios from 'axios';
import { AssignmentRequest, AssignmentResponse } from './model';

const url = process.env.API_URL;


// API call function
export const generateAssignment = async (requestData: AssignmentRequest): Promise<AssignmentResponse> => {
    try {
        const response = await axios.post<AssignmentResponse>(`${url}/api/assignment/generate`, requestData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to generate assignment');
    }
}; 
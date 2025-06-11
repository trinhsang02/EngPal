export interface AssignmentRequest {
    topic: string;
    assignment_types: string[];
    english_level: string;
    total_questions: number;
}

export interface Quiz {
    id: number;
    type: string;
    question: string;
    answer: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

export interface AssignmentResponse {
    topic: string;
    level: string;
    total: number;
    generated: number;
    quizzes: Quiz[];
}

export interface ReviewRequest {
    content: string;
    user_level: string;
    requirement: string;
    category: string;
    language: string;
}

export interface ReviewResponse {
    content: string;
    user_level: string;
    requirement: string;
    word_count: number;
    estimated_level: string;
    scores: {
        grammar: number;
        vocabulary: number;
        coherence: number;
        task_response: number;
        overall: number;
    };
    overall_feedback: string;
    strength_points: string[];
    improvement_areas: string[];
    suggestions: {
        category: string;
        issue: string;
        suggestion: string;
        example: string;
        priority: string;
    }[];
    corrected_version: string;
    generated_at: string;
    processing_time_ms: number;
}
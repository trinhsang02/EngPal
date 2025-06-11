export type UserLevel = 'beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Proficient';

export interface User {
    id: string;
    email: string;
    name: string;
    level: UserLevel;
    isLoggedIn: boolean;
    lastLogin?: Date;
    progress?: {
        completedLessons: number;
        totalLessons: number;
        streak: number;
    };
}

export interface UserContextType {
    user: User | null;
    login: (userData: Omit<User, 'isLoggedIn'>) => Promise<void>;
    logout: () => Promise<void>;
    updateUserLevel: (level: UserLevel) => Promise<void>;
    updateProgress: (progress: User['progress']) => Promise<void>;
} 
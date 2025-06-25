/**
 * Utility functions for managing learning streaks
 */

export interface StreakData {
    streak: number;
    lastActivityDate: string;
    todayProgress: number;
    learningGoal: number;
}

/**
 * Calculate days difference between two dates
 */
export function getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if streak should be reset based on last activity
 */
export function shouldResetStreak(lastActivityDate: string): boolean {
    const today = getTodayDate();
    const daysDiff = getDaysDifference(lastActivityDate, today);
    return daysDiff > 1; // Reset if more than 1 day missed
}

/**
 * Check if streak should be incremented
 */
export function shouldIncrementStreak(streakData: StreakData): boolean {
    const today = getTodayDate();
    return (
        streakData.lastActivityDate === today &&
        streakData.todayProgress >= streakData.learningGoal
    );
}

/**
 * Get streak status message
 */
export function getStreakStatus(streak: number): string {
    if (streak === 0) return "Bắt đầu chuỗi học tập của bạn!";
    if (streak === 1) return "Ngày đầu tiên! Tiếp tục nào!";
    if (streak < 7) return `Chuỗi ${streak} ngày! Đang tiến bộ!`;
    if (streak < 30) return `Chuỗi ${streak} ngày! Thật ấn tượng!`;
    if (streak < 100) return `Chuỗi ${streak} ngày! Bạn thật tuyệt vời!`;
    return `Chuỗi ${streak} ngày! Bạn là một huyền thoại! 🔥`;
} 
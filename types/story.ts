export interface Story {
    id: string;
    title: string;
    author: string;
    cover: string;
    description: string;
    level: string;
    chapters: number;
    rating: number;
    readCount: number;
    tags: string[];
    status: string;
}

export interface Chapter {
    id: string;
    title: string;
    content: string;
    chapterNumber: number;
    wordCount: number;
    difficulty: string;
}

export interface StoryProgress {
    storyId: string;
    currentChapter: number;
    completedChapters: string[];
    readingTime: number;
    lastReadAt: Date;
} 
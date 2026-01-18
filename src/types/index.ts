// Type definitions for SQLite (no enums)
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type ContentType = 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT';
export type ProgressStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
export type LessonStatus = 'DRAFT' | 'PUBLISHED';

// User types
export interface SafeUser {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    role: string;
    points: number;
    createdAt: Date;
    lastActiveAt: Date;
}

// Track types
export interface TrackWithProgress {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    orderIndex: number;
    prerequisiteTrackId: string | null;
    totalLessons: number;
    completedLessons: number;
    isLocked: boolean;
}

// Module types
export interface ModuleWithLessons {
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
    lessons: LessonWithProgress[];
}

// Lesson types
export interface LessonWithProgress {
    id: string;
    title: string;
    contentType: string;
    pointsValue: number;
    orderIndex: number;
    status: string;
    progress: {
        status: string;
        completedAt: Date | null;
    } | null;
}

export interface LessonContent {
    id: string;
    title: string;
    contentType: string;
    contentData: VideoContent | PDFContent | QuizContent | AssignmentContent;
    pointsValue: number;
    module: {
        id: string;
        name: string;
        track: {
            id: string;
            name: string;
            slug: string;
        };
    };
    nextLesson: {
        id: string;
        title: string;
    } | null;
    prevLesson: {
        id: string;
        title: string;
    } | null;
}

// Content data types
export interface VideoContent {
    type: 'video';
    youtube_url: string;
    duration_seconds?: number;
    transcript?: string;
}

export interface PDFContent {
    type: 'pdf';
    file_url: string;
    page_count?: number;
}

export interface QuizContent {
    type: 'quiz';
    questions: QuizQuestion[];
    passing_score: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
}

export interface AssignmentContent {
    type: 'assignment';
    description: string;
    checklist?: string[];
    attachment?: string;
}

// Community types
export interface PostWithAuthor {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    commentsLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
    };
    _count: {
        comments: number;
    };
}

export interface CommentWithAuthor {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
    };
    replies?: CommentWithAuthor[];
}

// Analytics types
export interface DashboardStats {
    totalUsers: number;
    activeUsers7d: number;
    activeUsers30d: number;
    trackCompletionRates: {
        trackId: string;
        trackName: string;
        completionRate: number;
    }[];
    topUsers: {
        id: string;
        name: string;
        points: number;
    }[];
}

// NextAuth type extensions
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }

    interface User {
        role?: string;
    }
}

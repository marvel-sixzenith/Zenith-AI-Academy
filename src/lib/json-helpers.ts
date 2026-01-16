/**
 * JSON Helper Utilities for SQLite String-based JSON fields
 * Handles safe parsing/stringifying of JSON data stored as strings
 */

import type { VideoContent, PDFContent, QuizContent, AssignmentContent } from '@/types';

// Type guard for lesson content
export function isValidLessonContent(data: unknown): data is VideoContent | PDFContent | QuizContent | AssignmentContent {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    return 'type' in obj && typeof obj.type === 'string';
}

/**
 * Parse lesson contentData from JSON string
 */
export function parseContentData(jsonString: string | null): VideoContent | PDFContent | QuizContent | AssignmentContent | null {
    if (!jsonString) return null;

    try {
        const parsed = JSON.parse(jsonString);
        if (isValidLessonContent(parsed)) {
            return parsed;
        }
        console.error('Invalid content data structure:', parsed);
        return null;
    } catch (error) {
        console.error('Failed to parse contentData:', error);
        return null;
    }
}

/**
 * Stringify content data to JSON string
 */
export function stringifyContentData(data: VideoContent | PDFContent | QuizContent | AssignmentContent): string {
    try {
        return JSON.stringify(data);
    } catch (error) {
        console.error('Failed to stringify contentData:', error);
        throw new Error('Invalid content data');
    }
}

/**
 * Parse badge criteria from JSON string
 */
export function parseBadgeCriteria(jsonString: string | null): Record<string, unknown> | null {
    if (!jsonString) return null;

    try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as Record<string, unknown>;
        }
        return null;
    } catch (error) {
        console.error('Failed to parse badge criteria:', error);
        return null;
    }
}

/**
 * Parse system setting value from JSON string
 */
export function parseSystemSettingValue(jsonString: string | null): unknown {
    if (!jsonString) return null;

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse system setting value:', error);
        return null;
    }
}

/**
 * Safe JSON stringify with fallback
 */
export function safeStringify(data: unknown, fallback: string = '{}'): string {
    try {
        return JSON.stringify(data);
    } catch (error) {
        console.error('Failed to stringify data:', error);
        return fallback;
    }
}

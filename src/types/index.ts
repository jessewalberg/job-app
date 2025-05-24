import type { ChromeMessage } from './chrome';

export interface User {
    id: string;
    email: string;
    name: string;
    credits: number;
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: string;
    updatedAt: string;
}

export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary?: string;
    type?: string;
    postedDate?: string;
    url: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Resume {
    id: string;
    userId: string;
    filename: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

export interface CoverLetter {
    id: string;
    userId: string;
    jobId: string;
    jobTitle: string;
    company: string;
    content: string;
    creditsUsed: number;
    createdAt: string;
    updatedAt: string;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface GenerateCoverLetterRequest {
    jobId: string;
    resumeId: string;
    tone?: string;
    length?: string;
    additionalNotes?: string;
}

export interface GenerateCoverLetterResponse {
    content: string;
    remainingCredits: number;
}

export interface GenerateCoverLetterFromContentRequest {
    jobContent: ExtractedContent;
    resumeId: string;
    tone?: string;
    length?: string;
    additionalNotes?: string;
}

// NEW: Content extraction interfaces
export interface ExtractedContent {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary?: string;
    type?: string;
    postedDate?: string;
    url: string;
    confidence: number;
}

export interface PageMetadata {
    domain: string;
    path: string;
    pageType: string;
    wordCount: number;
    hasImages: boolean;
    hasVideo: boolean;
    structuredData: any[];
    metaTags: Record<string, string>;
    openGraph: Record<string, string>;
    headings: Array<{level: number, text: string}>;
    mainContent: Array<{selector: string, text: string}>;
    timestamp: string;
}

// Chrome Extension Types
export interface JobSiteConfig {
    name: string;
    hostname: string;
    patterns: string[];
    selectors: {
        title: string;
        company: string;
        location: string;
        description?: string;
        salary?: string;
    };
}

// React Component Props
export interface TabNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    user: User;
}

export interface GenerateTabProps {
    user: User;
    onUserUpdate: (user: User) => void;
}

export interface HistoryTabProps {
    user: User;
}

export interface SettingsTabProps {
    user: User;
    onUserUpdate: (user: User) => void;
}

// Storage Types
export interface StorageData {
    authToken?: string;
    userData?: User;
    settings?: UserSettings;
    lastExtractedJob?: ExtractedContent;
    extractionTimestamp?: number;
}

export interface UserSettings {
    autoDetect: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
}

// API Service Types
export interface APIServiceConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
}

// Error Types
export interface APIError {
    message: string;
    status?: number;
    code?: string;
}
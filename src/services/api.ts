import CONFIG from '@/config';
import type { Resume, GenerateCoverLetterFromContentRequest, GenerateCoverLetterResponse, CoverLetter, User, AuthResponse } from '@/types';

interface RequestOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = CONFIG.REQUEST_TIMEOUT, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
    const { retries = CONFIG.MAX_RETRIES, ...fetchOptions } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  public async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET'
    });
    return response.json();
  }

  public async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  public async put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  public async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'DELETE'
    });
    return response.json();
  }

  public async getResumes(): Promise<Resume[]> {
    return this.get<Resume[]>('/resumes');
  }

  public async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('filename', file.name);

    const response = await fetch(`${this.baseUrl}/resumes/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }

    return response.json();
  }

  public async generateCoverLetterFromContent(data: GenerateCoverLetterFromContentRequest): Promise<GenerateCoverLetterResponse> {
    return this.post<GenerateCoverLetterResponse>('/cover-letters/generate-from-content', data);
  }

  public async getCoverLetters(): Promise<CoverLetter[]> {
    return this.get<CoverLetter[]>('/cover-letters');
  }

  public async createBillingSession(priceId: string): Promise<{ url: string }> {
    return this.post<{ url: string }>('/billing/create-session', { priceId });
  }

  public async getUserProfile(): Promise<User> {
    return this.get<User>('/users/profile');
  }

  public async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  public async register(userData: { email: string; password: string; name: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', userData);
  }
}

export const apiService = ApiService.getInstance();
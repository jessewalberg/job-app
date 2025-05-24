import { apiService } from './api';
import type { ExtractedContent, JobData } from '@/types';

export class JobExtractionService {
  private static instance: JobExtractionService;

  private constructor() {}

  public static getInstance(): JobExtractionService {
    if (!JobExtractionService.instance) {
      JobExtractionService.instance = new JobExtractionService();
    }
    return JobExtractionService.instance;
  }

  public async extractJobFromUrl(url: string): Promise<ExtractedContent> {
    try {
      const response = await apiService.post<ExtractedContent>('/jobs/extract', { url });
      return response;
    } catch (error) {
      console.error('Error extracting job:', error);
      throw new Error('Failed to extract job information');
    }
  }

  public async extractJobFromContent(content: string): Promise<ExtractedContent> {
    try {
      const response = await apiService.post<ExtractedContent>('/jobs/extract-from-content', { content });
      return response;
    } catch (error) {
      console.error('Error extracting job from content:', error);
      throw new Error('Failed to extract job information from content');
    }
  }

  public async extractJobFromHTML(html: string, url: string, title: string): Promise<{ jobData: JobData; confidence: number }> {
    return apiService.post<{ jobData: JobData; confidence: number }>('/jobs/extract-from-html', {
      html,
      url,
      title
    });
  }
}

export const jobExtractionService = JobExtractionService.getInstance();
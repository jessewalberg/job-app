import { jobExtractionService } from './jobExtraction';
import type { ExtractedContent } from '@/types';
import type { ChromeTab } from '@/types/chrome';

export class ContentScriptService {
  private static instance: ContentScriptService;

  private constructor() {}

  public static getInstance(): ContentScriptService {
    if (!ContentScriptService.instance) {
      ContentScriptService.instance = new ContentScriptService();
    }
    return ContentScriptService.instance;
  }

  public async extractJobFromPage(tab: ChromeTab): Promise<ExtractedContent | null> {
    try {
      if (!tab.url) {
        throw new Error('No URL found in tab');
      }

      const response = await jobExtractionService.extractJobFromUrl(tab.url);
      return response;
    } catch (error) {
      console.error('Error extracting job from page:', error);
      return null;
    }
  }

  public async extractJobFromContent(content: string): Promise<ExtractedContent | null> {
    try {
      const response = await jobExtractionService.extractJobFromContent(content);
      return response;
    } catch (error) {
      console.error('Error extracting job from content:', error);
      return null;
    }
  }
}

export const contentScriptService = ContentScriptService.getInstance();
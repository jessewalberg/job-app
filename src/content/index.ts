import { HTMLExtractor } from './htmlExtractor';
import { jobExtractionService } from '../services/jobExtraction';
import type { JobData } from '@/types';
import type { ContentScriptMessage } from '@/types/chrome';

class PageExtractor {
  constructor() {
    this.init();
  }

  private init(): void {
    this.setupMessageListener();
  }

  /**
   * Extract content from current page
   */
  private async extractPageContent(): Promise<void> {
    try {
      // Get page data
      const pageData = HTMLExtractor.extractPageData();
      
      // Send to LLM for processing
      const result = await jobExtractionService.extractJobFromHTML(
        pageData.html,
        pageData.url,
        pageData.title
      );

      // Store the extracted data for the popup to use
      await this.storeExtractedData({
        ...result.jobData,
        url: pageData.url,
        extractedAt: new Date().toISOString(),
        confidence: result.confidence || 0,
        pageTitle: pageData.title,
        domain: pageData.metadata.domain,
        pageType: pageData.metadata.pageType
      });

    } catch (error) {
      console.error('Content extraction failed:', error);
      throw error;
    }
  }

  /**
   * Store extracted data in Chrome storage for popup to access
   */
  private async storeExtractedData(data: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ 
        lastExtractedJob: data,
        extractionTimestamp: Date.now()
      }, resolve);
    });
  }

  /**
   * Message listener for communication with popup
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: ContentScriptMessage, sender, sendResponse) => {
      switch (message.type) {
        case 'EXTRACT_PAGE_CONTENT':
          this.extractPageContent()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open

        case 'GET_PAGE_DATA':
          const pageData = HTMLExtractor.extractPageData();
          sendResponse({ success: true, data: pageData });
          break;

        case 'PING':
          sendResponse({ success: true, message: 'Content script active' });
          break;
      }
    });
  }
}

// Initialize on all pages
new PageExtractor();
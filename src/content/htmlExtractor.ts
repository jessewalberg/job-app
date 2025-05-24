import type { PageMetadata } from '@/types';

export class HTMLExtractor {
  static extractPageData(): { 
    html: string;
    url: string;
    title: string;
    metadata: PageMetadata;
  } {
    const html = document.documentElement.outerHTML;
    const url = window.location.href;
    const title = document.title;

    const metadata: PageMetadata = {
      domain: window.location.hostname,
      path: window.location.pathname,
      pageType: this.detectPageType(),
      wordCount: this.countWords(document.body.innerText),
      hasImages: document.images.length > 0,
      hasVideo: document.querySelectorAll('video').length > 0,
      structuredData: this.extractStructuredData(),
      metaTags: this.extractMetaTags(),
      openGraph: this.extractOpenGraph(),
      headings: this.extractHeadings(),
      mainContent: this.extractMainContent(),
      timestamp: new Date().toISOString()
    };

    return { html, url, title, metadata };
  }

  private static detectPageType(): string {
    // Basic page type detection
    if (document.querySelector('[itemtype*="JobPosting"]')) {
      return 'job_posting';
    }
    if (document.querySelector('[itemtype*="Organization"]')) {
      return 'company_page';
    }
    return 'unknown';
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private static extractStructuredData(): any[] {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(scripts).map(script => {
      try {
        return JSON.parse(script.textContent || '{}');
      } catch {
        return {};
      }
    });
  }

  private static extractMetaTags(): Record<string, string> {
    const metaTags: Record<string, string> = {};
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });
    return metaTags;
  }

  private static extractOpenGraph(): Record<string, string> {
    const ogTags: Record<string, string> = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
      const property = meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (property && content) {
        ogTags[property] = content;
      }
    });
    return ogTags;
  }

  private static extractHeadings(): Array<{level: number, text: string}> {
    const headings: Array<{level: number, text: string}> = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      headings.push({
        level,
        text: heading.textContent || ''
      });
    });
    return headings;
  }

  private static extractMainContent(): Array<{selector: string, text: string}> {
    const mainContent: Array<{selector: string, text: string}> = [];
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '#content',
      '.main-content',
      '#main-content'
    ];

    contentSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        mainContent.push({
          selector,
          text: element.textContent || ''
        });
      });
    });

    return mainContent;
  }
} 
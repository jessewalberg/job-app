import type { ChromeMessage, ChromeTab } from '@/types/chrome';

class BackgroundService {
  constructor() {
    this.init();
    this.setupAutoReload();
  }

  private init(): void {
    this.setupMessageListeners();
    this.setupContextMenus();
    this.setupTabUpdateListener();
  }

  private setupAutoReload(): void {
    // Only enable in development
    const manifest = chrome.runtime.getManifest();
    if (manifest.name.includes('Development')) {
      console.log('🔄 Auto-reload enabled for development');
      
      chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
        if (message.type === 'RELOAD_EXTENSION') {
          console.log('🔄 Reloading extension...');
          chrome.runtime.reload();
          return true;
        }
      });
    }
  }

  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
      switch (message.type) {
        case 'OPEN_POPUP':
          this.openPopup();
          break;
        case 'OPEN_POPUP_WITH_CONTENT':
          this.openPopup();
          break;
        case 'GET_CURRENT_TAB':
          this.getCurrentTab().then(sendResponse);
          return true;
        case 'EXTRACT_JOB':
          this.extractJobFromTab(message.tabId).then(sendResponse);
          return true;
        default:
          break;
      }
    });
  }

  private setupContextMenus(): void {
    chrome.contextMenus.create({
      id: 'covercraft-extract',
      title: 'Extract content with CoverCraft',
      contexts: ['page']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'covercraft-extract') {
        // Send message to content script to extract
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE_CONTENT' });
        }
      }
    });
  }

  private setupTabUpdateListener(): void {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('https://')) {
        // Inject content script on all HTTPS pages
        this.injectContentScript(tabId);
      }
    });
  }

  private async openPopup(): Promise<void> {
    try {
      await chrome.action.openPopup();
    } catch (error) {
      console.error('Failed to open popup:', error);
    }
  }

  private async getCurrentTab(): Promise<ChromeTab> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab as ChromeTab;
  }

  private async extractJobFromTab(tabId?: number): Promise<any> {
    try {
      const targetTabId = tabId || (await this.getCurrentTab()).id;
      const results = await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: () => {
          // This function runs in the context of the webpage
          if ((window as any).jobDetector) {
            return (window as any).jobDetector.extractJobData();
          }
          return null;
        }
      });

      return results[0]?.result;
    } catch (error) {
      console.error('Failed to extract job data:', error);
      return null;
    }
  }

  private async injectContentScript(tabId: number): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (error) {
      // Silently fail - some pages don't allow script injection
      console.log('Could not inject content script:', error instanceof Error ? error.message : String(error));
    }
  }

  private trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    fetch('https://covercraft-api.your-account.workers.dev/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    }).catch(console.error);
  }
}

// Initialize background service
new BackgroundService();
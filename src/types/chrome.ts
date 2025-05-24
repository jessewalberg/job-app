export interface ChromeTab extends chrome.tabs.Tab {
  id: number;
  url: string;
  title: string;
  active: boolean;
  windowId: number;
}

export interface ChromeMessage {
  type: string;
  payload?: any;
  tabId?: number;
}

export interface ChromeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChromeStorage {
  get(keys: string | string[] | object | null): Promise<{ [key: string]: any }>;
  set(items: object): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface ChromeRuntime {
  sendMessage(message: ChromeMessage): Promise<any>;
  onMessage: {
    addListener(callback: (message: ChromeMessage, sender: any) => void): void;
    removeListener(callback: (message: ChromeMessage, sender: any) => void): void;
  };
}

declare global {
  namespace chrome {
    interface Tabs {
      query(queryInfo: object): Promise<ChromeTab[]>;
      sendMessage(tabId: number, message: ChromeMessage): Promise<any>;
    }

    interface Storage {
      local: ChromeStorage;
      sync: ChromeStorage;
    }

    interface Runtime {
      sendMessage(message: ChromeMessage): Promise<any>;
      onMessage: {
        addListener(callback: (message: ChromeMessage, sender: any) => void): void;
        removeListener(callback: (message: ChromeMessage, sender: any) => void): void;
      };
    }
  }
}

// Content Script Types
export interface ContentScriptMessage {
  type: 'EXTRACT_JOB_DATA' | 'OPEN_POPUP' | 'RELOAD_EXTENSION' | 'EXTRACT_PAGE_CONTENT' | 'GET_PAGE_DATA' | 'PING';
  data?: any;
}

// Background Script Types
export interface BackgroundMessage {
  type: 'OPEN_POPUP' | 'GET_CURRENT_TAB' | 'EXTRACT_JOB';
  tabId?: number;
}
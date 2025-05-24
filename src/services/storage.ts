import type { User, UserSettings, StorageData } from '@/types';

export class StorageService {
  static async setToken(token: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ authToken: token }, resolve);
    });
  }

  static async getToken(): Promise<string | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result: StorageData) => {
        resolve(result.authToken);
      });
    });
  }

  static async clearToken(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['authToken'], resolve);
    });
  }

  static async setUserData(userData: User): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ userData }, resolve);
    });
  }

  static async getUserData(): Promise<User | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userData'], (result: StorageData) => {
        resolve(result.userData);
      });
    });
  }

  static async setSettings(settings: UserSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ settings }, resolve);
    });
  }

  static async getSettings(): Promise<UserSettings | undefined> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings'], (result: { settings?: UserSettings }) => {
        resolve(result.settings);
      });
    });
  }

  static async clearAll(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        chrome.storage.sync.clear(resolve);
      });
    });
  }
}
// Frontend API Key Management
// Provides utilities for storing and using API keys alongside JWT tokens

const API_KEY_STORAGE_KEY = 'truck_ui_api_key';

export const apiKeyManager = {
  // Save API key to localStorage
  saveKey(apiKey: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  },

  // Get API key from localStorage
  getKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  },

  // Clear API key from localStorage
  clearKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  },

  // Check if API key is available
  hasKey(): boolean {
    return !!localStorage.getItem(API_KEY_STORAGE_KEY);
  },

  // Get headers for API requests (includes API key if available, otherwise JWT)
  getAuthHeaders(jwtToken?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const apiKey = this.getKey();

    // Prefer API key if available
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
      console.log('✅ Using API Key authentication');
    } else if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
      console.log('✅ Using JWT authentication');
    }

    return headers;
  },
};

export default apiKeyManager;

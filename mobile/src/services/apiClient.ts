import { API_BASE_URL } from '../config/api';

/**
 * Common fetch utility for querying the Node.js API gateway.
 * Extracts the inner `.data` payload from backend responses.
 */
export async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(
        errorPayload?.error?.message || 
        `Network request failed (status: ${response.status})`
      );
    }

    const json = await response.json();
    return json.data as T;
  } catch (error: any) {
    console.error(`[apiFetch Error] Path ${endpoint}:`, error.message);
    throw error;
  }
}

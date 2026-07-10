import type { TokenPair } from '../types/auth';
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

interface ApiOptions extends RequestInit {
  authenticated?: boolean;
  skipRefresh?: boolean;
}

async function refreshToken(): Promise<TokenPair | null> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = (await response.json()) as { tokens: TokenPair };
  storeTokens(data.tokens);
  return data.tokens;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authenticated !== false) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && options.authenticated !== false && !options.skipRefresh) {
    const tokens = await refreshToken();
    if (tokens) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(typeof error.detail === 'string' ? error.detail : 'Request failed');
  }

  return response.json() as Promise<T>;
}


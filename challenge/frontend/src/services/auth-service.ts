/**
 * Auth Service
 * Manages JWT token storage and authentication state
 * Localstorage because we're js devs!
 */

const TOKEN_KEY = "auth_token";

/**
 * Returns the Authorization header value if a token exists.
 * @returns The bearer token string or null if not authenticated
 */
export function getAuthHeader(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? `Bearer ${token}` : null;
}

/**
 * Stores or clears the authentication token.
 * @param authKey The JWT token to store, or null to clear
 */
export function setAuthKey(authKey: string | null): void {
  if (authKey) {
    localStorage.setItem(TOKEN_KEY, authKey);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Checks if the user is currently authenticated.
 * @returns true if a token exists
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null;
}

/**
 * Clears the authentication token (logout).
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
}

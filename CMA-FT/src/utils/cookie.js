// Cookie utility functions

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Set a cookie with the given name, value and options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export function setCookie(name, value, options = {}) {
    const defaults = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict',
        maxAge: 8 * 60 * 60 // 8 hours default
    };

    const settings = { ...defaults, ...options };
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (settings.path) cookieString += `; path=${settings.path}`;
    if (settings.maxAge) cookieString += `; max-age=${settings.maxAge}`;
    if (settings.expires) cookieString += `; expires=${settings.expires.toUTCString()}`;
    if (settings.secure) cookieString += '; secure';
    if (settings.sameSite) cookieString += `; samesite=${settings.sameSite}`;
    
    document.cookie = cookieString;
}

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export function deleteCookie(name, path = '/') {
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean}
 */
export function hasCookie(name) {
    return getCookie(name) !== null;
}

// LocalStorage utility functions with error handling

/**
 * Set an item in localStorage with JSON serialization
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} - Success status
 */
export function setLocalStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Get an item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed value or default
 */
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key
 */
export function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

/**
 * Clear all items from localStorage
 */
export function clearLocalStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

// Session preferences management
const SESSION_PREFS_KEY = 'user_preferences';

/**
 * Save user preferences to localStorage
 * @param {Object} prefs - User preferences object
 */
export function saveUserPreferences(prefs) {
    const current = getLocalStorage(SESSION_PREFS_KEY, {});
    setLocalStorage(SESSION_PREFS_KEY, { ...current, ...prefs });
}

/**
 * Get user preferences from localStorage
 * @returns {Object} - User preferences
 */
export function getUserPreferences() {
    return getLocalStorage(SESSION_PREFS_KEY, {});
}

/**
 * Get a specific user preference
 * @param {string} key - Preference key
 * @param {any} defaultValue - Default value
 * @returns {any}
 */
export function getUserPreference(key, defaultValue = null) {
    const prefs = getUserPreferences();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
}
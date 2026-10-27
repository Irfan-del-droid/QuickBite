/**
 * QuickBite - Shared LocalStorage Helper (js/storage.js)
 * Coordinates data persistence across modules.
 * 
 * Keys in use:
 * - qb_users: Simulated registered user accounts
 * - qb_current_user: Active demo session (non-sensitive info only)
 * 
 * Note: Browser LocalStorage is used strictly for mini-project demonstration.
 * Never store real passwords or sensitive personal data.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    USERS: 'qb_users',
    CURRENT_USER: 'qb_current_user'
  };

  /**
   * Default initial demo account for testing and evaluation
   */
  const DEFAULT_DEMO_USERS = [
    {
      name: 'Demo Gourmet',
      email: 'demo@quickbite.com',
      password: 'Password123',
      createdAt: '2026-10-27T00:00:00.000Z'
    }
  ];

  /**
   * Safe JSON parse with fallback
   */
  function safeJSONParse(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('[QuickBite Storage] Corrupted JSON detected. Resetting to fallback.', e);
      return fallback;
    }
  }

  const QuickBiteStorage = {
    /**
     * Retrieve all registered demo users.
     * Automatically seeds default demo account if storage is currently empty.
     */
    getUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_DEMO_USERS));
          return [...DEFAULT_DEMO_USERS];
        }
        const parsed = safeJSONParse(raw, DEFAULT_DEMO_USERS);
        return Array.isArray(parsed) ? parsed : DEFAULT_DEMO_USERS;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to get users from localStorage:', err);
        return [...DEFAULT_DEMO_USERS];
      }
    },

    /**
     * Find a user account by email address (case-insensitive)
     */
    findUserByEmail(email) {
      if (!email) return null;
      const normalized = email.trim().toLowerCase();
      const users = this.getUsers();
      return users.find(u => (u.email || '').toLowerCase() === normalized) || null;
    },

    /**
     * Register and save a new user account into qb_users
     */
    saveUser(userData) {
      try {
        if (!userData || !userData.email) return false;
        const users = this.getUsers();
        
        // Ensure email is lowercased for consistent indexing
        const record = {
          name: (userData.name || '').trim(),
          email: userData.email.trim().toLowerCase(),
          password: userData.password, // Demo simulated storage only
          createdAt: userData.createdAt || new Date().toISOString()
        };

        users.push(record);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to save user to localStorage:', err);
        return false;
      }
    },

    /**
     * Get currently active session from qb_current_user
     */
    getCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return safeJSONParse(raw, null);
      } catch (err) {
        console.error('[QuickBite Storage] Failed to read current session:', err);
        return null;
      }
    },

    /**
     * Store active session.
     * SECURITY RULE: Never stores password in the session object.
     */
    setCurrentUser(userData) {
      try {
        if (!userData) return false;
        const sessionPayload = {
          name: (userData.name || '').trim(),
          email: (userData.email || '').trim().toLowerCase(),
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionPayload));
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to set current session:', err);
        return false;
      }
    },

    /**
     * Clear active session upon logout.
     * STRICT RULE: Deletes ONLY qb_current_user. Preserves qb_users, cart, orders, etc.
     */
    clearCurrentUser() {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to clear session:', err);
        return false;
      }
    }
  };

  // Expose to global window object
  window.QuickBiteStorage = QuickBiteStorage;
})();


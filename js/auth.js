/**
 * QuickBite - Authentication Module (js/auth.js)
 * Assigned Module: RRN 1246 - Registration and Login
 * 
 * Notice:
 * This is a college mini-project frontend implementation.
 * User accounts and authentication sessions are simulated using browser LocalStorage.
 * No sensitive or real passwords should be entered.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegisterModule();
  initLoginModule();
  initPasswordToggles();
  initGlobalAuthNavbar();
});

/**
 * Fallback storage helper in case js/storage.js is loaded in an unexpected order
 */
const StorageContract = {
  USERS_KEY: 'qb_users',
  SESSION_KEY: 'qb_current_user',

  getUsers() {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.getUsers === 'function') {
      return window.QuickBiteStorage.getUsers();
    }
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from LocalStorage:', e);
      return [];
    }
  },

  findUserByEmail(email) {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.findUserByEmail === 'function') {
      return window.QuickBiteStorage.findUserByEmail(email);
    }
    const normalized = (email || '').trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => (u.email || '').toLowerCase() === normalized) || null;
  },

  saveUser(newUser) {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.saveUser === 'function') {
      return window.QuickBiteStorage.saveUser(newUser);
    }
    try {
      const users = this.getUsers();
      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving user to LocalStorage:', e);
      return false;
    }
  },

  getCurrentUser() {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.getCurrentUser === 'function') {
      return window.QuickBiteStorage.getCurrentUser();
    }
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      console.error('Error reading session from LocalStorage:', e);
      return null;
    }
  },

  setCurrentUser(userData) {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.setCurrentUser === 'function') {
      return window.QuickBiteStorage.setCurrentUser(userData);
    }
    try {
      // Security measure: Never store password in the session object
      const sessionData = {
        name: userData.name || '',
        email: (userData.email || '').toLowerCase(),
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return true;
    } catch (e) {
      console.error('Error saving session to LocalStorage:', e);
      return false;
    }
  },

  clearCurrentUser() {
    if (window.QuickBiteStorage && typeof window.QuickBiteStorage.clearCurrentUser === 'function') {
      return window.QuickBiteStorage.clearCurrentUser();
    }
    try {
      localStorage.removeItem(this.SESSION_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing session from LocalStorage:', e);
      return false;
    }
  }
};

/**
 * -----------------------------------------------------------------------------
 * REGISTRATION MODULE (register.html)
 * -----------------------------------------------------------------------------
 */
function initRegisterModule() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const submitBtn = document.getElementById('btn-register-submit');
  const alertBox = document.getElementById('auth-alert');

  // Input listeners for real-time validation clearing
  if (nameInput) nameInput.addEventListener('input', () => clearFieldError('name-error'));
  if (emailInput) emailInput.addEventListener('input', () => clearFieldError('email-error'));
  if (passwordInput) passwordInput.addEventListener('input', () => clearFieldError('password-error'));
  if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', () => clearFieldError('confirm-password-error'));

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBox);

    // 1. Gather and trim inputs
    const fullName = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

    let isValid = true;

    // 2. Validate Full Name
    if (!fullName) {
      showFieldError('name-error', 'Please enter your full name.');
      isValid = false;
    } else if (fullName.length < 2) {
      showFieldError('name-error', 'Name should be at least 2 characters long.');
      isValid = false;
    } else {
      clearFieldError('name-error');
    }

    // 3. Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError('email-error', 'Please enter your email address.');
      isValid = false;
    } else if (!emailPattern.test(email)) {
      showFieldError('email-error', 'Please enter a valid email address (e.g. name@example.com).');
      isValid = false;
    } else {
      clearFieldError('email-error');
    }

    // 4. Validate Password
    if (!password) {
      showFieldError('password-error', 'Please enter a password.');
      isValid = false;
    } else if (password.length < 8) {
      showFieldError('password-error', 'Password must be at least 8 characters long.');
      isValid = false;
    } else {
      clearFieldError('password-error');
    }

    // 5. Validate Password Confirmation
    if (!confirmPassword) {
      showFieldError('confirm-password-error', 'Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      showFieldError('confirm-password-error', 'Passwords do not match. Please re-check.');
      isValid = false;
    } else {
      clearFieldError('confirm-password-error');
    }

    if (!isValid) return;

    // 6. Check for duplicate email (case-insensitive)
    const existingUser = StorageContract.findUserByEmail(email);
    if (existingUser) {
      showAlert(alertBox, 'An account with this email is already registered. Please sign in.', 'error');
      showFieldError('email-error', 'This email address is already registered.');
      return;
    }

    // 7. Prevent repeated submission while processing
    setButtonLoading(submitBtn, true, 'Creating Account...');

    // 8. Save user record
    const newUser = {
      name: fullName,
      email: email.toLowerCase(),
      password: password, // Simulated academic storage only
      createdAt: new Date().toISOString()
    };

    const saved = StorageContract.saveUser(newUser);

    if (saved) {
      showAlert(alertBox, '🎉 Registration successful! Redirecting you to the login page...', 'success');
      registerForm.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      setButtonLoading(submitBtn, false, 'Create Account');
      showAlert(alertBox, 'Failed to save account to LocalStorage. Please check browser permissions.', 'error');
    }
  });
}

/**
 * -----------------------------------------------------------------------------
 * LOGIN MODULE (login.html)
 * -----------------------------------------------------------------------------
 */
function initLoginModule() {
  const loginForm = document.getElementById('login-form');
  const fillDemoBtn = document.getElementById('btn-fill-demo');

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('btn-login-submit');
  const alertBox = document.getElementById('auth-alert');

  // Input listeners for real-time validation clearing
  if (emailInput) emailInput.addEventListener('input', () => clearFieldError('email-error'));
  if (passwordInput) passwordInput.addEventListener('input', () => clearFieldError('password-error'));

  // Quick demo credentials pre-fill
  if (fillDemoBtn && emailInput && passwordInput) {
    fillDemoBtn.addEventListener('click', () => {
      emailInput.value = 'demo@quickbite.com';
      passwordInput.value = 'Password123';
      clearFieldError('email-error');
      clearFieldError('password-error');
      hideAlert(alertBox);
      showAlert(alertBox, 'Demo credentials filled! Click "Sign In" to proceed.', 'info');
    });
  }

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBox);

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    let isValid = true;

    // Validate inputs
    if (!email) {
      showFieldError('email-error', 'Please enter your registered email address.');
      isValid = false;
    } else {
      clearFieldError('email-error');
    }

    if (!password) {
      showFieldError('password-error', 'Please enter your password.');
      isValid = false;
    } else {
      clearFieldError('password-error');
    }

    if (!isValid) return;

    // Prevent repeated submission
    setButtonLoading(submitBtn, true, 'Signing In...');

    // Look up user (case-insensitive email matching)
    const user = StorageContract.findUserByEmail(email);

    if (!user || user.password !== password) {
      setButtonLoading(submitBtn, false, 'Sign In');
      showAlert(alertBox, 'Invalid email or password. Please verify your credentials or register a new account.', 'error');
      return;
    }

    // Credentials valid: Create session in qb_current_user (NO PASSWORD IN SESSION)
    StorageContract.setCurrentUser(user);

    showAlert(alertBox, `Welcome back, ${user.name}! Redirecting to home...`, 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

/**
 * -----------------------------------------------------------------------------
 * PASSWORD VISIBILITY TOGGLE (For both Login and Registration)
 * -----------------------------------------------------------------------------
 */
function initPasswordToggles() {
  setupToggle('toggle-reg-password', 'register-password');
  setupToggle('toggle-reg-confirm', 'register-confirm-password');
  setupToggle('toggle-login-password', 'login-password');

  function setupToggle(buttonId, inputId) {
    const btn = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      btn.textContent = isPassword ? '🙈' : '👁️';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }
}

/**
 * -----------------------------------------------------------------------------
 * NAVBAR AUTH STATE & LOGOUT HANDLING
 * -----------------------------------------------------------------------------
 */
function initGlobalAuthNavbar() {
  const currentUser = StorageContract.getCurrentUser();
  const navContainer = document.querySelector('.nav-links');

  // Handle logout buttons anywhere on the page
  document.querySelectorAll('[data-action="logout"], #btn-logout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      StorageContract.clearCurrentUser();
      window.location.href = 'login.html';
    });
  });

  if (!navContainer) return;

  // If user is logged in, adjust navbar options gracefully
  if (currentUser && currentUser.name) {
    const loginLink = navContainer.querySelector('a[href="login.html"]');
    const registerLink = navContainer.querySelector('a[href="register.html"]');

    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';

    // Check if user badge already exists
    if (!navContainer.querySelector('.user-nav-badge')) {
      const userBadge = document.createElement('span');
      userBadge.className = 'user-nav-badge';
      userBadge.textContent = `👋 ${currentUser.name}`;

      const logoutBtn = document.createElement('a');
      logoutBtn.href = '#';
      logoutBtn.className = 'nav-link btn-logout-link';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        StorageContract.clearCurrentUser();
        window.location.href = 'login.html';
      });

      navContainer.appendChild(userBadge);
      navContainer.appendChild(logoutBtn);
    }
  }
}

/**
 * -----------------------------------------------------------------------------
 * UI HELPERS: Errors, Alerts, and Loading states
 * -----------------------------------------------------------------------------
 */
function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function clearFieldError(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function showAlert(alertBox, message, type = 'info') {
  if (!alertBox) return;
  alertBox.className = `auth-alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

function hideAlert(alertBox) {
  if (!alertBox) return;
  alertBox.textContent = '';
  alertBox.style.display = 'none';
}

function setButtonLoading(button, isLoading, normalText) {
  if (!button) return;
  const btnText = button.querySelector('.btn-text');
  const spinner = button.querySelector('.btn-spinner');

  button.disabled = isLoading;
  if (isLoading) {
    button.classList.add('loading');
    if (spinner) spinner.style.display = 'inline-block';
    if (btnText) btnText.textContent = normalText;
  } else {
    button.classList.remove('loading');
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = normalText;
  }
}


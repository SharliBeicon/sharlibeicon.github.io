/**
 * Centralized theme management utilities for consistent theme handling across the application.
 * Provides functions for theme detection, storage, and manipulation.
 */

export type Theme = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'terminal-theme';

/**
 * Get the stored theme preference from localStorage
 */
export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
}

/**
 * Store theme preference in localStorage
 */
export function storeTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  if (theme === 'system') {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

/**
 * Get the system's preferred color scheme
 */
export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the currently applied theme from the document
 */
export function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark';
  return (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || getSystemTheme();
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(): 'dark' | 'light' {
  const stored = getStoredTheme();
  if (stored && stored !== 'system') {
    return stored;
  }
  return getSystemTheme();
}

/**
 * Apply a theme to the document
 */
export function applyTheme(theme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  const effectiveTheme = getEffectiveTheme();
  applyTheme(effectiveTheme);
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme(): 'dark' | 'light' {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  storeTheme(newTheme);
  applyTheme(newTheme);
  
  return newTheme;
}

/**
 * Set a specific theme
 */
export function setTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    storeTheme('system');
    const systemTheme = getSystemTheme();
    applyTheme(systemTheme);
    return systemTheme;
  } else {
    storeTheme(theme);
    applyTheme(theme);
    return theme;
  }
}

/**
 * Update theme toggle icon based on current theme
 */
export function updateThemeIcon(theme: 'dark' | 'light'): void {
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  if (!sunIcon || !moonIcon) return;
  
  if (theme === 'dark') {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

/**
 * Set up theme toggle functionality for a button
 */
export function setupThemeToggle(buttonSelector: string = '#theme-toggle'): void {
  const themeToggle = document.querySelector(buttonSelector);
  if (!themeToggle) return;
  
  // Initialize icon
  updateThemeIcon(getCurrentTheme());
  
  // Add click handler
  themeToggle.addEventListener('click', () => {
    const newTheme = toggleTheme();
    updateThemeIcon(newTheme);
  });
}

/**
 * Listen for system theme changes and update if following system preference
 */
export function setupSystemThemeListener(): void {
  if (typeof window === 'undefined') return;
  
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const storedTheme = getStoredTheme();
      if (!storedTheme) {
        // Only follow system preference if user hasn't manually set a theme
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
        updateThemeIcon(newTheme);
      }
    });
}
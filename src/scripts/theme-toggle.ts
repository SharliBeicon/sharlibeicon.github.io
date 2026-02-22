type Theme = "light" | "dark";

const storageKey = "theme";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme: Theme, button: HTMLButtonElement | null) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  if (button) {
    button.dataset.theme = theme;
  }

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage unavailable; ignore.
  }
};

const initializeTheme = (button: HTMLButtonElement | null) => {
  const stored = readStoredTheme();
  const initial = stored ?? (prefersDark.matches ? "dark" : "light");
  applyTheme(initial, button);
};

const toggleTheme = (button: HTMLButtonElement | null) => {
  const current =
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark", button);
};

export const initThemeToggle = () => {
  const button = document.getElementById("themeToggle");
  const themeButton = button instanceof HTMLButtonElement ? button : null;

  if (!themeButton) {
    return;
  }

  if (!themeButton.dataset.bound) {
    themeButton.dataset.bound = "true";
    themeButton.addEventListener("click", () => toggleTheme(themeButton));
  }

  initializeTheme(themeButton);

  prefersDark.addEventListener("change", (event) => {
    if (readStoredTheme()) {
      return;
    }

    applyTheme(event.matches ? "dark" : "light", themeButton);
  });
};

initThemeToggle();
document.addEventListener("astro:page-load", initThemeToggle);

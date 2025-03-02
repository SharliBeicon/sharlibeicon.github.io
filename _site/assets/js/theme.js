const getCurrentTheme = () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) return storedTheme;
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const loadCodeTheme = (theme) => {
  const existingLink = document.getElementById("code-stylesheet");
  if (existingLink) {
    existingLink.remove();
  }

  const prism_theme = theme === "dark" ? "prism-tomorrow" : "prism-default";

  const link = document.createElement("link");
  link.id = "code-stylesheet";
  link.rel = "stylesheet";
  link.href = `/assets/css/vendor/${prism_theme}.css`;
  document.head.appendChild(link);
};

const updateTheme = (newTheme) => {
  document.documentElement.classList.toggle("dark", newTheme === "dark");
  document.documentElement.classList.toggle("light", newTheme === "light");

  loadCodeTheme(newTheme);

  localStorage.setItem("theme", newTheme);
};

const updateButtonState = (button) => {
  if (getCurrentTheme() === "dark") {
    button.classList.add("theme-toggle--toggled");
  } else {
    button.classList.remove("theme-toggle--toggled");
  }
};

const initThemeToggle = () => {
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) {
    console.error("Theme toggle button not found!");
    return;
  }

  updateButtonState(themeToggle);
  updateTheme(getCurrentTheme());

  themeToggle.addEventListener("click", () => {
    const newTheme = getCurrentTheme() === "light" ? "dark" : "light";
    updateTheme(newTheme);

    updateButtonState(themeToggle);

    document.body.dispatchEvent(new CustomEvent("theme-toggle"));
  });
};

if (document.readyState !== "loading") {
  initThemeToggle();
} else {
  document.addEventListener("DOMContentLoaded", initThemeToggle);
}

export { initThemeToggle };

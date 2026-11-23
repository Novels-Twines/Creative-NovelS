const STORAGE_KEY = "novels-twines-theme";

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme, button) {
  const selected = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = selected;
  document.documentElement.style.colorScheme = selected;
  if (button) {
    const isDark = selected === "dark";
    button.textContent = isDark ? "☼ Light" : "☾ Dark";
    button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    button.setAttribute("aria-pressed", String(!isDark));
  }
  try {
    localStorage.setItem(STORAGE_KEY, selected);
  } catch {
    // Theme still works for this page view when storage is unavailable.
  }
}

export function initTheme() {
  const button = document.querySelector("#themeToggle");
  const saved = readSavedTheme();
  const preferred = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(saved || preferred, button);
  button?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next, button);
  });
}

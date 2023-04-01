export function getCssVariable(name) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

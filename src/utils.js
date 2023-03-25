export function getCssVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
}

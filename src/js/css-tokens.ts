type Tokens = 'token-background-color';

export function getCssVariable(name: Tokens) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
}

type ThemeCreatorCallback = () => void;
type SetThemeCallback = (themeName: string) => void;

let openCallback: ThemeCreatorCallback | null = null;
let setThemeCallback: SetThemeCallback | null = null;

export function registerThemeCreatorCallback(callback: ThemeCreatorCallback) {
  openCallback = callback;
}

export function unregisterThemeCreatorCallback() {
  openCallback = null;
}

export function registerSetThemeCallback(callback: SetThemeCallback) {
  setThemeCallback = callback;
}

export function unregisterSetThemeCallback() {
  setThemeCallback = null;
}

export function triggerThemeCreator(): boolean {
  if (openCallback) {
    openCallback();
    return true;
  }
  return false;
}

export function triggerSetTheme(themeName: string): boolean {
  if (setThemeCallback) {
    setThemeCallback(themeName);
    return true;
  }
  return false;
}

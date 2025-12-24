import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { registerThemeCreatorCallback, unregisterThemeCreatorCallback } from '../utils/themeCreatorEvent';

interface ThemeCreatorContextType {
  isOpen: boolean;
  openThemeCreator: () => void;
  closeThemeCreator: () => void;
}

const ThemeCreatorContext = createContext<ThemeCreatorContextType | null>(null);

export function ThemeCreatorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openThemeCreator = useCallback(() => setIsOpen(true), []);
  const closeThemeCreator = useCallback(() => setIsOpen(false), []);

  // Register the callback so commands can trigger the theme creator
  useEffect(() => {
    registerThemeCreatorCallback(openThemeCreator);
    return () => unregisterThemeCreatorCallback();
  }, [openThemeCreator]);

  return (
    <ThemeCreatorContext.Provider value={{ isOpen, openThemeCreator, closeThemeCreator }}>
      {children}
    </ThemeCreatorContext.Provider>
  );
}

export function useThemeCreator() {
  const context = useContext(ThemeCreatorContext);
  if (!context) {
    throw new Error('useThemeCreator must be used within ThemeCreatorProvider');
  }
  return context;
}

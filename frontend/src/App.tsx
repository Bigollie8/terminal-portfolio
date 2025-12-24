import { useState, useCallback } from 'react';
import { Terminal } from './components/Terminal';
import { BootSequence } from './components/BootSequence';
import { ThemeCreator } from './components/ThemeCreator';
import { ThemeCreatorProvider } from './context/ThemeCreatorContext';
import './index.css';

/**
 * Custom welcome message for the terminal
 */
const welcomeMessage = [
  '',
  '  ===============================================',
  '  Welcome to the Terminal Portfolio!',
  '  ===============================================',
  '',
  "  Type 'help' to see available commands.",
  "  Type 'whoami' to learn about me.",
  "  Type 'ls' to browse my projects.",
  '',
  '  Pro tips:',
  '  - Use Arrow Up/Down to navigate command history',
  '  - Use Ctrl+L to clear the screen',
  '  - Use Ctrl+C to cancel current input',
  '',
];

/**
 * App content with theme creator access
 */
function AppContent() {
  const [isBooting, setIsBooting] = useState(true);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  if (isBooting) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <>
      <Terminal welcomeMessage={welcomeMessage} showScanlines={true} />
      <ThemeCreator />
    </>
  );
}

/**
 * Main App component
 */
function App() {
  return (
    <ThemeCreatorProvider>
      <AppContent />
    </ThemeCreatorProvider>
  );
}

export default App;

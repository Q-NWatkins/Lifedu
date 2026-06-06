import { PlayerProgressProvider } from './context/PlayerProgressContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import PlatformBackground from './components/Platform/PlatformBackground.jsx';
import { MainDashboard } from './components/Hub/index.js';

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProgressProvider>
        <PlatformBackground>
          <MainDashboard />
        </PlatformBackground>
      </PlayerProgressProvider>
    </ThemeProvider>
  );
}

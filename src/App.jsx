import { useEffect } from 'react';
import { PlayerProgressProvider } from './context/PlayerProgressContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AudioProvider, useGameAudio } from './context/AudioContext.jsx';
import PlatformBackground from './components/Platform/PlatformBackground.jsx';
import { MainDashboard } from './components/Hub/index.js';
import { LoginForm } from './components/Auth/index.js';

/**
 * Gate the whole app behind authentication. Unauthenticated visitors only ever
 * see the login screen; the dashboard tree isn't even mounted until a valid
 * frozen session exists.
 */
function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();
  const { switchTrack } = useGameAudio();

  // Individual screens select their own track; here we just silence music on
  // the login screen / logout.
  useEffect(() => {
    if (!isAuthenticated) switchTrack(null);
  }, [isAuthenticated, switchTrack]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return <MainDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <PlayerProgressProvider>
            <PlatformBackground>
              <AuthenticatedApp />
            </PlatformBackground>
          </PlayerProgressProvider>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

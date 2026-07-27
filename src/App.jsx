import { useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { PlayerProgressProvider } from './context/PlayerProgressContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AudioProvider, useGameAudio } from './context/AudioContext.jsx';
import { AdminDevProvider } from './context/AdminDevContext.jsx';
import PlatformBackground from './components/Platform/PlatformBackground.jsx';
import { MainDashboard } from './components/Hub/index.js';
import AdminToolbar from './components/Admin/AdminToolbar.jsx';

/**
 * Gate the whole app behind Clerk authentication. Unauthenticated visitors only
 * ever see Clerk's <SignIn/>; the dashboard tree isn't mounted until Clerk
 * reports a signed-in session.
 */
function AuthenticatedApp() {
  const { isLoaded, isAuthenticated } = useAuth();
  const { switchTrack } = useGameAudio();

  // Individual screens select their own track; here we just silence music on
  // the login screen / logout.
  useEffect(() => {
    if (!isAuthenticated) switchTrack(null);
  }, [isAuthenticated, switchTrack]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-sm font-black uppercase tracking-widest text-white/70">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <SignIn routing="hash" />
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
              <AdminDevProvider>
                <AuthenticatedApp />
                {/* Admin-only floating dev toolbar — self-gates, persists across all views. */}
                <AdminToolbar />
              </AdminDevProvider>
            </PlatformBackground>
          </PlayerProgressProvider>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
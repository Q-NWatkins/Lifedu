import { PlayerProgressProvider } from './context/PlayerProgressContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
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
        <PlayerProgressProvider>
          <PlatformBackground>
            <AuthenticatedApp />
          </PlatformBackground>
        </PlayerProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

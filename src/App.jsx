import { PlayerProgressProvider } from './context/PlayerProgressContext.jsx';
import { MainDashboard } from './components/Hub/index.js';

export default function App() {
  return (
    <PlayerProgressProvider>
      <MainDashboard />
    </PlayerProgressProvider>
  );
}

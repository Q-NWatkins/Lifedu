import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminGuard, AdminPanel } from '../Auth/index.js';
import { neuBtn } from '../../styles/neubrutalism.js';
import TiltedTitle from '../common/TiltedTitle.jsx';
import BottomNav from './BottomNav.jsx';
import MyBackpack from './MyBackpack.jsx';
import PowerStats from './PowerStats.jsx';
import QuestMap from './QuestMap.jsx';

export default function MainDashboard() {
  const { themeConfig } = useTheme();
  const { gems, stepCards } = usePlayerProgress();
  const { session, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('quest');
  const [questRealmId, setQuestRealmId] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'quest') setQuestRealmId(null);
  };

  const handleGoToRealm = (realmId) => {
    setQuestRealmId(realmId);
    setActiveTab('quest');
  };

  return (
    <>
      <header className="border-b-4 border-black bg-yellow-300/95 px-4 py-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          {/* User session controls */}
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1 rounded-full border-4 border-black bg-white px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title={`Signed in as ${session.username}`}
            >
              {isAdmin ? '🛡️' : '👤'} {session.username}
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`${neuBtn} bg-red-400 px-3 py-1 text-xs text-white hover:bg-red-300`}
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className={`${neuBtn} bg-white px-3 py-1 text-xs text-black hover:bg-stone-100`}
            >
              Log out
            </button>
          </div>

          <div className="hidden text-center sm:block">
            <TiltedTitle as="h1" className="text-lg font-black uppercase tracking-wide text-cyan-50 sm:text-xl">
              LearnQuest
            </TiltedTitle>
            <p className="mt-1 text-xs font-bold text-black/60">Your adventure in learning!</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            {stepCards > 0 && (
              <span
                className="flex items-center gap-1 rounded-full border-4 border-black bg-white px-3 py-1 text-sm font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                title="Bonus step cards — added to your energy when you start a quest"
              >
                🎴 {stepCards}
              </span>
            )}
            <span
              className="flex items-center gap-1 rounded-full border-4 border-black bg-white px-3 py-1 text-sm font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Gems — earn from the Daily Wheel & replaying quests"
            >
              💎 {gems}
            </span>
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-4xl px-4 pt-6 pb-32 ${themeConfig.text_main}`}>
        {activeTab === 'quest' && (
          <QuestMap key={questRealmId ?? 'realms'} initialRealmId={questRealmId} />
        )}
        {activeTab === 'stats' && <PowerStats onGoToRealm={handleGoToRealm} />}
        {activeTab === 'backpack' && <MyBackpack />}
        {activeTab === 'admin' && (
          <AdminGuard onLeave={() => setActiveTab('quest')}>
            <AdminPanel />
          </AdminGuard>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

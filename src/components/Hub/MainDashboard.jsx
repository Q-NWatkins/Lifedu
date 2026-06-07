import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import BottomNav from './BottomNav.jsx';
import MyBackpack from './MyBackpack.jsx';
import PowerStats from './PowerStats.jsx';
import QuestMap from './QuestMap.jsx';

export default function MainDashboard() {
  const { themeConfig } = useTheme();
  const { gems, stepCards } = usePlayerProgress();
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
          <div className="w-24" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-xl font-black text-black sm:text-2xl">LearnQuest</h1>
            <p className="text-xs font-bold text-black/60">Your adventure in learning!</p>
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

      <main className={`mx-auto max-w-4xl px-4 pt-6 pb-32 ${themeConfig.contrastText}`}>
        {activeTab === 'quest' && (
          <QuestMap key={questRealmId ?? 'realms'} initialRealmId={questRealmId} />
        )}
        {activeTab === 'stats' && <PowerStats onGoToRealm={handleGoToRealm} />}
        {activeTab === 'backpack' && <MyBackpack />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

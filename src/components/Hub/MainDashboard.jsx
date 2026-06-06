import { useState } from 'react';
import BottomNav from './BottomNav.jsx';
import MyBackpack from './MyBackpack.jsx';
import PowerStats from './PowerStats.jsx';
import QuestMap from './QuestMap.jsx';

export default function MainDashboard() {
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
    <div className="min-h-screen bg-lime-300">
      <header className="border-b-4 border-black bg-yellow-300 px-4 py-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-xl font-black text-black sm:text-2xl">LearnQuest</h1>
          <p className="text-xs font-bold text-black/60">Your adventure in learning!</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6 pb-32">
        {activeTab === 'quest' && (
          <QuestMap
            key={questRealmId ?? 'realms'}
            initialRealmId={questRealmId}
          />
        )}
        {activeTab === 'stats' && <PowerStats onGoToRealm={handleGoToRealm} />}
        {activeTab === 'backpack' && <MyBackpack />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

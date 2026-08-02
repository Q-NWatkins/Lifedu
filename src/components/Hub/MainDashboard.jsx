import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGameAudio } from '../../context/AudioContext.jsx';
import { AdminGuard, AdminPanel } from '../Auth/index.js';
import { TeacherDashboard } from '../Teacher/index.js';
import { isSuperAdmin, isTeacher } from '../../utils/roles.js';
import { neuBtn } from '../../styles/neubrutalism.js';
import TiltedTitle from '../common/TiltedTitle.jsx';
import BottomNav from './BottomNav.jsx';
import MyBackpack from './MyBackpack.jsx';
import PowerStats from './PowerStats.jsx';
import QuestMap from './QuestMap.jsx';

export default function MainDashboard() {
  const { themeConfig } = useTheme();
  const { gems, stepCards } = usePlayerProgress();
  const { session, logout } = useAuth();
  const { user } = useUser();
  const { switchTrack } = useGameAudio();
  const [activeTab, setActiveTab] = useState('quest');
  const [questRealmId, setQuestRealmId] = useState(null);

  // Role-based access. super_admin → developer tools; teacher → Teacher Portal.
  const superAdmin = isSuperAdmin(user);
  const teacher = isTeacher(user); // true for teachers AND super_admins

  // Tab-driven BGM. The Quest tab is left to QuestMap, which distinguishes the
  // realm picker (hub) from an open realm map (gameboard).
  useEffect(() => {
    if (activeTab === 'backpack') switchTrack('backpack');
    else if (activeTab === 'stats' || activeTab === 'admin' || activeTab === 'teacher') {
      switchTrack('hub');
    }
  }, [activeTab, switchTrack]);

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
              {superAdmin ? '🛡️' : teacher ? '🎓' : '👤'} {session.username}
            </span>
            {/* Teacher Portal — visible to teachers (and super_admins). */}
            {teacher && (
              <button
                type="button"
                onClick={() => setActiveTab('teacher')}
                className={`${neuBtn} bg-cyan-400 px-3 py-1 text-xs font-black uppercase text-cyan-950 hover:bg-cyan-300`}
              >
                Teacher Portal
              </button>
            )}
            {/* Developer tools — super_admin ONLY (never teachers). */}
            {superAdmin && (
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
        {activeTab === 'teacher' &&
          (teacher ? (
            <TeacherDashboard onExit={() => setActiveTab('quest')} />
          ) : (
            <p className="text-center text-sm font-black opacity-70">
              Teacher access required.
            </p>
          ))}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

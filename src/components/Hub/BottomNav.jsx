import { neuBtn } from '../../styles/neubrutalism.js';

const TABS = [
  { id: 'quest', label: 'Quest Map', emoji: '🗺️' },
  { id: 'stats', label: 'Power Stats', emoji: '📊' },
  { id: 'backpack', label: 'My Backpack', emoji: '🎒' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 border-t-4 border-black bg-yellow-300 px-3 py-3 shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.15)]"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`
                neu-btn flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center
                ${isActive ? 'bg-white text-black' : 'bg-lime-200 text-black hover:bg-lime-100'}
              `}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {tab.emoji}
              </span>
              <span className="text-[0.65rem] font-black leading-tight sm:text-xs">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

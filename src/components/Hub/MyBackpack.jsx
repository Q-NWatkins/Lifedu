import { useEffect, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { PLATFORM_THEMES, useTheme } from '../../context/ThemeContext.jsx';
import { getItemEmoji } from '../../systems/lootSystem.js';
import { neuBtn, neuCard, neuPanel } from '../../styles/neubrutalism.js';
import ToggleSwitch from './ToggleSwitch.jsx';

const SETTINGS_KEY = 'wit-backpack-settings';

const DEFAULT_SETTINGS = {
  soundEffects: true,
  dailyReminders: true,
  progressReports: false,
  emailUpdates: false,
};

function AccessorySlot({ label, item }) {
  const filled = Boolean(item);

  return (
    <div
      className={`
        flex flex-col items-center justify-center rounded-xl border-4 border-dashed border-black
        px-3 py-4 text-center
        ${filled ? 'bg-yellow-200' : 'bg-stone-100'}
      `}
    >
      <span className="text-2xl">{filled ? getItemEmoji(item) : '➕'}</span>
      <span className="mt-1 text-[10px] font-black uppercase text-black/60">{label}</span>
      {filled && (
        <span className="mt-1 line-clamp-2 text-[9px] font-bold text-black">{item.name}</span>
      )}
    </div>
  );
}

export default function MyBackpack() {
  const { badges, inventory, equipped, equipItem } = usePlayerProgress();
  const { activeTheme, setActiveTheme } = useTheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {
      // ignore
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-black text-black sm:text-3xl">My Backpack</h1>
        <p className="mt-1 text-sm font-bold text-black/60">
          Customize your hero and manage settings!
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — Avatar & accessories */}
        <div className={`${neuCard} bg-lime-100 p-5`}>
          <h2 className="text-lg font-black text-black">My Hero</h2>

          <div className="mt-4 flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-2xl border-4 border-black bg-sky-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {equipped.hat && (
                <span className="absolute -top-4 text-3xl">{getItemEmoji(equipped.hat)}</span>
              )}
              <span className="text-6xl" aria-hidden="true">
                ♟️
              </span>
              {equipped.pet && (
                <span className="absolute -right-3 -bottom-2 text-2xl">{getItemEmoji(equipped.pet)}</span>
              )}
              <span className="absolute -bottom-2 rounded-full border-4 border-black bg-yellow-300 px-3 py-0.5 text-xs font-black">
                Lv. 1
              </span>
            </div>
            <p className="mt-3 text-sm font-black text-black">Adventure Pawn</p>
            {equipped.clothing && (
              <p className="text-xs font-bold text-black/70">Wearing: {equipped.clothing.name}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <AccessorySlot label="Hat" item={equipped.hat} />
            <AccessorySlot label="Pet" item={equipped.pet} />
            <AccessorySlot label="Badge" item={equipped.badge} />
          </div>

          {/* Inventory grid */}
          <div className="mt-6">
            <h3 className="text-sm font-black text-black">
              Inventory ({inventory.length} items)
            </h3>
            {inventory.length === 0 ? (
              <p className={`${neuPanel} mt-3 bg-white p-4 text-center text-xs font-bold text-black/50`}>
                Open treasure chests on the Quest Map to find loot!
              </p>
            ) : (
              <ul className="mt-3 grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
                {inventory.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border-4 border-black bg-white px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-black">
                      <span>{getItemEmoji(item)}</span>
                      <span className="line-clamp-1">{item.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => equipItem(item)}
                      className={`${neuBtn} shrink-0 bg-lime-300 px-2 py-1 text-[10px] text-black`}
                    >
                      Equip
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {badges.length > 0 && (
            <p className={`${neuPanel} mt-4 bg-white p-3 text-center text-xs font-bold text-black`}>
              Course badges earned: {badges.length}
            </p>
          )}
        </div>

        {/* Right — Theme, controls & notifications */}
        <div className="space-y-4">
          <div className={`${neuCard} bg-amber-100 p-5`}>
            <h2 className="text-lg font-black text-black">Theme Selector</h2>
            <p className="mt-1 text-xs font-semibold text-black/60">
              Change the look of the entire platform instantly!
            </p>
            <div className="mt-4 grid gap-2">
              {Object.values(PLATFORM_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveTheme(theme.id)}
                  className={`
                    neu-btn px-4 py-3 text-left text-sm
                    ${activeTheme === theme.id ? 'bg-yellow-300 text-black' : 'bg-white text-black hover:bg-lime-50'}
                  `}
                >
                  <span className="font-black">{theme.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-black/60">
                    {theme.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${neuCard} bg-white p-5`}>
            <h2 className="text-lg font-black text-black">Parent Controls</h2>
            <p className="mt-1 text-xs font-semibold text-black/60">
              Grown-ups can manage account preferences here.
            </p>

            <div className="mt-4 space-y-3">
              <ToggleSwitch
                label="Sound Effects"
                description="Dice rolls, chest loot & victory sounds"
                checked={settings.soundEffects}
                onChange={(v) => updateSetting('soundEffects', v)}
              />
              <ToggleSwitch
                label="Daily Reminders"
                description="Nudge to complete one quest per day"
                checked={settings.dailyReminders}
                onChange={(v) => updateSetting('dailyReminders', v)}
              />
              <ToggleSwitch
                label="Weekly Progress Reports"
                description="Email summary of learning activity"
                checked={settings.progressReports}
                onChange={(v) => updateSetting('progressReports', v)}
              />
            </div>
          </div>

          <div className={`${neuCard} bg-violet-100 p-5`}>
            <h2 className="text-lg font-black text-black">Account & Notifications</h2>
            <div className="mt-4 space-y-3">
              <ToggleSwitch
                label="Product Updates"
                description="News about new realms and features"
                checked={settings.emailUpdates}
                onChange={(v) => updateSetting('emailUpdates', v)}
              />

              <div className={`${neuPanel} bg-white p-4`}>
                <p className="text-xs font-black uppercase text-black/50">Account Data</p>
                <p className="mt-1 text-sm font-bold text-black">Hero: Adventure Pawn</p>
                <p className="text-sm font-bold text-black">Loot items: {inventory.length}</p>
                <p className="text-sm font-bold text-black">Course badges: {badges.length}</p>
                <p className="mt-2 text-xs font-semibold text-black/50">
                  Progress and inventory are saved on this device automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

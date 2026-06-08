import { useEffect, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { PLATFORM_THEMES, useTheme } from '../../context/ThemeContext.jsx';
import { useAudio } from '../../context/AudioContext.jsx';
import { ItemSprite } from '../../assets/gameSprites.jsx';
import { getTitleById } from '../../systems/milestones.js';
import { RARITY_STYLES, getScrapValue } from '../../systems/lootSystem.js';
import { arcadeCard, btn3dSuccess, neuBtn, neuPanel } from '../../styles/neubrutalism.js';
import ToggleSwitch from './ToggleSwitch.jsx';
import TiltedTitle from '../common/TiltedTitle.jsx';

const SETTINGS_KEY = 'wit-backpack-settings';

const TABS = [
  { id: 'gear', label: 'Customize' },
  { id: 'trade', label: 'Trade Box' },
  { id: 'shop', label: 'Token Shop' },
];

/** Animated biomes purchasable with gems. */
const SHOP_BIOMES = [
  { id: 'deepsea', price: 400 },
  { id: 'candy', price: 500 },
];

/** One-time-use combat consumables purchasable with gems. */
const SHOP_CONSUMABLES = [
  { type: 'shield', label: 'Shield Block Charge', emoji: '🛡️', price: 50 },
  { type: 'heavyAttack', label: 'Heavy Attack Charge', emoji: '💥', price: 100 },
  { type: 'doubleDamage', label: 'Double Damage Charge', emoji: '⚡', price: 150 },
];

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
      {filled ? (
        <ItemSprite category={item.category} className="h-8 w-8" />
      ) : (
        <span className="text-2xl font-black text-black/40">+</span>
      )}
      <span className="mt-1 text-[10px] font-black uppercase text-black/60">{label}</span>
      {filled && (
        <span className="mt-1 line-clamp-2 text-[9px] font-bold text-black">{item.name}</span>
      )}
    </div>
  );
}

/* ── Trade Box: scrap unwanted cosmetics for gems ─────────────────────────── */
function TradeBox() {
  const { inventory, equipped, removeFromInventory, addGems } = usePlayerProgress();
  const [selected, setSelected] = useState(() => new Set());

  const isEquipped = (item) => equipped[item.category]?.id === item.id;
  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalValue = [...selected].reduce((sum, id) => {
    const item = inventory.find((i) => i.id === id);
    return sum + (item ? getScrapValue(item.rarity) : 0);
  }, 0);

  const scrapSelected = () => {
    selected.forEach((id) => {
      const item = inventory.find((i) => i.id === id);
      if (item && !isEquipped(item)) {
        removeFromInventory(id);
        addGems(getScrapValue(item.rarity));
      }
    });
    setSelected(new Set());
  };

  return (
    <div className={`${arcadeCard} p-5`}>
      <h2 className="text-lg font-black">Trade Box</h2>
      <p className="mt-1 text-xs font-semibold opacity-70">
        Select unwanted cosmetics or duplicates and scrap them for gems.
      </p>

      {inventory.length === 0 ? (
        <p className={`${neuPanel} mt-4 bg-white p-4 text-center text-xs font-bold text-black/50`}>
          No loot yet — open chests on the Quest Map to find cosmetics!
        </p>
      ) : (
        <ul className="mt-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {inventory.map((item) => {
            const equippedNow = isEquipped(item);
            const checked = selected.has(item.id);
            const styles = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.Common;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={equippedNow}
                  onClick={() => toggle(item.id)}
                  className={`
                    flex w-full items-center justify-between gap-2 rounded-xl border-4 px-3 py-2 text-left transition-all
                    ${checked ? 'border-cyan-400 ring-2 ring-cyan-300' : 'border-black'}
                    ${equippedNow ? 'cursor-not-allowed bg-stone-200 opacity-60' : 'bg-white hover:bg-lime-50'}
                  `}
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-black">
                    <ItemSprite category={item.category} className="h-6 w-6 shrink-0" />
                    <span className="min-w-0">
                      <span className="line-clamp-1">{item.name}</span>
                      <span className={`text-[10px] font-black uppercase ${styles.label}`}>
                        {item.rarity}
                        {equippedNow && ' · equipped'}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-black text-amber-600">
                    💎 {getScrapValue(item.rarity)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-black">
          Selected: <span className="text-amber-300">💎 {totalValue}</span>
        </span>
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={scrapSelected}
          className={`${btn3dSuccess} px-5 py-2.5 text-sm`}
        >
          Scrap for Gems
        </button>
      </div>
    </div>
  );
}

/* ── Arcade Token Shop: spend gems on biomes & consumables ────────────────── */
function TokenShop() {
  const { gems, spendGems, unlockTheme, isThemeUnlocked, addConsumable, consumableCharges } =
    usePlayerProgress();
  const { setActiveTheme } = useTheme();

  const buyBiome = (id, price) => {
    if (isThemeUnlocked(id)) {
      setActiveTheme(id);
      return;
    }
    if (spendGems(price)) {
      unlockTheme(id);
      setActiveTheme(id);
    }
  };

  const buyConsumable = (type, price) => {
    if (spendGems(price)) addConsumable(type, 1);
  };

  return (
    <div className="space-y-4">
      <div className={`${arcadeCard} flex items-center justify-between p-5`}>
        <div>
          <h2 className="text-lg font-black">Arcade Token Shop</h2>
          <p className="mt-1 text-xs font-semibold opacity-70">
            Spend gems on biomes & combat charges.
          </p>
        </div>
        <span className="rounded-full border-4 border-black bg-white px-3 py-1 text-sm font-black text-black">
          💎 {gems}
        </span>
      </div>

      {/* Premium animated biomes */}
      <div className={`${arcadeCard} p-5`}>
        <h3 className="text-sm font-black uppercase">Premium Animated Biomes</h3>
        <div className="mt-3 grid gap-2">
          {SHOP_BIOMES.map(({ id, price }) => {
            const theme = PLATFORM_THEMES[id];
            const owned = isThemeUnlocked(id);
            const affordable = gems >= price;
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-xl border-4 border-black bg-white p-3 text-black"
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg border-4 border-black"
                  style={{ background: theme.swatch }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">{theme.label}</span>
                  <span className="block text-[10px] font-bold text-black/60">{theme.description}</span>
                </span>
                <button
                  type="button"
                  disabled={!owned && !affordable}
                  onClick={() => buyBiome(id, price)}
                  className={`${neuBtn} shrink-0 px-3 py-2 text-xs ${
                    owned ? 'bg-lime-300 text-black' : affordable ? 'bg-yellow-300 text-black' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {owned ? 'Equip' : `💎 ${price}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* One-time combat charges */}
      <div className={`${arcadeCard} p-5`}>
        <h3 className="text-sm font-black uppercase">Combat Charges</h3>
        <div className="mt-3 grid gap-2">
          {SHOP_CONSUMABLES.map(({ type, label, emoji, price }) => {
            const affordable = gems >= price;
            return (
              <div
                key={type}
                className="flex items-center gap-3 rounded-xl border-4 border-black bg-white p-3 text-black"
              >
                <span className="text-2xl" aria-hidden="true">
                  {emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">{label}</span>
                  <span className="block text-[10px] font-bold text-black/60">
                    Owned: {consumableCharges[type] ?? 0}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => buyConsumable(type, price)}
                  className={`${neuBtn} shrink-0 px-3 py-2 text-xs ${
                    affordable ? 'bg-yellow-300 text-black' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  💎 {price}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyBackpack() {
  const { badges, inventory, equipped, equipItem, isThemeUnlocked, activeTitle } =
    usePlayerProgress();
  const activeTitleLabel = getTitleById(activeTitle);
  const { activeTheme, setActiveTheme, themeConfig } = useTheme();
  const { volume, setVolume } = useAudio();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState('gear');

  // Vibrant arcade panel — deep fill, neon border, inner glow, light ink.
  const cardCls = arcadeCard;

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
        <TiltedTitle as="h1" className="text-2xl font-black uppercase text-cyan-50 sm:text-3xl">
          My Backpack
        </TiltedTitle>
        <p className={`mt-2 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Customize your hero, trade loot, and shop for power-ups!
        </p>
      </header>

      {/* Sub-tab navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`${neuBtn} px-5 py-2 text-sm ${
              tab === t.id ? 'bg-yellow-300 text-black' : 'bg-white text-black hover:bg-lime-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'trade' && <TradeBox />}
      {tab === 'shop' && <TokenShop />}

      {tab === 'gear' && (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — Avatar & accessories */}
        <div className={`${cardCls} p-5`}>
          <h2 className="text-lg font-black">My Hero</h2>

          <div className="mt-4 flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-2xl border-4 border-black bg-sky-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {equipped.hat && (
                <ItemSprite category="hat" className="absolute -top-5 h-10 w-10" />
              )}
              <span className="text-6xl" aria-hidden="true">
                ♟️
              </span>
              {equipped.pet && (
                <ItemSprite category="pet" className="absolute -right-3 -bottom-2 h-9 w-9" />
              )}
              <span className="absolute -bottom-2 rounded-full border-4 border-black bg-yellow-300 px-3 py-0.5 text-xs font-black">
                Lv. 1
              </span>
            </div>
            <p className="mt-3 text-sm font-black">Adventure Pawn</p>
            {activeTitleLabel && (
              <p className="mt-1 rounded-full border-2 border-black bg-yellow-300 px-3 py-0.5 text-xs font-black text-black">
                ⭐ {activeTitleLabel}
              </p>
            )}
            {equipped.clothing && (
              <p className="text-xs font-bold opacity-70">Wearing: {equipped.clothing.name}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <AccessorySlot label="Hat" item={equipped.hat} />
            <AccessorySlot label="Pet" item={equipped.pet} />
            <AccessorySlot label="Badge" item={equipped.badge} />
          </div>

          {/* Inventory grid */}
          <div className="mt-6">
            <h3 className="text-sm font-black">
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
                      <ItemSprite category={item.category} className="h-6 w-6 shrink-0" />
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
          <div className={`${cardCls} p-5`}>
            <h2 className="text-lg font-black">Theme Selector</h2>
            <p className="mt-1 text-xs font-semibold opacity-70">
              Change the look of the platform — animated themes drop from rare loot!
            </p>
            <div className="mt-4 grid gap-2">
              {Object.values(PLATFORM_THEMES).map((theme) => {
                const unlocked = isThemeUnlocked(theme.id);
                const isActive = activeTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && setActiveTheme(theme.id)}
                    aria-pressed={isActive}
                    className={`
                      neu-btn flex items-center gap-3 px-4 py-3 text-left text-sm
                      ${
                        isActive
                          ? 'bg-yellow-300 text-black'
                          : unlocked
                            ? 'bg-white text-black hover:bg-lime-50'
                            : 'cursor-not-allowed bg-stone-200 text-stone-500'
                      }
                    `}
                  >
                    <span
                      className={`h-9 w-9 shrink-0 rounded-lg border-4 border-black ${unlocked ? '' : 'grayscale'}`}
                      style={{ background: theme.swatch }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-black">
                        {theme.label}
                        {isActive && (
                          <span className="rounded-full border-2 border-black bg-lime-300 px-2 py-0.5 text-[9px] uppercase">
                            Active
                          </span>
                        )}
                        {!unlocked && (
                          <span className="rounded-full border-2 border-black bg-stone-300 px-2 py-0.5 text-[9px] uppercase">
                            🔒 {theme.unlockRarity}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-black/60">
                        {unlocked
                          ? theme.description
                          : `Unlock by opening a ${theme.unlockRarity} reward chest!`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <h2 className="text-lg font-black">Music &amp; Sound</h2>
            <p className="mt-1 text-xs font-semibold opacity-70">
              Adventure & battle music cross-fade as you play.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                {volume === 0 ? '🔇' : '🔊'}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                aria-label="Background music volume"
                className="h-3 w-full cursor-pointer appearance-none rounded-full border-2 border-black bg-white accent-cyan-400"
              />
              <span className="w-10 shrink-0 text-right text-sm font-black">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <h2 className="text-lg font-black">Parent Controls</h2>
            <p className="mt-1 text-xs font-semibold opacity-70">
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

          <div className={`${cardCls} p-5`}>
            <h2 className="text-lg font-black">Account &amp; Notifications</h2>
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
      )}
    </div>
  );
}

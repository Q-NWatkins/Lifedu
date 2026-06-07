/**
 * Centralized 2D game sprite factory.
 *
 * Every entity is an inline, infinitely scalable SVG React component (Kenney-
 * style flat vector art) — no external network assets, no emoji glyphs. Each
 * accepts `className` (size via Tailwind h-/w-) and an accessible `title`.
 *
 * Registries + helpers at the bottom let renderers resolve a sprite by key
 * (player variant, boss subject, node type, inventory category).
 */

/* ── Player avatars ───────────────────────────────────────────────────────── */

export function AstronautSprite({ className = '', title = 'Astronaut hero' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="22" y="40" width="20" height="18" rx="8" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3" />
      <rect x="27" y="44" width="10" height="9" rx="3" fill="#38bdf8" />
      <circle cx="32" cy="26" r="19" fill="#f1f5f9" stroke="#0f172a" strokeWidth="3" />
      <path d="M19 26a13 11 0 0 1 26 0a13 11 0 0 1 -26 0Z" fill="#0ea5e9" stroke="#0f172a" strokeWidth="2.5" />
      <path d="M23 22c3-3 8-4 12-2" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="26" r="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
      <circle cx="50" cy="26" r="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
    </svg>
  );
}

export function WizardSprite({ className = '', title = 'Wizard hero' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M16 56c2-12 8-18 16-18s14 6 16 18Z" fill="#6d28d9" stroke="#0f172a" strokeWidth="3" />
      <circle cx="32" cy="30" r="9" fill="#fcd9b6" stroke="#0f172a" strokeWidth="2.5" />
      <path d="M32 8l11 18H21Z" fill="#7c3aed" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M21 26h22l-2 5H23Z" fill="#a78bfa" stroke="#0f172a" strokeWidth="2.5" />
      <path d="M32 12l1.6 3.4L37 17l-3.4 1.6L32 22l-1.6-3.4L27 17l3.4-1.6Z" fill="#fde047" />
      <circle cx="29" cy="30" r="1.6" fill="#0f172a" />
      <circle cx="35" cy="30" r="1.6" fill="#0f172a" />
    </svg>
  );
}

export function CyberNinjaSprite({ className = '', title = 'Cyber-ninja hero' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="20" y="40" width="24" height="18" rx="7" fill="#0f172a" stroke="#020617" strokeWidth="3" />
      <circle cx="32" cy="28" r="18" fill="#1e293b" stroke="#020617" strokeWidth="3" />
      <path d="M14 26h36l-3 7H17Z" fill="#22d3ee" stroke="#020617" strokeWidth="2" opacity="0.95" />
      <path d="M16 24c8-5 24-5 32 0" stroke="#0f172a" strokeWidth="3" fill="none" />
      <rect x="24" y="27" width="6" height="3.5" rx="1.5" fill="#22d3ee" />
      <rect x="34" y="27" width="6" height="3.5" rx="1.5" fill="#22d3ee" />
      <path d="M44 16l10-4-5 9Z" fill="#ef4444" stroke="#020617" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Subject bosses ───────────────────────────────────────────────────────── */

export function MagmaGolemSprite({ className = '', title = 'Magma Golem' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M12 50c0-18 6-30 20-30s20 12 20 30Z" fill="#3f3f46" stroke="#0f172a" strokeWidth="3" />
      <rect x="14" y="48" width="36" height="10" rx="4" fill="#27272a" stroke="#0f172a" strokeWidth="3" />
      <path d="M22 24l4 10-7 4M44 26l-5 9 7 3M30 40l3 8 4-7" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="30" r="3.2" fill="#fde047" />
      <circle cx="38" cy="30" r="3.2" fill="#fde047" />
      <path d="M24 39h16l-3 4H27Z" fill="#f97316" />
    </svg>
  );
}

export function NebulaMechSprite({ className = '', title = 'Nebula Mech' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="16" y="20" width="32" height="28" rx="8" fill="#312e81" stroke="#0f172a" strokeWidth="3" />
      <rect x="22" y="46" width="20" height="10" rx="4" fill="#1e1b4b" stroke="#0f172a" strokeWidth="3" />
      <circle cx="32" cy="33" r="7" fill="#a855f7" stroke="#0f172a" strokeWidth="2.5" />
      <circle cx="32" cy="33" r="2.5" fill="#f0abfc" />
      <rect x="22" y="26" width="7" height="5" rx="2" fill="#22d3ee" />
      <rect x="35" y="26" width="7" height="5" rx="2" fill="#22d3ee" />
      <path d="M32 10v9M24 14l3 6M40 14l-3 6" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="9" r="3" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />
    </svg>
  );
}

export function PrimalEntSprite({ className = '', title = 'Primal Ent' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="24" y="34" width="16" height="24" rx="6" fill="#92400e" stroke="#0f172a" strokeWidth="3" />
      <path d="M14 30c0-12 8-20 18-20s18 8 18 20c0 8-8 12-18 12s-18-4-18-12Z" fill="#16a34a" stroke="#0f172a" strokeWidth="3" />
      <path d="M10 40l8-4M54 40l-8-4M24 50l-8 4M40 50l8 4" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="30" r="3.4" fill="#fde047" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="38" cy="30" r="3.4" fill="#fde047" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M27 38c3 3 7 3 10 0" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ClockworkKnightSprite({ className = '', title = 'Clockwork Knight' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M18 46c0-16 6-26 14-26s14 10 14 26Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="3" />
      <rect x="20" y="44" width="24" height="12" rx="4" fill="#64748b" stroke="#0f172a" strokeWidth="3" />
      <rect x="24" y="28" width="16" height="6" rx="3" fill="#0f172a" />
      <rect x="26" y="29.5" width="5" height="3" rx="1.5" fill="#f59e0b" />
      <rect x="33" y="29.5" width="5" height="3" rx="1.5" fill="#f59e0b" />
      <g stroke="#0f172a" strokeWidth="2" fill="#fbbf24">
        <circle cx="32" cy="14" r="6" />
        <path d="M32 6v-3M32 22v3M24 14h-3M40 14h3M26 8l-2-2M38 8l2-2M26 20l-2 2M38 20l2 2" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="14" r="2" fill="#0f172a" stroke="none" />
      </g>
    </svg>
  );
}

/* ── Interactive map nodes ────────────────────────────────────────────────── */

export function TreasureChestSprite({ className = '', open = false, title }) {
  const label = title ?? (open ? 'Open treasure chest' : 'Locked treasure chest');
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={label}>
      <title>{label}</title>
      {open && <circle cx="32" cy="30" r="22" fill="#fde047" opacity="0.45" />}
      <rect x="12" y="30" width="40" height="22" rx="4" fill="#b45309" stroke="#0f172a" strokeWidth="3" />
      {open ? (
        <>
          <path d="M10 30c0-9 6-14 22-14s22 5 22 14Z" fill="#fcd34d" stroke="#0f172a" strokeWidth="3" transform="rotate(-18 12 30)" />
          <rect x="12" y="34" width="40" height="8" fill="#fde047" />
          <circle cx="22" cy="40" r="2.5" fill="#facc15" />
          <circle cx="32" cy="40" r="2.5" fill="#facc15" />
          <circle cx="42" cy="40" r="2.5" fill="#facc15" />
        </>
      ) : (
        <>
          <path d="M10 32c0-10 7-16 22-16s22 6 22 16Z" fill="#d97706" stroke="#0f172a" strokeWidth="3" />
          <rect x="10" y="30" width="44" height="6" rx="2" fill="#92400e" stroke="#0f172a" strokeWidth="2" />
          <rect x="28" y="33" width="8" height="11" rx="2" fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
          <circle cx="32" cy="37" r="1.8" fill="#0f172a" />
        </>
      )}
    </svg>
  );
}

export function StarSprite({ className = '', title = 'Star' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="32" cy="32" r="22" fill="#fde047" opacity="0.35" />
      <path
        d="M32 8l7 16 17 1.5-13 11 4 17-15-9-15 9 4-17-13-11 17-1.5Z"
        fill="#facc15"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HazardSpikeSprite({ className = '', title = 'Hazard spikes' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path
        d="M8 50l8-26 8 26M24 50l8-30 8 30M40 50l8-26 8 26"
        fill="#ef4444"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="6" y="48" width="52" height="8" rx="3" fill="#7f1d1d" stroke="#0f172a" strokeWidth="3" />
      <circle cx="16" cy="34" r="1.5" fill="#fff" />
      <circle cx="32" cy="30" r="1.5" fill="#fff" />
      <circle cx="48" cy="34" r="1.5" fill="#fff" />
    </svg>
  );
}

/** Monster node icon for boss/mini-boss/side-boss map nodes (color-tinted). */
const MONSTER_VARIANTS = {
  boss: { body: '#dc2626', dark: '#7f1d1d' },
  miniBoss: { body: '#f97316', dark: '#9a3412' },
  sideBoss: { body: '#a855f7', dark: '#6b21a8' },
};

export function MonsterNodeSprite({ className = '', variant = 'boss', title = 'Monster' }) {
  const c = MONSTER_VARIANTS[variant] ?? MONSTER_VARIANTS.boss;
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M14 18l6 8 6-8 6 8 6-8 6 8v18a18 14 0 0 1 -36 0Z" fill={c.body} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="25" cy="32" r="4.5" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <circle cx="39" cy="32" r="4.5" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <circle cx="25" cy="33" r="2" fill="#0f172a" />
      <circle cx="39" cy="33" r="2" fill="#0f172a" />
      <path d="M24 42l3 4 3-4 3 4 3-4" fill="none" stroke={c.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ForkSignSprite({ className = '', title = 'Path fork' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <rect x="29" y="30" width="6" height="26" rx="2" fill="#a16207" stroke="#0f172a" strokeWidth="2.5" />
      <path d="M8 16h22l5 6-5 6H8Z" fill="#22c55e" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M56 30H34l-5 6 5 6h22Z" fill="#a855f7" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Inventory item categories ────────────────────────────────────────────── */

export function ItemHatSprite({ className = '', title = 'Hat' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M20 36c-2-16 6-24 12-24s14 8 12 24Z" fill="#2563eb" stroke="#0f172a" strokeWidth="3" />
      <rect x="10" y="36" width="44" height="8" rx="4" fill="#1d4ed8" stroke="#0f172a" strokeWidth="3" />
      <rect x="24" y="30" width="16" height="6" rx="3" fill="#fbbf24" />
    </svg>
  );
}

export function ItemShirtSprite({ className = '', title = 'Clothing' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M22 14l-12 8 5 9 5-3v22h24V28l5 3 5-9-12-8-5 5h-5Z" fill="#10b981" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function ItemPetSprite({ className = '', title = 'Pet' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="32" cy="36" r="16" fill="#f472b6" stroke="#0f172a" strokeWidth="3" />
      <path d="M18 24l2-10 8 6M46 24l-2-10-8 6" fill="#f472b6" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="26" cy="34" r="2.5" fill="#0f172a" />
      <circle cx="38" cy="34" r="2.5" fill="#0f172a" />
      <path d="M28 42c2 2 6 2 8 0" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function ItemBadgeSprite({ className = '', title = 'Badge' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="32" cy="26" r="16" fill="#f59e0b" stroke="#0f172a" strokeWidth="3" />
      <path d="M24 38l-4 18 12-7 12 7-4-18Z" fill="#ef4444" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 18l3 6 6 .8-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-.8Z" fill="#fff7ed" stroke="#0f172a" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Registries & resolvers ───────────────────────────────────────────────── */

export const PLAYER_SPRITES = {
  astronaut: AstronautSprite,
  wizard: WizardSprite,
  ninja: CyberNinjaSprite,
};

const BOSS_SPRITES_BY_SUBJECT = {
  math: MagmaGolemSprite,
  science: NebulaMechSprite,
  reading: PrimalEntSprite,
  history: ClockworkKnightSprite,
};

const ITEM_SPRITES = {
  hat: ItemHatSprite,
  clothing: ItemShirtSprite,
  pet: ItemPetSprite,
  badge: ItemBadgeSprite,
};

export function getPlayerSprite(variant = 'astronaut') {
  return PLAYER_SPRITES[variant] ?? AstronautSprite;
}

export function getBossSprite(subject) {
  return BOSS_SPRITES_BY_SUBJECT[subject] ?? MagmaGolemSprite;
}

export function getItemSprite(category) {
  return ITEM_SPRITES[category] ?? ItemBadgeSprite;
}

/** Convenience: render an inventory item's sprite by its category. */
export function ItemSprite({ category, className = '', title }) {
  const Sprite = getItemSprite(category);
  return <Sprite className={className} title={title} />;
}

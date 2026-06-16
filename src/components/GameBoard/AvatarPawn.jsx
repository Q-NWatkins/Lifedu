import { getPlayerSprite } from '../../assets/gameSprites.jsx';

/**
 * The player's hero token — the undeniable focal point of the node layout.
 * It rides above the active node with a permanent hover bob, concentric pinging
 * rings, and a neon glow halo.
 */
export default function AvatarPawn({ variant = 'astronaut' }) {
  const Sprite = getPlayerSprite(variant);

  return (
    <div
      className="pointer-events-none absolute -top-9 left-1/2 z-[999] h-11 w-11 -translate-x-1/2"
      aria-label="Your hero — you are here"
      title="You are here"
    >
      {/* Glow halo */}
      <span className="absolute inset-0 -m-1 rounded-full bg-cyan-400/40 blur-md" />
      {/* Pinging outer rings */}
      <span className="absolute inset-0 -m-1 animate-ping rounded-full border-2 border-cyan-300/70" />
      <span className="absolute inset-0 rounded-full border-2 border-white/60" />
      {/* Bobbing hero sprite */}
      <div className="animate-avatar-bob relative h-full w-full drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]">
        <Sprite className="h-full w-full" />
      </div>
    </div>
  );
}

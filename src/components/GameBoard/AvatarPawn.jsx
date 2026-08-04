import { getPlayerSprite } from '../../assets/gameSprites.jsx';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { getAvatarSheet } from '../../config/avatars.js';
import AnimatedAvatar from '../common/AnimatedAvatar.jsx';

/**
 * The player's hero token — the undeniable focal point of the node layout.
 * It rides above the active node with a permanent hover bob, concentric pinging
 * rings, and a neon glow halo. Renders the student's chosen avatar as a looping
 * animated sprite when they've equipped one, otherwise the built-in pawn sprite.
 */
export default function AvatarPawn({ variant = 'astronaut', walking = false, facing = 1 }) {
  const { equippedAvatar } = usePlayerProgress();
  const sheet = getAvatarSheet(equippedAvatar);
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
      {/* Bobbing hero — walk loop while sliding, idle when stopped; flip to face
          the travel direction. Only the sprite flips, so the rings stay put. */}
      <div className="animate-avatar-bob relative flex h-full w-full items-center justify-center [filter:drop-shadow(4px_4px_0px_rgba(0,0,0,0.85))_drop-shadow(0_0_6px_rgba(34,211,238,0.9))]">
        {sheet ? (
          <div style={{ transform: `scaleX(${facing})`, transition: 'transform 120ms' }}>
            <AnimatedAvatar
              sheet={sheet}
              size={44}
              action={walking ? 'walk' : 'idle'}
              alt="Your hero"
            />
          </div>
        ) : (
          <Sprite className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

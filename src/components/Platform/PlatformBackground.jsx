import { useTheme } from '../../context/ThemeContext.jsx';

function StarParticles() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 11) % 100}%`,
    size: 4 + (i % 4) * 2,
    delay: `${(i % 8) * 0.7}s`,
    duration: `${6 + (i % 5) * 2}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white/80 animate-drift-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

function CloudShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="cloud-shape absolute -left-10 top-16 h-20 w-36 animate-float-cloud opacity-80" />
      <div
        className="cloud-shape absolute top-40 right-4 h-16 w-28 animate-float-cloud opacity-70"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="cloud-shape absolute bottom-24 left-1/4 h-24 w-44 animate-float-cloud opacity-90"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="cloud-shape absolute right-1/3 bottom-10 h-14 w-32 animate-float-cloud opacity-60"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
}

function BubbleShapes() {
  const bubbles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 4) % 100}%`,
    size: 8 + (i % 5) * 6,
    delay: `${(i % 8) * 1.1}s`,
    duration: `${9 + (i % 6) * 2.5}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="animate-rise-bubble absolute bottom-0 rounded-full border border-cyan-200/40 bg-cyan-200/20"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      ))}
    </div>
  );
}

const JELLYBEAN_COLORS = ['#f472b6', '#c084fc', '#f9a8d4', '#a78bfa', '#fb7185', '#e879f9'];

function JellybeanShapes() {
  const beans = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 21 + 6) % 100}%`,
    top: `${(i * 27 + 9) % 100}%`,
    width: 18 + (i % 4) * 6,
    color: JELLYBEAN_COLORS[i % JELLYBEAN_COLORS.length],
    rot: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15)}deg`,
    delay: `${(i % 8) * 0.7}s`,
    duration: `${5 + (i % 5) * 1.4}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {beans.map((bean) => (
        <span
          key={bean.id}
          className="animate-float-jelly absolute block rounded-full border-2 border-white/50 shadow-sm"
          style={{
            left: bean.left,
            top: bean.top,
            width: bean.width,
            height: bean.width * 0.6,
            background: bean.color,
            '--jelly-rot': bean.rot,
            animationDelay: bean.delay,
            animationDuration: bean.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function PlatformBackground({ children }) {
  const { activeTheme, themeConfig } = useTheme();

  return (
    <div
      className={`platform-wrapper relative min-h-screen ${themeConfig.bg_app} ${themeConfig.text_main}`}
    >
      {activeTheme === 'cosmic' && <StarParticles />}
      {activeTheme === 'sky' && <CloudShapes />}
      {activeTheme === 'deepsea' && <BubbleShapes />}
      {activeTheme === 'candy' && <JellybeanShapes />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

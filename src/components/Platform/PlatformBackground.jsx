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

export default function PlatformBackground({ children }) {
  const { activeTheme, themeConfig } = useTheme();

  return (
    <div className={`platform-wrapper relative min-h-screen ${themeConfig.wrapper}`}>
      {activeTheme === 'cosmic' && <StarParticles />}
      {activeTheme === 'sky' && <CloudShapes />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

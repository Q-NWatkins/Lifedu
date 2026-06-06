import { CURRICULUMS } from '../../config/index.js';

const SKILL_ORDER = ['math', 'science', 'reading', 'history'];

const SKILL_COLORS = {
  math: '#f87171',
  science: '#4ade80',
  reading: '#60a5fa',
  history: '#facc15',
};

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function buildHexagonPoints(cx, cy, radius, values, max = 100) {
  const step = 360 / SKILL_ORDER.length;
  return SKILL_ORDER.map((skillId, i) => {
    const value = values[skillId] ?? 0;
    const r = (value / max) * radius;
    const point = polarToCartesian(cx, cy, r, i * step);
    return `${point.x},${point.y}`;
  }).join(' ');
}

export default function SkillHexagon({ skills, size = 120, className = '', compact = false }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.38;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const playerPoints = buildHexagonPoints(cx, cy, outerRadius, skills);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Skill hexagon chart"
      >
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={buildHexagonPoints(cx, cy, outerRadius * level, {
              math: 100,
              science: 100,
              reading: 100,
              history: 100,
            })}
            fill="none"
            stroke="#000"
            strokeWidth="1.5"
            opacity="0.2"
          />
        ))}

        {SKILL_ORDER.map((skillId, i) => {
          const step = 360 / SKILL_ORDER.length;
          const outer = polarToCartesian(cx, cy, outerRadius, i * step);
          return (
            <line
              key={skillId}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#000"
              strokeWidth="1.5"
              opacity="0.2"
            />
          );
        })}

        <polygon
          points={playerPoints}
          fill="rgba(74, 222, 128, 0.55)"
          stroke="#000"
          strokeWidth="3"
          className="transition-all duration-700 ease-out"
        />

        {SKILL_ORDER.map((skillId, i) => {
          const step = 360 / SKILL_ORDER.length;
          const labelPoint = polarToCartesian(cx, cy, outerRadius + 12, i * step);
          const curriculum = CURRICULUMS[skillId];
          return (
            <text
              key={skillId}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={SKILL_COLORS[skillId]}
              className="text-[7px] font-black uppercase"
            >
              {curriculum.label.slice(0, 3)}
            </text>
          );
        })}
      </svg>

      {!compact && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-black/70">
          {SKILL_ORDER.map((skillId) => (
            <span key={skillId}>
              {CURRICULUMS[skillId].label}:{' '}
              <strong className="text-black">{skills[skillId] ?? 0}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

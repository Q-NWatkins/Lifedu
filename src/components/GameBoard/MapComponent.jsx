import { useMemo } from 'react';
import AvatarPawn from './AvatarPawn.jsx';

const NODE_COLORS = {
  lesson: 'bg-green-400',
  quiz: 'bg-yellow-300',
  chest: 'bg-amber-400',
  mysteryChest: 'bg-fuchsia-400',
  fork: 'bg-white',
  boss: 'bg-red-500 text-white',
};

function NodeShape({ shape, className, children }) {
  const base = `flex items-center justify-center border-4 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${className}`;

  if (shape === 'hexagon') {
    return (
      <div className={`${base} h-12 w-12 rotate-0 clip-hex`} style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
        {children}
      </div>
    );
  }
  if (shape === 'diamond') {
    return (
      <div className={`${base} h-11 w-11 rotate-45`}>
        <span className="-rotate-45">{children}</span>
      </div>
    );
  }
  if (shape === 'square') {
    return <div className={`${base} h-11 w-11 rounded-lg`}>{children}</div>;
  }
  return <div className={`${base} h-12 w-12 rounded-full`}>{children}</div>;
}

function MapNode({ node, isActive, isPassed, isOnPath, palette }) {
  const color = NODE_COLORS[node.type] ?? 'bg-sky-300';
  const dimmed = !isOnPath && node.branch !== 'shared';
  const opened = isPassed && (node.type === 'chest' || node.type === 'mysteryChest');

  return (
    <div
      className={`
        absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300
        ${isActive ? 'z-20 scale-110' : 'z-10'}
        ${dimmed ? 'opacity-40' : 'opacity-100'}
        ${!isActive ? 'animate-float-node hover:scale-105' : ''}
      `}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      title={node.label}
    >
      {isActive && (
        <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2">
          <AvatarPawn palette={palette} />
        </div>
      )}

      <NodeShape
        shape={node.shape}
        className={`${color} ${opened ? 'opacity-50' : ''} ${isActive ? 'ring-4 ring-black' : ''}`}
      >
        {node.type === 'mysteryChest' ? (
          <span className="text-lg">✨</span>
        ) : node.type === 'chest' ? (
          <span className="text-sm">📦</span>
        ) : node.type === 'boss' ? (
          <span className="text-xs">👹</span>
        ) : node.type === 'fork' ? (
          <span className="text-[10px]">⑂</span>
        ) : (
          <span className="text-[10px]">{node.label}</span>
        )}
      </NodeShape>
    </div>
  );
}

export default function MapComponent({
  layout,
  activePath,
  pathIndex,
  pathBranch,
  palette,
}) {
  const pathSet = useMemo(() => new Set(activePath), [activePath]);
  const activeNodeId = activePath[pathIndex];

  const visibleEdges = useMemo(() => {
    if (!pathBranch) return layout.edges;
    return layout.edges.filter(
      (e) => e.branch === 'shared' || e.branch === pathBranch,
    );
  }, [layout.edges, pathBranch]);

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-2xl">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {visibleEdges.map((edge) => {
          const from = layout.nodes.find((n) => n.id === edge.from);
          const to = layout.nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;

          const isShort = edge.branch === 'short';
          const isLong = edge.branch === 'long';
          const stroke =
            isShort ? '#22c55e' : isLong ? '#a855f7' : '#000';
          const dash = isLong ? '4 3' : undefined;

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={stroke}
              strokeWidth="0.6"
              strokeDasharray={dash}
              opacity={pathBranch || edge.branch === 'shared' ? 0.9 : 0.25}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0">
        {layout.nodes.map((node) => {
          const nodePathIndex = activePath.indexOf(node.id);
          const isOnPath = pathSet.has(node.id);
          const isActive = node.id === activeNodeId;
          const isPassed = nodePathIndex >= 0 && nodePathIndex < pathIndex;

          return (
            <MapNode
              key={node.id}
              node={node}
              isActive={isActive}
              isPassed={isPassed}
              isOnPath={isOnPath || node.branch === 'shared'}
              palette={palette}
            />
          );
        })}
      </div>

      <div className="absolute bottom-1 left-2 flex gap-2 text-[9px] font-black text-black/60">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 bg-green-500" /> Short path
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 border border-dashed border-purple-500 bg-purple-300" /> Treasure loop
        </span>
      </div>
    </div>
  );
}

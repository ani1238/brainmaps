'use client';

import { MASTERY_MAP, type MasteryState } from '@/lib/tokens';

interface ConceptNodeProps {
  state: MasteryState;
  dueForRecall?: boolean;
  size?: number;
  label?: string;
  onClick?: () => void;
  animDelay?: number;
}

export function ConceptNode({
  state,
  dueForRecall = false,
  size = 64,
  label,
  onClick,
  animDelay = 0,
}: ConceptNodeProps) {
  const m = MASTERY_MAP[state];
  const r = size / 2;
  const innerR = r * 0.72;
  const glowR = r * 0.94;

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={onClick}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="relative animate-node-pop" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible">
          {/* glow ring for strong/very-weak/weak */}
          {(state === 'STRONG' || state === 'VERY_WEAK' || state === 'WEAK') && (
            <circle
              cx={r} cy={r} r={glowR}
              fill="none"
              stroke={m.color}
              strokeWidth={1}
              opacity={0.35}
            />
          )}
          {/* main ring */}
          <circle
            cx={r} cy={r} r={innerR}
            fill={m.fillOpacity > 0 ? `${m.color}33` : 'transparent'}
            stroke={m.color}
            strokeWidth={2.5}
            strokeDasharray={m.dashed ? '6 4' : undefined}
          />
        </svg>

        {/* glyph */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110"
          style={{ color: m.color }}
        >
          {m.glyph}
        </div>

        {/* dueForRecall badge */}
        {dueForRecall && (
          <div
            className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full animate-recall-pulse"
            style={{
              background: '#f97316',
              border: '1.5px solid #fff',
              boxShadow: '0 0 0 2px #f9731633',
            }}
          />
        )}
      </div>

      {label && (
        <span
          className="text-center font-semibold leading-tight"
          style={{
            fontSize: size > 56 ? 13 : 11,
            color: '#44403c',
            maxWidth: size + 32,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

interface ConceptNodeChipProps {
  state: MasteryState;
  className?: string;
}

export function MasteryChip({ state, className = '' }: ConceptNodeChipProps) {
  const m = MASTERY_MAP[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        background: `${m.color}22`,
        color: m.color,
        border: `1px solid ${m.color}66`,
      }}
    >
      <span>{m.glyph}</span>
      {m.label}
    </span>
  );
}

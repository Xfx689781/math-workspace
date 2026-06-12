"use client";
import { useState } from 'react';

interface Ball { cx: number; cy: number; r: number }

function defaultCover(cx: number, cy: number, r: number): Ball[] {
  const d = r * 0.75;
  return [
    { cx: cx - d, cy: cy + d, r: r * 0.75 },
    { cx: cx + d, cy: cy + d, r: r * 0.75 },
    { cx: cx - d, cy: cy - d, r: r * 0.75 },
    { cx: cx + d, cy: cy - d, r: r * 0.75 },
    { cx: cx,     cy: cy + r * 1.3, r: r * 0.55 },
    { cx: cx,     cy: cy - r * 1.3, r: r * 0.55 },
    { cx: cx + r * 1.4, cy: cy, r: r * 0.5 },
    { cx: cx - r * 1.4, cy: cy, r: r * 0.5 },
  ];
}

export default function SetDiagramVisualizer({ data }: { data: any }) {
  const [showFinite, setShowFinite] = useState(false);
  const p = data?.params || {};

  const setType: string  = p.setType   ?? 'closed-disk';
  const cx0: number      = p.centerX   ?? 0;
  const cy0: number      = p.centerY   ?? 0;
  const radius: number   = p.radius    ?? 1;
  const label: string    = p.label     ?? 'K ⊆ ℝ²';
  const note: string     = p.note      ?? '';
  const coverBalls: Ball[]   = p.coverBalls?.length   ? p.coverBalls   : defaultCover(cx0, cy0, radius);
  const finiteIdx: number[]  = p.finiteSubcover?.length ? p.finiteSubcover : [0, 1, 2, 3].filter((i: number) => i < coverBalls.length);

  const SVG_W = 280, SVG_H = 185;
  const SCALE = Math.min(55, (SVG_W * 0.38) / (radius + 0.5));
  const ox = SVG_W / 2, oy = SVG_H / 2;
  const sv = (mx: number, my: number) => ({ x: ox + mx * SCALE, y: oy - my * SCALE });

  const displayed = showFinite ? coverBalls.filter((_: Ball, i: number) => finiteIdx.includes(i)) : coverBalls;

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono gap-2">
      <div className="text-[9px] text-zinc-500 uppercase tracking-widest truncate">{label}</div>

      <div className="flex-1 min-h-0 border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 175 }}>
          {/* Grid lines */}
          <line x1={ox} y1={6} x2={ox} y2={SVG_H - 6} stroke="#18181b" strokeWidth="1" />
          <line x1={6} y1={oy} x2={SVG_W - 6} y2={oy} stroke="#18181b" strokeWidth="1" />
          <text x={SVG_W - 10} y={oy - 3} fill="#27272a" fontSize="7" fontFamily="monospace">x</text>
          <text x={ox + 3} y={12} fill="#27272a" fontSize="7" fontFamily="monospace">y</text>

          {/* Open cover balls */}
          {displayed.map((ball: Ball, i: number) => {
            const c = sv(ball.cx, ball.cy);
            return (
              <circle
                key={i}
                cx={c.x} cy={c.y} r={ball.r * SCALE}
                fill={showFinite ? 'rgba(59,130,246,0.09)' : 'rgba(59,130,246,0.04)'}
                stroke={showFinite ? 'rgba(59,130,246,0.65)' : 'rgba(59,130,246,0.28)'}
                strokeWidth={showFinite ? 1.5 : 1}
                strokeDasharray={showFinite ? '0' : '5,3'}
              />
            );
          })}

          {/* The compact set K — drawn on top of balls */}
          {setType === 'closed-disk' && (() => {
            const c = sv(cx0, cy0);
            return (
              <circle cx={c.x} cy={c.y} r={radius * SCALE}
                fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2" />
            );
          })()}
          {setType === 'closed-rect' && (() => {
            const tl = sv(cx0 - radius, cy0 + radius * 0.6);
            const br = sv(cx0 + radius, cy0 - radius * 0.6);
            return (
              <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y}
                fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2" />
            );
          })()}

          {/* K label */}
          {(() => {
            const c = sv(cx0, cy0);
            return (
              <text x={c.x} y={c.y + 4} textAnchor="middle"
                fill="#10b981" fontSize="12" fontFamily="monospace" fontWeight="bold">K</text>
            );
          })()}

          {/* Legend */}
          <circle cx={12} cy={SVG_H - 12} r={4} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.2" />
          <text x={20} y={SVG_H - 9} fill="#3f3f46" fontSize="7" fontFamily="monospace">K (compact set)</text>
          <circle cx={12} cy={SVG_H - 4} r={4} fill="rgba(59,130,246,0.08)"
            stroke="rgba(59,130,246,0.5)" strokeWidth="1" strokeDasharray={showFinite ? '0' : '3,2'} />
          <text x={20} y={SVG_H - 1} fill="#3f3f46" fontSize="7" fontFamily="monospace">
            {showFinite ? 'finite subcover' : 'open cover'}
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFinite(f => !f)}
          className={`text-[9px] font-mono px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
            showFinite
              ? 'border-blue-500/40 text-blue-400 bg-blue-950/30'
              : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
          }`}
        >
          {showFinite ? '↳ Finite subcover' : '↳ Open cover (∞)'}
        </button>
        {note && <p className="text-[9px] text-zinc-700 leading-snug flex-1 text-right">{note}</p>}
      </div>
    </div>
  );
}

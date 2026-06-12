"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

type V2 = [number, number];

const vecLen = (v: V2) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);
const vecNorm = (v: V2): V2 => { const l = vecLen(v); return l > 1e-9 ? [v[0] / l, v[1] / l] : [1, 0]; };
const vecDot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const vecScale = (v: V2, s: number): V2 => [v[0] * s, v[1] * s];
const vecSub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];

const SVG_W = 300;
const SVG_H = 190;
const OX = SVG_W / 2;
const OY = SVG_H / 2;
const SCALE = 52;

function sv(x: number, y: number): [number, number] {
  return [OX + x * SCALE, OY - y * SCALE];
}
function dv(sx: number, sy: number): V2 {
  return [(sx - OX) / SCALE, (OY - sy) / SCALE];
}

function Arrow({ x1, y1, x2, y2, color, dashed = false, width = 2 }: {
  x1: number; y1: number; x2: number; y2: number;
  color: string; dashed?: boolean; width?: number;
}) {
  const dx = x2 - x1, dy = y2 - y1;
  if (Math.hypot(dx, dy) < 3) return null;
  const ang = Math.atan2(dy, dx);
  const al = 8, aa = Math.PI / 6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '4,3' : undefined}
        strokeLinecap="round" />
      <line x1={x2} y1={y2}
        x2={x2 - al * Math.cos(ang - aa)} y2={y2 - al * Math.sin(ang - aa)}
        stroke={color} strokeWidth={Math.max(1, width * 0.75)} strokeLinecap="round" />
      <line x1={x2} y1={y2}
        x2={x2 - al * Math.cos(ang + aa)} y2={y2 - al * Math.sin(ang + aa)}
        stroke={color} strokeWidth={Math.max(1, width * 0.75)} strokeLinecap="round" />
    </g>
  );
}

function RightAngleMark({ x, y, e1, e2, sz = 10, color = '#22c55e' }: {
  x: number; y: number; e1: V2; e2: V2; sz?: number; color?: string;
}) {
  // In SVG, y is flipped, so e1_svg = (e1[0], -e1[1])
  const e1s: V2 = [e1[0] * sz, -e1[1] * sz];
  const e2s: V2 = [e2[0] * sz, -e2[1] * sz];
  return (
    <polyline
      points={`${x + e1s[0]},${y + e1s[1]} ${x + e1s[0] + e2s[0]},${y + e1s[1] + e2s[1]} ${x + e2s[0]},${y + e2s[1]}`}
      fill="none" stroke={color} strokeWidth="1.2"
    />
  );
}

export default function GramSchmidtVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const rawVecs: V2[] = params.vectors?.slice(0, 2) || [[1.5, 0.4], [0.4, 1.5]];
  const labels: string[] = params.labels || ['v₁', 'v₂'];

  const [v1, setV1] = useState<V2>(() => rawVecs[0] || [1.5, 0.4]);
  const [v2, setV2] = useState<V2>(() => rawVecs[1] || [0.4, 1.5]);
  const [dragging, setDragging] = useState<'v1' | 'v2' | null>(null);
  const [step, setStep] = useState(4);
  const svgRef = useRef<SVGSVGElement>(null);

  const gs = useMemo(() => {
    const e1 = vecNorm(v1);
    const projScalar = vecDot(v2, e1);
    const proj = vecScale(e1, projScalar);
    const perp = vecSub(v2, proj);
    const perpLen = vecLen(perp);
    const e2: V2 = perpLen > 1e-9 ? vecNorm(perp) : [-e1[1], e1[0]];
    const dot_e1_e2 = vecDot(e1, e2);
    return { e1, e2, proj, perp, projScalar, perpLen, isLinDep: perpLen < 0.1, dot: dot_e1_e2 };
  }, [v1, v2]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const sy = ((e.clientY - rect.top) / rect.height) * SVG_H;
    const [nx, ny] = dv(sx, sy);
    const clamped: V2 = [Math.max(-2.4, Math.min(2.4, nx)), Math.max(-1.6, Math.min(1.6, ny))];
    if (vecLen(clamped) < 0.25) return;
    if (dragging === 'v1') setV1(clamped);
    else setV2(clamped);
  }, [dragging]);

  const [v1x, v1y] = sv(v1[0], v1[1]);
  const [v2x, v2y] = sv(v2[0], v2[1]);
  const [e1x, e1y] = sv(gs.e1[0], gs.e1[1]);
  const [e2x, e2y] = sv(gs.e2[0], gs.e2[1]);
  const [prx, pry] = sv(gs.proj[0], gs.proj[1]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const sy = ((e.clientY - rect.top) / rect.height) * SVG_H;
    if (Math.hypot(sx - v1x, sy - v1y) < 14) setDragging('v1');
    else if (Math.hypot(sx - v2x, sy - v2y) < 14) setDragging('v2');
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }, [v1x, v1y, v2x, v2y]);

  const GRID_LINES = [-2, -1, 0, 1, 2];

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">GRAM-SCHMIDT</span>
        <span className="text-[9px] text-zinc-500">orthogonalization in ℝ²</span>
        {gs.isLinDep && (
          <span className="text-[9px] text-amber-500 ml-1">⚠ nearly collinear</span>
        )}
        <div className="ml-auto flex gap-0.5">
          {[1, 2, 3, 4].map(s => (
            <button key={s} onClick={() => setStep(s)}
              className={`text-[8px] w-5 h-5 rounded border transition-all ${
                step >= s
                  ? 'border-blue-700/70 bg-blue-950/40 text-blue-400'
                  : 'border-zinc-800 text-zinc-700 hover:border-zinc-700'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full select-none"
          style={{ cursor: dragging ? 'crosshair' : 'default' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
        >
          {/* Grid lines */}
          {GRID_LINES.map(n => {
            const [gxp] = sv(n, 0);
            const [, gyp] = sv(0, n);
            const isAxis = n === 0;
            return (
              <g key={n}>
                <line x1={gxp} y1={6} x2={gxp} y2={SVG_H - 6}
                  stroke={isAxis ? '#27272a' : '#131316'} strokeWidth={isAxis ? 0.8 : 0.4} />
                <line x1={6} y1={gyp} x2={SVG_W - 6} y2={gyp}
                  stroke={isAxis ? '#27272a' : '#131316'} strokeWidth={isAxis ? 0.8 : 0.4} />
                {n !== 0 && (
                  <>
                    <text x={gxp} y={OY + 9} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">{n}</text>
                    <text x={OX - 3} y={gyp + 2} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="end">{n}</text>
                  </>
                )}
              </g>
            );
          })}

          {/* Unit circle (dashed reference) */}
          <circle cx={OX} cy={OY} r={SCALE} fill="none" stroke="#1d1d20" strokeDasharray="2,4" strokeWidth="0.8" />

          {/* Step 2: projection vector (orange dashed) */}
          {step >= 2 && (
            <Arrow x1={OX} y1={OY} x2={prx} y2={pry} color="#f59e0b" dashed width={1.5} />
          )}
          {step >= 2 && (
            <text
              x={(OX + prx) / 2 + (pry < OY ? 3 : -14)}
              y={(OY + pry) / 2 + (prx > OX ? -3 : 5)}
              fill="#f59e0b" fontSize="6" fontFamily="monospace" opacity="0.85"
            >proj</text>
          )}

          {/* Step 3: perpendicular component (teal dashed, from proj tip to v2) */}
          {step >= 3 && !gs.isLinDep && (
            <g>
              <line
                x1={prx} y1={pry} x2={v2x} y2={v2y}
                stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="3,2" strokeLinecap="round"
              />
              <text x={(prx + v2x) / 2 + 3} y={(pry + v2y) / 2} fill="#14b8a6" fontSize="5.5" fontFamily="monospace">⊥</text>
            </g>
          )}

          {/* Input vectors (always visible) */}
          <Arrow x1={OX} y1={OY} x2={v1x} y2={v1y} color="#3b82f6" width={2} />
          <Arrow x1={OX} y1={OY} x2={v2x} y2={v2y} color="#a855f7" width={2} />

          {/* Step 1: e1 (normalized v1, light blue) */}
          {step >= 1 && (
            <Arrow x1={OX} y1={OY} x2={e1x} y2={e1y} color="#93c5fd" width={2.2} />
          )}

          {/* Step 4: e2 result (green) + right angle mark */}
          {step >= 4 && !gs.isLinDep && (
            <>
              <Arrow x1={OX} y1={OY} x2={e2x} y2={e2y} color="#22c55e" width={2.5} />
              <RightAngleMark x={OX} y={OY} e1={gs.e1} e2={gs.e2} sz={11} />
            </>
          )}

          {/* Draggable tip indicators */}
          <circle cx={v1x} cy={v1y} r="8" fill="transparent" stroke="#3b82f6" strokeWidth="0.7" opacity="0.5" style={{ cursor: 'move' }} />
          <circle cx={v2x} cy={v2y} r="8" fill="transparent" stroke="#a855f7" strokeWidth="0.7" opacity="0.5" style={{ cursor: 'move' }} />

          {/* Labels */}
          <text x={v1x + 7} y={v1y - 4} fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {labels[0] || 'v₁'}
          </text>
          <text x={v2x + 7} y={v2y - 4} fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {labels[1] || 'v₂'}
          </text>
          {step >= 1 && (
            <text x={e1x + 5} y={e1y + 2} fill="#93c5fd" fontSize="8" fontFamily="monospace" fontWeight="bold">e₁</text>
          )}
          {step >= 4 && !gs.isLinDep && (
            <text x={e2x + 5} y={e2y + 2} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold">e₂</text>
          )}

          {/* Axis labels */}
          <text x={SVG_W - 9} y={OY + 9} fill="#3f3f46" fontSize="6" fontFamily="monospace">x</text>
          <text x={OX + 3} y={10} fill="#3f3f46" fontSize="6" fontFamily="monospace">y</text>

          {!dragging && (
            <text x={SVG_W / 2} y={SVG_H - 3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              drag v₁ or v₂ · step buttons reveal decomposition
            </text>
          )}
        </svg>
      </div>

      {/* Step cards */}
      <div className="grid grid-cols-2 gap-1 text-[9px]">
        <div className={`rounded-lg p-1.5 border transition-all ${step === 1 ? 'border-blue-700/50 bg-blue-950/20' : 'border-zinc-900/60 bg-zinc-900/10'}`}>
          <span className="text-blue-400 font-bold">① </span>
          <span className="text-zinc-500">
            e₁ = v₁/‖v₁‖ = ({gs.e1[0].toFixed(2)}, {gs.e1[1].toFixed(2)})
          </span>
        </div>
        <div className={`rounded-lg p-1.5 border transition-all ${step === 2 ? 'border-amber-700/50 bg-amber-950/20' : 'border-zinc-900/60 bg-zinc-900/10'}`}>
          <span className="text-amber-400 font-bold">② </span>
          <span className="text-zinc-500">
            ⟨v₂,e₁⟩ = {gs.projScalar.toFixed(2)}
          </span>
        </div>
        <div className={`rounded-lg p-1.5 border transition-all ${step === 3 ? 'border-teal-700/50 bg-teal-950/20' : 'border-zinc-900/60 bg-zinc-900/10'}`}>
          <span className="text-teal-400 font-bold">③ </span>
          <span className="text-zinc-500">
            v₂ − proj ⊥ e₁, ‖⊥‖ = {gs.perpLen.toFixed(2)}
          </span>
        </div>
        <div className={`rounded-lg p-1.5 border transition-all ${step === 4 ? 'border-green-700/50 bg-green-950/20' : 'border-zinc-900/60 bg-zinc-900/10'}`}>
          <span className="text-green-400 font-bold">④ </span>
          <span className="text-zinc-500">
            e₂ = ({gs.e2[0].toFixed(2)}, {gs.e2[1].toFixed(2)})
          </span>
        </div>
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || 'The right-angle mark confirms e₁ ⊥ e₂. Drag v₁ or v₂ to explore how the orthogonalization changes.'}
      </div>
    </div>
  );
}

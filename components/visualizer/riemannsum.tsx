"use client";
import { useState, useMemo } from 'react';

function evalFn(expr: string, x: number): number | null {
  if (!expr) return null;
  try {
    const js = expr
      .replace(/\^/g, '**')
      .replace(/\barcsin\b/g, 'Math.asin').replace(/\barccos\b/g, 'Math.acos').replace(/\barctan\b/g, 'Math.atan')
      .replace(/\bsinh\b/g, 'Math.sinh').replace(/\bcosh\b/g, 'Math.cosh').replace(/\btanh\b/g, 'Math.tanh')
      .replace(/\bsin\b/g, 'Math.sin').replace(/\bcos\b/g, 'Math.cos').replace(/\btan\b/g, 'Math.tan')
      .replace(/\bexp\b/g, 'Math.exp').replace(/\bln\b/g, 'Math.log').replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs').replace(/\bPI\b/g, String(Math.PI)).replace(/\bpi\b/g, String(Math.PI))
      .replace(/\be\b/g, String(Math.E));
    // eslint-disable-next-line no-new-func
    const result = new Function('x', `"use strict"; return (${js});`)(x);
    if (!isFinite(result) || isNaN(result)) return null;
    return result;
  } catch { return null; }
}

const SVG_W = 300;
const SVG_H = 170;
const M = { l: 32, r: 12, t: 12, b: 20 };
const PW = SVG_W - M.l - M.r;
const PH = SVG_H - M.t - M.b;

type SumType = 'upper' | 'lower' | 'left' | 'right' | 'midpoint';

function subintervalHeight(fn: string, a: number, b: number, type: SumType): number {
  const k = 32;
  const ys: number[] = [];
  for (let i = 0; i <= k; i++) {
    const y = evalFn(fn, a + (i / k) * (b - a));
    if (y !== null) ys.push(y);
  }
  if (!ys.length) return 0;
  if (type === 'upper') return Math.max(...ys);
  if (type === 'lower') return Math.min(...ys);
  if (type === 'left') return evalFn(fn, a) ?? 0;
  if (type === 'right') return evalFn(fn, b) ?? 0;
  return evalFn(fn, (a + b) / 2) ?? 0; // midpoint
}

const SUM_COLORS: Record<SumType, { fill: string; stroke: string; label: string }> = {
  upper:    { fill: 'rgba(239,68,68,0.13)',   stroke: 'rgba(239,68,68,0.55)',   label: 'Upper' },
  lower:    { fill: 'rgba(59,130,246,0.13)',  stroke: 'rgba(59,130,246,0.55)',  label: 'Lower' },
  left:     { fill: 'rgba(16,185,129,0.13)',  stroke: 'rgba(16,185,129,0.55)',  label: 'Left' },
  right:    { fill: 'rgba(139,92,246,0.13)',  stroke: 'rgba(139,92,246,0.55)',  label: 'Right' },
  midpoint: { fill: 'rgba(245,158,11,0.13)',  stroke: 'rgba(245,158,11,0.55)',  label: 'Midpoint' },
};
const SUM_TYPES: SumType[] = ['upper', 'lower', 'left', 'right', 'midpoint'];

export default function RiemannSumVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const fnExpr: string = params.fnExpression || 'x**2';
  const domain: [number, number] = params.domain || [0, 1];
  const [xMin, xMax] = domain;

  const [n, setN] = useState<number>(Math.max(2, Math.min(50, params.n || 6)));
  const [sumType, setSumType] = useState<SumType>(params.sumType || 'upper');

  // Compute curve
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (i / 200) * (xMax - xMin);
      const y = evalFn(fnExpr, x);
      if (y !== null) pts.push({ x, y });
    }
    return pts;
  }, [fnExpr, xMin, xMax]);

  const ys = curvePoints.map(p => p.y);
  const rawYMin = ys.length ? Math.min(...ys) : 0;
  const rawYMax = ys.length ? Math.max(...ys) : 1;
  const pad = (rawYMax - rawYMin) * 0.18 || 0.3;
  const yMin = Math.min(0, rawYMin - pad);
  const yMax = rawYMax + pad;

  const toSvg = (x: number, y: number) => ({
    sx: M.l + ((x - xMin) / (xMax - xMin)) * PW,
    sy: M.t + (1 - (y - yMin) / (yMax - yMin)) * PH,
  });

  const axisY = Math.max(M.t, Math.min(SVG_H - M.b, toSvg(0, 0).sy));

  // Curve path segments (break on null)
  const curvePath = useMemo(() => {
    const segs: string[] = [];
    let current: string[] = [];
    for (const p of curvePoints) {
      const { sx, sy } = toSvg(p.x, p.y);
      if (sy >= M.t - 5 && sy <= SVG_H - M.b + 5) {
        current.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
      } else {
        if (current.length > 1) segs.push(current.join(' '));
        current = [];
      }
    }
    if (current.length > 1) segs.push(current.join(' '));
    return segs;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curvePoints, yMin, yMax]);

  // Partition rectangles
  const { rects, sumValue } = useMemo(() => {
    const dx = (xMax - xMin) / n;
    let total = 0;
    const rs = Array.from({ length: n }, (_, i) => {
      const a = xMin + i * dx;
      const b = a + dx;
      const h = subintervalHeight(fnExpr, a, b, sumType);
      total += h * dx;
      const { sx: x1 } = toSvg(a, 0);
      const { sx: x2 } = toSvg(b, 0);
      const { sy: hY } = toSvg(a, h);
      return {
        x: x1,
        y: h >= 0 ? hY : axisY,
        w: Math.max(0, x2 - x1 - 0.5),
        h: Math.max(0, Math.abs(axisY - hY)),
      };
    });
    return { rects: rs, sumValue: total };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnExpr, xMin, xMax, n, sumType, yMin, yMax]);

  const c = SUM_COLORS[sumType];

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="text-[9px] text-zinc-600 tracking-widest uppercase truncate">
        RIEMANN SUM · f(x) = {fnExpr} · [{xMin}, {xMax}]
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg className="w-full" viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {/* Axis lines */}
          <line x1={M.l} y1={axisY} x2={SVG_W - M.r} y2={axisY} stroke="#27272a" strokeWidth="1" />
          <line x1={M.l} y1={M.t} x2={M.l} y2={SVG_H - M.b} stroke="#27272a" strokeWidth="1" />

          {/* Rectangles (behind curve) */}
          {rects.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h}
              fill={c.fill} stroke={c.stroke} strokeWidth="0.8" />
          ))}

          {/* Function curve on top */}
          {curvePath.map((pts, i) => (
            <polyline key={i} fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" points={pts} />
          ))}

          {/* Partition boundary ticks */}
          {Array.from({ length: n + 1 }, (_, i) => {
            const x = xMin + i * (xMax - xMin) / n;
            const { sx } = toSvg(x, 0);
            return <line key={i} x1={sx} y1={axisY - 2} x2={sx} y2={axisY + 3} stroke="#3f3f46" strokeWidth="0.8" />;
          })}

          {/* Axis labels */}
          {[xMin, xMax].map((v, i) => {
            const { sx } = toSvg(v, 0);
            return <text key={i} x={sx} y={SVG_H - M.b + 9} fill="#52525b" fontSize="6" fontFamily="monospace" textAnchor="middle">{v}</text>;
          })}

          {/* Sum value */}
          <text x={SVG_W - M.r - 1} y={M.t + 9} fill="#a1a1aa" fontSize="7" fontFamily="monospace" textAnchor="end">
            {c.label} = {sumValue.toFixed(5)}
          </text>
        </svg>
      </div>

      {/* Sum type buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] text-zinc-700 shrink-0">Sum:</span>
        {SUM_TYPES.map(t => {
          const col = SUM_COLORS[t];
          return (
            <button key={t}
              onClick={() => setSumType(t)}
              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                sumType === t ? 'text-zinc-100 bg-zinc-800 border-zinc-600' : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
              }`}
              style={sumType === t ? { borderColor: col.stroke } : {}}
            >
              {col.label}
            </button>
          );
        })}
      </div>

      {/* n slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-zinc-500">Partitions</span>
          <span className="text-zinc-200 font-bold">n = {n}</span>
        </div>
        <input type="range" min="2" max="60" value={n}
          onChange={e => setN(Number(e.target.value))}
          className="w-full accent-blue-500 bg-zinc-900 h-1 rounded cursor-pointer" />
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || 'Increase n: rectangles converge to the true integral. Toggle Upper/Lower to see the squeeze.'}
      </div>
    </div>
  );
}

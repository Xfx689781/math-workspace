"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

function evalFn2(expr: string, x: number, y: number): number | null {
  if (!expr) return null;
  try {
    const js = expr
      .replace(/\^/g, '**')
      .replace(/\barcsin\b/g, 'Math.asin').replace(/\barccos\b/g, 'Math.acos').replace(/\barctan\b/g, 'Math.atan')
      .replace(/\bsin\b/g, 'Math.sin').replace(/\bcos\b/g, 'Math.cos').replace(/\btan\b/g, 'Math.tan')
      .replace(/\bexp\b/g, 'Math.exp').replace(/\bln\b/g, 'Math.log').replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs').replace(/\bpi\b/g, String(Math.PI)).replace(/\bPI\b/g, String(Math.PI));
    // eslint-disable-next-line no-new-func
    const result = new Function('x', 'y', `"use strict"; return (${js});`)(x, y);
    if (!isFinite(result) || isNaN(result)) return null;
    return result;
  } catch { return null; }
}

function computeContour(
  fn: (x: number, y: number) => number | null,
  xRange: [number, number], yRange: [number, number],
  res = 70
): [number, number, number, number][] {
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const dx = (x1 - x0) / res;
  const dy = (y1 - y0) / res;

  const vals: (number | null)[][] = [];
  for (let j = 0; j <= res; j++) {
    vals[j] = [];
    for (let i = 0; i <= res; i++) {
      vals[j][i] = fn(x0 + i * dx, y0 + j * dy);
    }
  }

  const segs: [number, number, number, number][] = [];
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const v = [vals[j][i], vals[j][i + 1], vals[j + 1][i + 1], vals[j + 1][i]];
      if (v.some(val => val === null)) continue;
      const cx = [x0 + i * dx, x0 + (i + 1) * dx, x0 + (i + 1) * dx, x0 + i * dx];
      const cy = [y0 + j * dy, y0 + j * dy, y0 + (j + 1) * dy, y0 + (j + 1) * dy];
      const pts: [number, number][] = [];
      for (let k = 0; k < 4; k++) {
        const k2 = (k + 1) % 4;
        const va = v[k] as number, vb = v[k2] as number;
        if ((va < 0) !== (vb < 0)) {
          const t = va / (va - vb);
          pts.push([cx[k] + t * (cx[k2] - cx[k]), cy[k] + t * (cy[k2] - cy[k])]);
        }
      }
      if (pts.length >= 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
    }
  }
  return segs;
}

const SVG_W = 300;
const SVG_H = 178;
const M = { l: 28, r: 10, t: 10, b: 18 };
const PW = SVG_W - M.l - M.r;
const PH = SVG_H - M.t - M.b;

export default function LevelSetVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const fnExpr: string = params.fnExpression || 'x**2 + y**2';
  const level: number = params.level ?? 0;
  const rawDomain = params.domain || [[-2, 2], [-2, 2]];
  const [[xMin, xMax], [yMin, yMax]] = rawDomain;
  const initA: number = params.a ?? 0;
  const initB: number = params.b ?? 1;

  const [point, setPoint] = useState<[number, number]>([initA, initB]);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const toSvg = useCallback((x: number, y: number) => ({
    sx: M.l + ((x - xMin) / (xMax - xMin)) * PW,
    sy: M.t + (1 - (y - yMin) / (yMax - yMin)) * PH,
  }), [xMin, xMax, yMin, yMax]);

  const fromSvg = useCallback((sx: number, sy: number): [number, number] => [
    xMin + ((sx - M.l) / PW) * (xMax - xMin),
    yMin + (1 - (sy - M.t) / PH) * (yMax - yMin),
  ], [xMin, xMax, yMin, yMax]);

  const contourSegs = useMemo(() => computeContour(
    (x, y) => { const v = evalFn2(fnExpr, x, y); return v !== null ? v - level : null; },
    [xMin, xMax], [yMin, yMax], 72
  ), [fnExpr, level, xMin, xMax, yMin, yMax]);

  const { gx, gy, fVal } = useMemo(() => {
    const h = Math.max(1e-6, (xMax - xMin) * 1e-4);
    const f0 = evalFn2(fnExpr, point[0], point[1]);
    const fxp = evalFn2(fnExpr, point[0] + h, point[1]);
    const fxm = evalFn2(fnExpr, point[0] - h, point[1]);
    const fyp = evalFn2(fnExpr, point[0], point[1] + h);
    const fym = evalFn2(fnExpr, point[0], point[1] - h);
    const gx = (fxp !== null && fxm !== null) ? (fxp - fxm) / (2 * h) : null;
    const gy = (fyp !== null && fym !== null) ? (fyp - fym) / (2 * h) : null;
    return { gx, gy, fVal: f0 };
  }, [fnExpr, point, xMin, xMax]);

  const svgSegs = useMemo(() =>
    contourSegs.map(([x1d, y1d, x2d, y2d]) => {
      const { sx: x1, sy: y1 } = toSvg(x1d, y1d);
      const { sx: x2, sy: y2 } = toSvg(x2d, y2d);
      return { x1, y1, x2, y2 };
    })
  , [contourSegs, toSvg]);

  const onSvgPointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const sy = ((e.clientY - rect.top) / rect.height) * SVG_H;
    const [nx, ny] = fromSvg(sx, sy);
    setPoint([
      Math.max(xMin + 0.01, Math.min(xMax - 0.01, nx)),
      Math.max(yMin + 0.01, Math.min(yMax - 0.01, ny)),
    ]);
  }, [isDragging, fromSvg, xMin, xMax, yMin, yMax]);

  const gradLen = gx !== null && gy !== null ? Math.sqrt(gx * gx + gy * gy) : null;
  const iftApplies = gy !== null && Math.abs(gy) > 0.05;
  const onCurve = fVal !== null && Math.abs(fVal - level) < (yMax - yMin) * 0.06;
  const dydx = (gy !== null && gx !== null && Math.abs(gy) > 1e-8) ? -gx / gy : null;

  const { sx: px, sy: py } = toSvg(point[0], point[1]);
  const { sx: ox, sy: oy } = toSvg(0, 0);
  const clampedOx = Math.max(M.l, Math.min(SVG_W - M.r, ox));
  const clampedOy = Math.max(M.t, Math.min(SVG_H - M.b, oy));

  // Gradient arrow: fixed 32px length in SVG
  const gradArrow = (gradLen && gradLen > 1e-10 && gx !== null && gy !== null) ? (() => {
    const nx = gx / gradLen, ny = gy / gradLen;
    const arrowLen = 32;
    const ax = px + nx * arrowLen;
    const ay = py - ny * arrowLen; // flip y for SVG
    const ang = Math.atan2(ay - py, ax - px);
    const al = 7, aa = Math.PI / 6;
    return { ax, ay, ang, al, aa };
  })() : null;

  // Tangent segment: along (-gy, gx) direction in data space
  const tangentSeg = (onCurve && dydx !== null) ? (() => {
    const xOff = (xMax - xMin) * 0.13;
    const p1 = toSvg(point[0] - xOff, point[1] - dydx * xOff);
    const p2 = toSvg(point[0] + xOff, point[1] + dydx * xOff);
    return { x1: p1.sx, y1: p1.sy, x2: p2.sx, y2: p2.sy };
  })() : null;

  // Axis tick values
  const xTicks = [xMin, Math.round((xMin + xMax) / 2), xMax];
  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax];

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">LEVEL SET</span>
        <span className="text-[9px] text-zinc-500">F(x,y) = {level}</span>
        {onCurve && <span className="text-[9px] text-emerald-600 ml-1">● on curve</span>}
        <span className={`ml-auto text-[9px] px-2 py-0.5 rounded border font-mono ${
          iftApplies
            ? 'border-emerald-900/50 text-emerald-400 bg-emerald-950/20'
            : 'border-amber-900/50 text-amber-400 bg-amber-950/20'
        }`}>
          ∂F/∂y {gy !== null ? `= ${gy.toFixed(2)}` : '?'}{iftApplies ? ' ≠ 0 ✓' : ' ≈ 0 ✗'}
        </span>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full select-none"
          style={{ cursor: isDragging ? 'crosshair' : 'move' }}
          onPointerDown={e => {
            setIsDragging(true);
            (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={onSvgPointer}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          {/* Grid */}
          {[-2, -1, 0, 1, 2].map(n => {
            const { sx: gx2 } = toSvg(n, 0);
            const { sy: gy2 } = toSvg(0, n);
            return (
              <g key={n}>
                {gx2 >= M.l && gx2 <= SVG_W - M.r && (
                  <line x1={gx2} y1={M.t} x2={gx2} y2={SVG_H - M.b}
                    stroke={n === 0 ? '#27272a' : '#18181b'}
                    strokeWidth={n === 0 ? 0.8 : 0.4} />
                )}
                {gy2 >= M.t && gy2 <= SVG_H - M.b && (
                  <line x1={M.l} y1={gy2} x2={SVG_W - M.r} y2={gy2}
                    stroke={n === 0 ? '#27272a' : '#18181b'}
                    strokeWidth={n === 0 ? 0.8 : 0.4} />
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={SVG_W - M.r - 2} y={clampedOy - 2} fill="#3f3f46" fontSize="6" fontFamily="monospace">x</text>
          <text x={clampedOx + 2} y={M.t + 7} fill="#3f3f46" fontSize="6" fontFamily="monospace">y</text>

          {/* Level set contour — blue */}
          {svgSegs.map((seg, i) => (
            <line key={i}
              x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
              stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
            />
          ))}

          {/* Tangent line (green dashed) — local graph y=g(x) */}
          {tangentSeg && iftApplies && (
            <line
              x1={tangentSeg.x1} y1={tangentSeg.y1}
              x2={tangentSeg.x2} y2={tangentSeg.y2}
              stroke="#22c55e" strokeWidth="2.5" strokeDasharray="4,3" strokeLinecap="round"
            />
          )}

          {/* Gradient arrow (amber) */}
          {gradArrow && (
            <g>
              <line x1={px} y1={py} x2={gradArrow.ax} y2={gradArrow.ay}
                stroke="#f59e0b" strokeWidth="1.8" />
              <line x1={gradArrow.ax} y1={gradArrow.ay}
                x2={gradArrow.ax - gradArrow.al * Math.cos(gradArrow.ang - gradArrow.aa)}
                y2={gradArrow.ay - gradArrow.al * Math.sin(gradArrow.ang - gradArrow.aa)}
                stroke="#f59e0b" strokeWidth="1.5" />
              <line x1={gradArrow.ax} y1={gradArrow.ay}
                x2={gradArrow.ax - gradArrow.al * Math.cos(gradArrow.ang + gradArrow.aa)}
                y2={gradArrow.ay - gradArrow.al * Math.sin(gradArrow.ang + gradArrow.aa)}
                stroke="#f59e0b" strokeWidth="1.5" />
              <text x={gradArrow.ax + 3} y={gradArrow.ay - 2}
                fill="#f59e0b" fontSize="6.5" fontFamily="monospace">∇F</text>
            </g>
          )}

          {/* Point highlight */}
          <circle cx={px} cy={py} r="7" fill={onCurve && iftApplies ? '#22c55e' : '#3b82f6'} opacity="0.12" />
          <circle cx={px} cy={py} r="4"
            fill={onCurve && iftApplies ? '#22c55e' : (onCurve ? '#f59e0b' : '#3b82f6')}
          />
          <text x={px + 6} y={py - 5}
            fill={onCurve && iftApplies ? '#86efac' : '#93c5fd'}
            fontSize="6" fontFamily="monospace">
            ({point[0].toFixed(2)},{point[1].toFixed(2)})
          </text>

          {/* Axis ticks */}
          {xTicks.map(v => {
            const { sx: tx } = toSvg(v, 0);
            if (tx < M.l || tx > SVG_W - M.r) return null;
            return (
              <g key={v}>
                <line x1={tx} y1={clampedOy - 2} x2={tx} y2={clampedOy + 2} stroke="#52525b" strokeWidth="0.8" />
                <text x={tx} y={SVG_H - M.b + 9} fill="#52525b" fontSize="5.5" fontFamily="monospace" textAnchor="middle">{v}</text>
              </g>
            );
          })}
          {yTicks.map(v => {
            const { sy: ty } = toSvg(0, v);
            if (ty < M.t || ty > SVG_H - M.b) return null;
            return (
              <g key={v}>
                <line x1={clampedOx - 2} y1={ty} x2={clampedOx + 2} y2={ty} stroke="#52525b" strokeWidth="0.8" />
                <text x={M.l - 2} y={ty + 2} fill="#52525b" fontSize="5.5" fontFamily="monospace" textAnchor="end">{v}</text>
              </g>
            );
          })}

          {!isDragging && (
            <text x={SVG_W / 2} y={SVG_H - 2} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              drag · ∇F ⊥ level curve · green = y=g(x) locally
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-600 mb-0.5">F(x,y)</div>
          <div className="text-zinc-300 font-bold">{fVal !== null ? fVal.toFixed(3) : '–'}</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-600 mb-0.5">∂F/∂y</div>
          <div className={`font-bold ${iftApplies ? 'text-emerald-400' : 'text-amber-400'}`}>
            {gy !== null ? gy.toFixed(3) : '–'}
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-600 mb-0.5">y=g(x) here?</div>
          <div className={`font-bold ${iftApplies ? 'text-emerald-400' : 'text-red-400'}`}>
            {iftApplies ? 'YES' : 'NO'}
          </div>
        </div>
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || `Drag the point on F(x,y) = ${level}. When ∂F/∂y ≠ 0 (green), the Implicit Function Theorem guarantees the level set is locally the graph y = g(x). The amber arrow shows ∇F ⊥ level curve.`}
      </div>
    </div>
  );
}

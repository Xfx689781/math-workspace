"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

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
const SAMPLES = 200;

export default function EpsilonDeltaVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const fnExpr: string = params.fnExpression || 'x**2';
  const a: number = params.a ?? 1;
  const initialL: number = params.L ?? (evalFn(fnExpr, a) ?? 1);
  const domain: [number, number] = params.domain || [Math.max(0, a - 2.5), a + 2.5];
  const [xMin, xMax] = domain;

  const [epsilon, setEpsilon] = useState<number>(Math.max(0.05, params.epsilon ?? 0.6));
  const [delta, setDelta] = useState<number>(Math.max(0.01, params.delta ?? 0.4));

  // Curve points
  const rawPoints = useMemo(() => {
    const pts: { x: number; y: number | null }[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (i / SAMPLES) * (xMax - xMin);
      pts.push({ x, y: evalFn(fnExpr, x) });
    }
    return pts;
  }, [fnExpr, xMin, xMax]);

  const validYs = rawPoints.filter(p => p.y !== null).map(p => p.y as number);
  const rawYMin = validYs.length ? Math.min(...validYs) : initialL - 2;
  const rawYMax = validYs.length ? Math.max(...validYs) : initialL + 2;
  const pad = Math.max((rawYMax - rawYMin) * 0.15, 0.3);
  const yMin = rawYMin - pad;
  const yMax = rawYMax + pad;

  const toSvg = (x: number, y: number) => ({
    sx: M.l + ((x - xMin) / (xMax - xMin)) * PW,
    sy: M.t + (1 - (y - yMin) / (yMax - yMin)) * PH,
  });

  const axisY = Math.max(M.t, Math.min(SVG_H - M.b, toSvg(0, 0).sy));
  const axisX = Math.max(M.l, Math.min(SVG_W - M.r, toSvg(0, 0).sx));

  // Check if chosen delta satisfies the definition for given epsilon
  const { deltaWorks, maxDeviation } = useMemo(() => {
    let maxDev = 0;
    for (let i = 0; i <= 300; i++) {
      const x = (a - delta) + (i / 300) * (2 * delta);
      if (Math.abs(x - a) < 1e-9) continue;
      if (x <= xMin || x >= xMax) continue;
      const y = evalFn(fnExpr, x);
      if (y === null) continue;
      maxDev = Math.max(maxDev, Math.abs(y - initialL));
    }
    return { deltaWorks: maxDev < epsilon, maxDeviation: maxDev };
  }, [fnExpr, a, initialL, delta, epsilon, xMin, xMax]);

  // Curve path segments
  const segments = useMemo(() => {
    const segs: string[] = [];
    let current: string[] = [];
    for (const p of rawPoints) {
      if (p.y === null) {
        if (current.length > 1) segs.push(current.join(' '));
        current = [];
      } else {
        const { sx, sy } = toSvg(p.x, p.y);
        if (sy > M.t - 12 && sy < SVG_H - M.b + 12) {
          current.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
        } else {
          if (current.length > 1) segs.push(current.join(' '));
          current = [];
        }
      }
    }
    if (current.length > 1) segs.push(current.join(' '));
    return segs;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPoints, yMin, yMax]);

  // Coordinates for bands
  const { sx: ax, sy: ay } = toSvg(a, initialL);

  const dLeftSx  = Math.max(M.l, toSvg(a - delta, 0).sx);
  const dRightSx = Math.min(SVG_W - M.r, toSvg(a + delta, 0).sx);
  const dWidth   = Math.max(0, dRightSx - dLeftSx);

  const eTopSy = Math.max(M.t,          toSvg(0, initialL + epsilon).sy);
  const eBotSy = Math.min(SVG_H - M.b,  toSvg(0, initialL - epsilon).sy);
  const eHeight = Math.max(0, eBotSy - eTopSy);

  const goodColor  = { fill: 'rgba(16,185,129,0.09)', stroke: 'rgba(16,185,129,0.4)' };
  const badColor   = { fill: 'rgba(239,68,68,0.09)',  stroke: 'rgba(239,68,68,0.4)'  };
  const dColor = deltaWorks ? goodColor : badColor;

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragTarget, setDragTarget] = useState<'epsilon' | 'delta' | null>(null);

  const onSvgMove = useCallback((e: React.PointerEvent) => {
    if (!dragTarget || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (dragTarget === 'epsilon') {
      const relY = ((e.clientY - rect.top) / rect.height) * SVG_H;
      const newEp = Math.abs(initialL - (yMin + (1 - (relY - M.t) / PH) * (yMax - yMin)));
      setEpsilon(Math.max(0.05, Math.min(yMax - yMin, newEp)));
    }
    if (dragTarget === 'delta') {
      const relX = ((e.clientX - rect.left) / rect.width) * SVG_W;
      const xVal = xMin + ((relX - M.l) / PW) * (xMax - xMin);
      setDelta(Math.max(0.01, Math.min((xMax - xMin) / 2, Math.abs(xVal - a))));
    }
  }, [dragTarget, initialL, yMin, yMax, xMin, xMax, a]);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">
          ε-δ LIMIT · lim
        </span>
        <span className="text-[9px] text-zinc-600">x→{a}</span>
        <span className="text-[9px] text-zinc-600">f(x) = {initialL}</span>
        <span className={`ml-auto text-[9px] font-mono px-2 py-0.5 rounded border ${deltaWorks ? 'border-emerald-900/50 text-emerald-500 bg-emerald-950/20' : 'border-red-900/50 text-red-500 bg-red-950/20'}`}>
          {deltaWorks ? 'δ works ✓' : 'δ too large ✗'}
        </span>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full select-none"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onPointerMove={onSvgMove}
          onPointerUp={() => setDragTarget(null)}
          onPointerLeave={() => setDragTarget(null)}
          style={{ cursor: dragTarget ? 'crosshair' : 'default' }}
        >
          {/* ε band — horizontal strip */}
          <rect x={M.l} y={eTopSy} width={PW} height={eHeight}
            fill="rgba(59,130,246,0.07)" stroke="rgba(59,130,246,0.25)" strokeDasharray="2,2"
            onPointerDown={() => setDragTarget('epsilon')}
            style={{ cursor: 'ns-resize' }} />
          <text x={M.l + 2} y={eTopSy - 1.5} fill="#3b82f6" fontSize="5.5" fontFamily="monospace" opacity="0.8">L+ε</text>
          <text x={M.l + 2} y={eBotSy + 7}   fill="#3b82f6" fontSize="5.5" fontFamily="monospace" opacity="0.8">L-ε</text>

          {/* δ band — vertical strip */}
          <rect x={dLeftSx} y={M.t} width={dWidth} height={PH}
            fill={dColor.fill} stroke={dColor.stroke} strokeDasharray="2,2"
            onPointerDown={() => setDragTarget('delta')}
            style={{ cursor: 'ew-resize' }} />
          <text x={dLeftSx}  y={SVG_H - M.b + 9} fill="#a16207" fontSize="5.5" fontFamily="monospace" textAnchor="middle">a-δ</text>
          <text x={dRightSx} y={SVG_H - M.b + 9} fill="#a16207" fontSize="5.5" fontFamily="monospace" textAnchor="middle">a+δ</text>

          {/* Axes */}
          <line x1={M.l} y1={axisY} x2={SVG_W - M.r} y2={axisY} stroke="#27272a" strokeWidth="1" />
          <line x1={axisX} y1={M.t} x2={axisX} y2={SVG_H - M.b} stroke="#27272a" strokeWidth="1" />

          {/* Function curve */}
          {segments.map((pts, i) => (
            <polyline key={i} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" points={pts} />
          ))}

          {/* Point (a, L) — hollow circle (limit, might be removed) */}
          <circle cx={ax} cy={ay} r="4.5" fill="#070708" stroke="#f59e0b" strokeWidth="1.8" />
          <line x1={ax} y1={ay} x2={ax} y2={axisY} stroke="#a16207" strokeWidth="0.8" strokeDasharray="2,2" />
          <text x={ax} y={SVG_H - M.b + 9} fill="#a16207" fontSize="5.5" fontFamily="monospace" textAnchor="middle">a</text>

          {/* max deviation label */}
          <text x={SVG_W - M.r - 1} y={M.t + 9} fill="#52525b" fontSize="6" fontFamily="monospace" textAnchor="end">
            max|f-L| = {maxDeviation.toFixed(4)}
          </text>

          {/* drag hints */}
          {!dragTarget && (
            <text x={SVG_W / 2} y={SVG_H - 3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              drag blue band (ε) or green band (δ)
            </text>
          )}
        </svg>
      </div>

      <div className="space-y-1.5">
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Tolerance ε (how close to L)</span>
            <span className="text-blue-400 font-bold">ε = {epsilon.toFixed(3)}</span>
          </div>
          <input type="range" min="0.05" max="2" step="0.005" value={epsilon}
            onChange={e => setEpsilon(Number(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-900 h-1 rounded cursor-pointer" />
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Search radius δ (how close to a)</span>
            <span className={`font-bold text-[10px] ${deltaWorks ? 'text-emerald-400' : 'text-red-400'}`}>δ = {delta.toFixed(3)}</span>
          </div>
          <input type="range" min="0.01" max="2" step="0.005" value={delta}
            onChange={e => setDelta(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-900 h-1 rounded cursor-pointer" />
        </div>
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || `Goal: find δ > 0 such that 0 < |x − ${a}| < δ ⟹ |f(x) − ${initialL}| < ε. Shrink δ until band turns green.`}
      </div>
    </div>
  );
}

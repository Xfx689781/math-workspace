"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

function evalFn(expr: string, x: number): number | null {
  if (!expr) return null;
  try {
    const js = expr
      .replace(/\^/g, '**')
      .replace(/\barcsin\b/g, 'Math.asin')
      .replace(/\barccos\b/g, 'Math.acos')
      .replace(/\barctan\b/g, 'Math.atan')
      .replace(/\bsinh\b/g, 'Math.sinh')
      .replace(/\bcosh\b/g, 'Math.cosh')
      .replace(/\btanh\b/g, 'Math.tanh')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog2\b/g, 'Math.log2')
      .replace(/\blog10\b/g, 'Math.log10')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bfloor\b/g, 'Math.floor')
      .replace(/\bceil\b/g, 'Math.ceil')
      .replace(/\bPI\b/g, String(Math.PI))
      .replace(/\bpi\b/g, String(Math.PI))
      .replace(/\be\b/g, String(Math.E));
    // eslint-disable-next-line no-new-func
    const result = new Function('x', `"use strict"; return (${js});`)(x);
    if (!isFinite(result) || isNaN(result)) return null;
    return result;
  } catch {
    return null;
  }
}

const SAMPLES = 300;
const SVG_W = 300;
const SVG_H = 180;
const M = { l: 32, r: 12, t: 12, b: 20 };
const PW = SVG_W - M.l - M.r;
const PH = SVG_H - M.t - M.b;

export default function BasicsVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const fnExpr: string = params.fnExpression || 'sin(x)';
  const domain: [number, number] = params.domain || [-6.28, 6.28];
  const [xMin, xMax] = domain;

  const rawPoints = useMemo(() => {
    const pts: { x: number; y: number | null }[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (i / SAMPLES) * (xMax - xMin);
      pts.push({ x, y: evalFn(fnExpr, x) });
    }
    return pts;
  }, [fnExpr, xMin, xMax]);

  const validYs = rawPoints.filter(p => p.y !== null).map(p => p.y as number);
  const rawYMin = validYs.length ? Math.min(...validYs) : -1;
  const rawYMax = validYs.length ? Math.max(...validYs) : 1;
  const pad = (rawYMax - rawYMin) * 0.1 || 0.5;
  const [yMin, yMax] = params.yRange
    ? [params.yRange[0], params.yRange[1]]
    : [rawYMin - pad, rawYMax + pad];

  const toSvg = (x: number, y: number) => ({
    sx: M.l + ((x - xMin) / (xMax - xMin)) * PW,
    sy: M.t + (1 - (y - yMin) / (yMax - yMin)) * PH,
  });

  const segments = useMemo(() => {
    const segs: string[] = [];
    let current: string[] = [];
    for (const p of rawPoints) {
      if (p.y === null) {
        if (current.length > 1) segs.push(current.join(' '));
        current = [];
      } else {
        const { sx, sy } = toSvg(p.x, p.y);
        if (sy > M.t - 10 && sy < SVG_H - M.b + 10) {
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

  const [sliderIdx, setSliderIdx] = useState(Math.floor(SAMPLES / 2));
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const clientToIdx = useCallback((clientX: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * SVG_W;
    const idx = Math.round(((relX - M.l) / PW) * SAMPLES);
    setSliderIdx(Math.max(0, Math.min(SAMPLES, idx)));
  }, []);

  const onSvgDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    clientToIdx(e.clientX);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, [clientToIdx]);

  const onSvgMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    clientToIdx(e.clientX);
  }, [dragging, clientToIdx]);

  const stopDrag = useCallback(() => setDragging(false), []);

  const pt = rawPoints[sliderIdx];
  const x0 = pt.x;
  const y0 = pt.y;

  const yNext = rawPoints[Math.min(sliderIdx + 2, SAMPLES)].y;
  const yPrev = rawPoints[Math.max(sliderIdx - 2, 0)].y;
  const dx = (xMax - xMin) / SAMPLES;
  const slope = yNext !== null && yPrev !== null ? (yNext - yPrev) / (4 * dx) : null;

  const tangent = y0 !== null ? toSvg(x0, y0) : null;
  const axisY = Math.max(M.t, Math.min(SVG_H - M.b, toSvg(0, 0).sy));
  const axisX = Math.max(M.l, Math.min(SVG_W - M.r, toSvg(0, 0).sx));

  // Tangent line endpoints
  const tangentLine = tangent && slope !== null ? (() => {
    const halfSpan = (xMax - xMin) * 0.18;
    const x1 = x0 - halfSpan;
    const x2 = x0 + halfSpan;
    const y1 = y0! + slope * (-halfSpan);
    const y2 = y0! + slope * halfSpan;
    return { p1: toSvg(x1, y1), p2: toSvg(x2, y2) };
  })() : null;

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono text-xs text-zinc-400">
      <div className="text-[9px] text-zinc-600 tracking-widest uppercase mb-2 truncate">
        f(x) = {fnExpr}
      </div>

      <div className="flex-1 border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden min-h-[120px]">
        <svg
          ref={svgRef}
          className="w-full h-full select-none"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onPointerDown={onSvgDown}
          onPointerMove={onSvgMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
          style={{ cursor: dragging ? 'crosshair' : 'crosshair' }}
        >
          {/* Axes */}
          <line x1={M.l} y1={axisY} x2={SVG_W - M.r} y2={axisY} stroke="#27272a" strokeWidth="1" />
          <line x1={axisX} y1={M.t} x2={axisX} y2={SVG_H - M.b} stroke="#27272a" strokeWidth="1" />
          <text x={SVG_W - M.r + 2} y={axisY + 3} fill="#3f3f46" fontSize="6" fontFamily="monospace">x</text>
          <text x={axisX - 7} y={M.t - 1} fill="#3f3f46" fontSize="6" fontFamily="monospace">y</text>

          {/* Function curve */}
          {segments.map((pts, i) => (
            <polyline key={i} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" points={pts} />
          ))}

          {/* Tangent line */}
          {tangentLine && (
            <line
              x1={tangentLine.p1.sx} y1={tangentLine.p1.sy}
              x2={tangentLine.p2.sx} y2={tangentLine.p2.sy}
              stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2" opacity="0.7"
            />
          )}

          {/* Tangent point + derivative label */}
          {tangent && (
            <>
              <circle cx={tangent.sx} cy={tangent.sy} r="3.5" fill="#f59e0b" />
              {slope !== null && (
                <text x={tangent.sx + 6} y={tangent.sy - 4} fill="#f59e0b" fontSize="6.5" fontFamily="monospace">
                  f&apos;≈{slope.toFixed(2)}
                </text>
              )}
            </>
          )}

          {/* Click hint */}
          <text x={SVG_W / 2} y={SVG_H - 3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
            click or drag to move tangent
          </text>
        </svg>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-zinc-500">Tangent x₀ <span className="text-zinc-700">(click curve above)</span></span>
          <span className="text-zinc-300">
            x={x0.toFixed(2)}{y0 !== null ? `  f(x)=${y0.toFixed(3)}` : ''}
          </span>
        </div>
        <input
          type="range" min="0" max={SAMPLES} value={sliderIdx}
          onChange={(e) => setSliderIdx(Number(e.target.value))}
          className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}

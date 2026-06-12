"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

function evalSeq(expr: string, x: number, n: number): number | null {
  if (!expr) return null;
  try {
    const js = expr
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bpi\b/g, String(Math.PI));
    // eslint-disable-next-line no-new-func
    const result = new Function('x', 'n', `"use strict"; return (${js});`)(x, n);
    if (!isFinite(result) || isNaN(result)) return null;
    return result;
  } catch {
    return null;
  }
}

const SAMPLES = 120;
const SVG_W = 300;
const SVG_H = 160;
const M = { l: 32, r: 12, t: 10, b: 18 };

export default function AnalysisVisualizer({ data }: { data: any }) {
  const [n, setN] = useState(4);
  const [epsilon, setEpsilon] = useState(0.12);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const params = data?.params || {};
  const fnExpr: string = params.fnExpression || 'x**n';
  const domain: [number, number] = params.domain || [0, 1];
  const [xMin, xMax] = domain;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (i / SAMPLES) * (xMax - xMin);
      const y = evalSeq(fnExpr, x, n);
      if (y === null) continue;
      const sx = M.l + ((x - xMin) / (xMax - xMin)) * (SVG_W - M.l - M.r);
      const sy = M.t + (1 - Math.max(0, Math.min(1, y))) * (SVG_H - M.t - M.b);
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [fnExpr, n, xMin, xMax]);

  const plotH = SVG_H - M.t - M.b;
  const plotW = SVG_W - M.l - M.r;
  const epY = M.t + (1 - epsilon) * plotH;
  const epHeight = epsilon * plotH * 2;
  const axisY = M.t + plotH;

  const clientToEpsilon = useCallback((clientY: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relY = ((clientY - rect.top) / rect.height) * SVG_H;
    const ep = 1 - (relY - M.t) / plotH;
    setEpsilon(Math.max(0.02, Math.min(0.48, ep)));
  }, [plotH]);

  const onBandDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    clientToEpsilon(e.clientY);
  }, [clientToEpsilon]);

  const onSvgMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    clientToEpsilon(e.clientY);
  }, [dragging, clientToEpsilon]);

  const stopDrag = useCallback(() => setDragging(false), []);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono text-xs text-zinc-400 gap-3">
      <div className="text-[9px] text-zinc-600 tracking-widest uppercase">
        SEQUENCE: f_n(x) = {fnExpr.replace(/\*\*/g, '^')}
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full select-none"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onPointerMove={onSvgMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
          style={{ cursor: dragging ? 'ns-resize' : 'default' }}
        >
          {/* Axes */}
          <line x1={M.l} y1={axisY} x2={SVG_W - M.r} y2={axisY} stroke="#27272a" strokeWidth="1" />
          <line x1={M.l} y1={M.t} x2={M.l} y2={axisY} stroke="#27272a" strokeWidth="1" />
          <text x={SVG_W - M.r + 2} y={axisY + 3} fill="#3f3f46" fontSize="6" fontFamily="monospace">x</text>
          <text x="4" y={M.t + 4} fill="#3f3f46" fontSize="6" fontFamily="monospace">1</text>

          {/* ε-tube band — draggable */}
          <rect
            x={M.l} y={epY}
            width={plotW} height={epHeight}
            fill={dragging ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.05)'}
            stroke="rgba(59,130,246,0.3)"
            strokeDasharray="3,3"
            onPointerDown={onBandDown}
            style={{ cursor: 'ns-resize' }}
          />
          {/* Top edge handle */}
          <line x1={M.l} y1={epY} x2={SVG_W - M.r} y2={epY}
            stroke="rgba(59,130,246,0.5)" strokeWidth="2"
            onPointerDown={onBandDown}
            style={{ cursor: 'ns-resize' }}
          />
          <text x={M.l + 2} y={epY - 2} fill="#3b82f6" fontSize="6" fontFamily="monospace" opacity="0.7">+ε</text>
          <text x={M.l + 2} y={epY + epHeight + 7} fill="#3b82f6" fontSize="6" fontFamily="monospace" opacity="0.7">-ε</text>

          {/* Limit function: f(x) = 0 (dashed) */}
          <line x1={M.l} y1={axisY} x2={SVG_W - M.r} y2={axisY} stroke="#52525b" strokeWidth="1" strokeDasharray="3,3" />

          {/* f_n(x) curve */}
          {path && (
            <polyline fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" points={path} />
          )}

          <text x={SVG_W - 38} y={M.t + 8} fill="#ef4444" fontSize="6" fontFamily="monospace">f_n(x)</text>
          <text x={SVG_W - 38} y={axisY - 4} fill="#52525b" fontSize="6" fontFamily="monospace">f(x)=0</text>

          {/* Drag hint */}
          {!dragging && (
            <text x={SVG_W / 2} y={SVG_H - 3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              drag ε-band
            </text>
          )}
        </svg>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Sequence index n</span>
            <span className="text-red-400 font-bold">n = {n}</span>
          </div>
          <input
            type="range" min="1" max="24" value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-900 h-1 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Tolerance ε <span className="text-zinc-700">(or drag band)</span></span>
            <span className="text-blue-400 font-bold">ε = {epsilon.toFixed(2)}</span>
          </div>
          <input
            type="range" min="0.02" max="0.48" step="0.01" value={epsilon}
            onChange={(e) => setEpsilon(Number(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-900 h-1 rounded cursor-pointer"
          />
        </div>

        <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-2">
          {params.note || 'Drag n: curve approaches limit. Does it stay inside ε-tube everywhere?'}
        </div>
      </div>
    </div>
  );
}

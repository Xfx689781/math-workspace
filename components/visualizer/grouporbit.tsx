"use client";
import { useState, useMemo, useEffect, useRef } from 'react';

const SVG_W = 300;
const SVG_H = 200;
const CX = 148;
const CY = 98;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function elementOrder(k: number, n: number): number {
  return k === 0 ? 1 : n / gcd(k, n);
}

const PALETTE: Record<number, string> = {
  1: '#f59e0b', 2: '#ef4444', 3: '#3b82f6', 4: '#a855f7',
  5: '#22c55e', 6: '#f97316', 7: '#ec4899', 8: '#14b8a6',
  9: '#8b5cf6', 10: '#06b6d4', 11: '#84cc16', 12: '#f43f5e',
};
function ocolor(ord: number): string {
  return PALETTE[Math.min(ord, 12)] || '#71717a';
}

// Quadratic Bézier arc from dot edge to dot edge, curving outward from center
function arcData(x1: number, y1: number, x2: number, y2: number, DR: number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ddx = mx - CX, ddy = my - CY;
  const L = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
  const push = 18;
  const qx = mx + (ddx / L) * push, qy = my + (ddy / L) * push;
  // Tangent direction at end
  const angle = Math.atan2(y2 - qy, x2 - qx);
  // Tip: slightly inside the target dot edge
  const tipX = x2 - (DR + 1.5) * Math.cos(angle);
  const tipY = y2 - (DR + 1.5) * Math.sin(angle);
  const startX = x1 + (DR + 1.5) * Math.cos(Math.atan2(y1 - CY, x1 - CX));
  const startY = y1 + (DR + 1.5) * Math.sin(Math.atan2(y1 - CY, x1 - CX));
  return {
    d: `M${startX.toFixed(1)},${startY.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}`,
    angle, tipX, tipY,
  };
}

export default function GroupOrbitVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const initN = Math.max(2, Math.min(12, Math.round(params.n ?? 6)));

  const [n, setN] = useState(initN);
  const [selected, setSelected] = useState<number | null>(
    typeof params.highlightElement === 'number' ? Number(params.highlightElement) : null
  );
  const [animIdx, setAnimIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const R  = Math.max(60, 86 - n * 1.8);
  const DR = Math.max(5.5, 10.5 - n * 0.42);

  const elements = useMemo(() =>
    Array.from({ length: n }, (_, k) => {
      const a = (2 * Math.PI * k) / n - Math.PI / 2;
      return { k, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), ord: elementOrder(k, n) };
    })
  , [n, R]);

  // Cyclic subgroup ⟨selected⟩ = { 0, k, 2k, ..., (ord-1)k }
  const orbit = useMemo(() => {
    if (selected === null || selected === 0) return [];
    const orb: number[] = [];
    let c = 0;
    do { orb.push(c); c = (c + selected) % n; } while (c !== 0);
    return orb;
  }, [selected, n]);

  // Animate: advance current step through orbit
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (orbit.length <= 1) { setAnimIdx(0); return; }
    setAnimIdx(0);
    timerRef.current = setInterval(() => setAnimIdx(p => (p + 1) % orbit.length), 700);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [orbit]);

  const handleClick = (k: number) => setSelected(p => p === k ? null : k);

  const orbitSet = new Set(orbit);
  const selectedEl = selected !== null ? elements[selected] : null;
  const curEl = orbit.length > 0 ? elements[orbit[animIdx]] : null;
  const nextEl = orbit.length > 0 ? elements[orbit[(animIdx + 1) % orbit.length]] : null;

  const orderDist = useMemo(() => {
    const counts: Record<number, number> = {};
    elements.forEach(e => { counts[e.ord] = (counts[e.ord] || 0) + 1; });
    return Object.entries(counts).map(([o, c]) => ({ ord: Number(o), cnt: c })).sort((a, b) => a.ord - b.ord);
  }, [elements]);

  const arcColor = selectedEl ? ocolor(selectedEl.ord) : '#52525b';

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">GROUP ORBIT</span>
        <span className="text-[9px] text-zinc-200 font-bold">{params.label || `ℤ/${n}ℤ`}</span>
        {selectedEl ? (
          <span className="ml-auto text-[9px] text-zinc-500">
            ord({selected}) = {selectedEl.ord} · orbit size {orbit.length}
          </span>
        ) : (
          <span className="ml-auto text-[9px] text-zinc-700">click element to animate orbit</span>
        )}
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full select-none">
          {/* Reference circles */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1d1d20" strokeWidth="0.7" />
          <circle cx={CX} cy={CY} r={R * 0.48} fill="none" stroke="#131316" strokeWidth="0.5" strokeDasharray="2,5" />

          {/* Orbit polygon fill */}
          {orbit.length >= 3 && (
            <polygon
              points={orbit.map(k => `${elements[k].x.toFixed(1)},${elements[k].y.toFixed(1)}`).join(' ')}
              fill={arcColor} opacity="0.07"
            />
          )}

          {/* Orbit arcs with arrowheads */}
          {orbit.map((from, i) => {
            const to = orbit[(i + 1) % orbit.length];
            const fe = elements[from], te = elements[to];
            const isActive = i === animIdx;
            const { d, angle, tipX, tipY } = arcData(fe.x, fe.y, te.x, te.y, DR);
            const al = 7, aa = Math.PI / 5.5;
            return (
              <g key={i} opacity={isActive ? 1 : 0.3}>
                <path d={d} fill="none" stroke={arcColor} strokeWidth={isActive ? 2.2 : 1.2} strokeLinecap="round" />
                <line x1={tipX} y1={tipY}
                  x2={tipX - al * Math.cos(angle - aa)} y2={tipY - al * Math.sin(angle - aa)}
                  stroke={arcColor} strokeWidth={isActive ? 1.8 : 1} strokeLinecap="round" />
                <line x1={tipX} y1={tipY}
                  x2={tipX - al * Math.cos(angle + aa)} y2={tipY - al * Math.sin(angle + aa)}
                  stroke={arcColor} strokeWidth={isActive ? 1.8 : 1} strokeLinecap="round" />
              </g>
            );
          })}

          {/* Elements */}
          {elements.map(el => {
            const isSel = selected === el.k;
            const inOrbit = orbitSet.has(el.k);
            const isAnim = curEl?.k === el.k;
            const col = ocolor(el.ord);
            const fade = selected !== null && !inOrbit ? 0.18 : 0.92;

            return (
              <g key={el.k} onClick={() => handleClick(el.k)} style={{ cursor: 'pointer' }}>
                {/* Animated pulse ring */}
                {isAnim && orbit.length > 1 && (
                  <circle cx={el.x} cy={el.y} r={DR + 6} fill={col} opacity="0.18" />
                )}
                {/* Selection ring */}
                {isSel && (
                  <circle cx={el.x} cy={el.y} r={DR + 3.5} fill="none"
                    stroke={col} strokeWidth="1.5" opacity="0.6" />
                )}
                {/* Main dot */}
                <circle cx={el.x} cy={el.y}
                  r={isSel ? DR + 1.5 : isAnim ? DR + 1 : DR}
                  fill={col} opacity={fade}
                />
                {/* Element index label */}
                <text x={el.x} y={el.y + 2.8} fill="white"
                  fontSize={DR > 7 ? 7.5 : 6} textAnchor="middle"
                  fontWeight="bold" style={{ pointerEvents: 'none' }}>
                  {el.k}
                </text>
                {/* Order label outside the ring */}
                {n <= 9 && (
                  <text
                    x={CX + (R + DR + 7) * Math.cos((2 * Math.PI * el.k) / n - Math.PI / 2)}
                    y={CY + (R + DR + 7) * Math.sin((2 * Math.PI * el.k) / n - Math.PI / 2) + 2}
                    fill={col} fontSize="5.5" textAnchor="middle"
                    opacity={fade * 0.75} style={{ pointerEvents: 'none' }}>
                    {el.k === 0 ? 'e' : el.ord}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center group label */}
          <text x={CX} y={CY + 4} fill="#3f3f46" fontSize="8.5"
            textAnchor="middle" fontFamily="monospace">
            {params.label || `ℤ/${n}ℤ`}
          </text>

          {/* Animated step label */}
          {curEl && nextEl && orbit.length > 1 && (
            <text x={SVG_W / 2} y={SVG_H - 4} fill="#52525b" fontSize="5.5"
              fontFamily="monospace" textAnchor="middle">
              {curEl.k} + {selected} ≡ {nextEl.k} (mod {n})
            </text>
          )}
          {!selected && (
            <text x={SVG_W / 2} y={SVG_H - 4} fill="#3f3f46" fontSize="5.5"
              fontFamily="monospace" textAnchor="middle">
              numbers outside ring = element order
            </text>
          )}
        </svg>
      </div>

      {/* n-slider */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 w-20 shrink-0">Group order n</span>
        <input type="range" min="2" max="12" value={n}
          onChange={e => { setN(Number(e.target.value)); setSelected(null); }}
          className="flex-1 accent-blue-500 h-1 bg-zinc-900 rounded cursor-pointer" />
        <span className="text-[9px] text-zinc-300 font-bold w-8 text-right">n={n}</span>
      </div>

      {/* Order distribution chips */}
      <div className="flex gap-1 flex-wrap">
        {orderDist.map(({ ord, cnt }) => (
          <div key={ord} style={{ borderColor: ocolor(ord) + '40' }}
            className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-zinc-900/20">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ocolor(ord) }} />
            <span className="text-[8px] text-zinc-500">
              ord {ord} × {cnt}
            </span>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {selectedEl
          ? selectedEl.ord === 1
            ? `Identity element e: trivially torsion with order 1.`
            : selectedEl.ord === n
            ? `Element ${selected} is a generator — ord(${selected}) = n = ${n}. Generates all of ℤ/${n}ℤ. Watch it cycle through every element.`
            : `Element ${selected}: ord(${selected}) = ${n}/gcd(${selected},${n}) = ${selectedEl.ord}. Generates the subgroup {${orbit.join(', ')}} ≅ ℤ/${selectedEl.ord}ℤ of index ${n / selectedEl.ord}.`
          : (params.note || `Every element k ∈ ℤ/${n}ℤ satisfies ${n}k = 0, so every element is a torsion element. The numbers outside the ring show each element's order.`)}
      </div>
    </div>
  );
}

"use client";

interface Morphism {
  from: number;
  to: number;
  label: string;
}

export default function AlgebraVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const objects: string[] = params.objects?.length ? params.objects : ['A', 'B', 'C'];
  const morphisms: Morphism[] = params.morphisms?.length
    ? params.morphisms
    : [{ from: 0, to: 1, label: 'f' }, { from: 1, to: 2, label: 'g' }];
  const seqLabel: string = params.label || 'Morphism Sequence';
  const isExact: boolean = params.isExact || false;

  // Layout: evenly space objects horizontally in SVG
  const SVG_W = 320;
  const SVG_H = 120;
  const nodeY = SVG_H / 2;
  const nodeR = 18;
  const usableW = SVG_W - 40;
  const spacing = objects.length > 1 ? usableW / (objects.length - 1) : 0;
  const nodeX = (i: number) => 20 + i * spacing;

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 p-4 font-mono">
      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
        {seqLabel}{isExact && <span className="ml-2 text-emerald-500">EXACT</span>}
      </div>

      <div className="flex-1 flex items-center justify-center border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ maxHeight: '140px' }}
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Draw morphism arrows */}
          {morphisms.map((m, i) => {
            if (m.from >= objects.length || m.to >= objects.length) return null;
            const x1 = nodeX(m.from) + nodeR + 2;
            const x2 = nodeX(m.to) - nodeR - 2;
            const midX = (x1 + x2) / 2;
            const curveY = nodeY - 18;
            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${nodeY} Q ${midX} ${curveY} ${x2} ${nodeY}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={midX}
                  y={curveY - 4}
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="9"
                  fontFamily="monospace"
                  fontStyle="italic"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Draw object nodes */}
          {objects.map((obj, i) => (
            <g key={i}>
              <circle
                cx={nodeX(i)}
                cy={nodeY}
                r={nodeR}
                fill="#09090b"
                stroke={i === 0 || i === objects.length - 1 ? '#3f3f46' : '#3b82f6'}
                strokeWidth="1.2"
              />
              <text
                x={nodeX(i)}
                y={nodeY + 4}
                textAnchor="middle"
                fill={i === 0 || i === objects.length - 1 ? '#52525b' : '#93c5fd'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {obj}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 text-[9px] text-zinc-700 text-center">
        {objects.join(' → ')}
      </div>
    </div>
  );
}

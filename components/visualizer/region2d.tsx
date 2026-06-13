"use client";

type Boundary = 'solid' | 'dashed' | 'dotted' | 'none';
type RegionType = 'disk' | 'annulus' | 'rect' | 'curve' | 'point' | 'half-plane' | 'complement-disk';
type VColor = 'green' | 'red' | 'amber' | 'neutral';

interface Region {
  type: RegionType;
  label?: string;
  cx?: number; cy?: number;
  r?: number;   // outer radius (disk) or outer (annulus)
  r2?: number;  // inner radius (annulus)
  x1?: number; y1?: number; x2?: number; y2?: number;
  axis?: 'x' | 'y'; side?: 'gt' | 'lt'; val?: number;
  filled?: boolean;
  boundary?: Boundary;
  color?: string;
  verdict?: string;
  verdictColor?: VColor;
}

const PW = 124, PH = 100;
const OX = PW / 2, OY = PH / 2;
const SC = 40; // pixels per unit

function sv(x: number, y: number): [number, number] {
  return [OX + x * SC, OY - y * SC];
}

const FULL_H = PH + 34;

function Grid() {
  return (
    <>
      {[-2, -1, 0, 1, 2].map(n => {
        const gx = OX + n * SC, gy = OY - n * SC;
        const ax = n === 0;
        return (
          <g key={n}>
            <line x1={gx} y1={1} x2={gx} y2={PH - 1}
              stroke={ax ? '#27272a' : '#131316'} strokeWidth={ax ? 0.7 : 0.35}/>
            <line x1={1} y1={gy} x2={PW - 1} y2={gy}
              stroke={ax ? '#27272a' : '#131316'} strokeWidth={ax ? 0.7 : 0.35}/>
          </g>
        );
      })}
    </>
  );
}

function Shape({ reg, idx }: { reg: Region; idx: number }) {
  const col    = reg.color || '#3b82f6';
  const scol   = reg.color ? reg.color : '#60a5fa';
  const dArr   = reg.boundary === 'dashed' ? '5,3.5'
               : reg.boundary === 'dotted' ? '1.5,3'
               : undefined;
  const sw     = reg.boundary === 'none' ? 0 : 1.8;
  const fillOp = reg.filled !== false ? 0.28 : 0;

  if (reg.type === 'disk') {
    const r = (reg.r ?? 1) * SC;
    const [cx, cy] = sv(reg.cx ?? 0, reg.cy ?? 0);
    return (
      <>
        <circle cx={cx} cy={cy} r={r} fill={col} fillOpacity={fillOp}/>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
      </>
    );
  }

  if (reg.type === 'curve') {
    const r = (reg.r ?? 1) * SC;
    const [cx, cy] = sv(reg.cx ?? 0, reg.cy ?? 0);
    return (
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
    );
  }

  if (reg.type === 'annulus') {
    const r1 = (reg.r ?? 0.5) * SC;
    const r2 = (reg.r2 ?? 1) * SC;
    const [cx, cy] = sv(reg.cx ?? 0, reg.cy ?? 0);
    const maskId = `ann-${idx}`;
    const dArr2 = reg.boundary === 'dashed' ? '5,3.5' : undefined;
    return (
      <g>
        <defs>
          <mask id={maskId}>
            <rect x={0} y={0} width={PW} height={PH} fill="black"/>
            <circle cx={cx} cy={cy} r={r2} fill="white"/>
            <circle cx={cx} cy={cy} r={r1} fill="black"/>
          </mask>
        </defs>
        <rect x={0} y={0} width={PW} height={PH}
          fill={col} fillOpacity={fillOp} mask={`url(#${maskId})`}/>
        <circle cx={cx} cy={cy} r={r2} fill="none"
          stroke={scol} strokeWidth={sw} strokeDasharray={dArr2}/>
        <circle cx={cx} cy={cy} r={r1} fill="none"
          stroke={scol} strokeWidth={sw} strokeDasharray={dArr2}/>
      </g>
    );
  }

  if (reg.type === 'complement-disk') {
    const r = (reg.r ?? 1) * SC;
    const [cx, cy] = sv(reg.cx ?? 0, reg.cy ?? 0);
    const clipId = `cdisk-${idx}`;
    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={PW} height={PH}/>
          </clipPath>
          <mask id={`cdmask-${idx}`}>
            <rect x={0} y={0} width={PW} height={PH} fill="white"/>
            <circle cx={cx} cy={cy} r={r} fill="black"/>
          </mask>
        </defs>
        <rect x={0} y={0} width={PW} height={PH}
          fill={col} fillOpacity={fillOp}
          mask={`url(#cdmask-${idx})`} clipPath={`url(#${clipId})`}/>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
      </g>
    );
  }

  if (reg.type === 'rect') {
    const [x1s, y1s] = sv(reg.x1 ?? -1, reg.y1 ?? 1);
    const [x2s, y2s] = sv(reg.x2 ?? 1, reg.y2 ?? -1);
    return (
      <rect
        x={Math.min(x1s, x2s)} y={Math.min(y1s, y2s)}
        width={Math.abs(x2s - x1s)} height={Math.abs(y2s - y1s)}
        fill={col} fillOpacity={fillOp}
        stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
    );
  }

  if (reg.type === 'point') {
    const [cx, cy] = sv(reg.cx ?? 0, reg.cy ?? 0);
    return <circle cx={cx} cy={cy} r={3.5} fill={scol}/>;
  }

  if (reg.type === 'half-plane') {
    const isX = reg.axis !== 'y';
    const val = (reg.val ?? 0) * SC;
    const gt  = reg.side !== 'lt';
    if (isX) {
      const fx = gt ? OX + val : 0;
      const fw = gt ? PW - (OX + val) : OX + val;
      return (
        <>
          <rect x={fx} y={0} width={Math.max(0, fw)} height={PH}
            fill={col} fillOpacity={fillOp}/>
          <line x1={OX + val} y1={0} x2={OX + val} y2={PH}
            stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
        </>
      );
    } else {
      const fy = gt ? 0 : OY + val;
      const fh = gt ? OY - val : PH - (OY - val);
      return (
        <>
          <rect x={0} y={fy} width={PW} height={Math.max(0, fh)}
            fill={col} fillOpacity={fillOp}/>
          <line x1={0} y1={OY - val} x2={PW} y2={OY - val}
            stroke={scol} strokeWidth={sw} strokeDasharray={dArr}/>
        </>
      );
    }
  }

  return null;
}

const VC: Record<VColor, { text: string; bg: string }> = {
  green:   { text: '#22c55e', bg: '#14532d' },
  red:     { text: '#ef4444', bg: '#7f1d1d' },
  amber:   { text: '#f59e0b', bg: '#78350f' },
  neutral: { text: '#71717a', bg: '#27272a' },
};

function Panel({ reg, idx }: { reg: Region; idx: number }) {
  const vc = VC[reg.verdictColor || 'neutral'];
  return (
    <svg viewBox={`0 0 ${PW} ${FULL_H}`} className="w-full" overflow="visible">
      <defs/>
      <rect x={0.5} y={0.5} width={PW - 1} height={PH - 1} rx={5}
        fill="#040407" stroke="#1f1f27" strokeWidth="0.8"/>
      <Grid/>
      <Shape reg={reg} idx={idx}/>

      {/* Label */}
      <text x={PW / 2} y={PH + 12} textAnchor="middle"
        fill="#52525b" fontSize="7.5" fontFamily="monospace">
        {reg.label || ''}
      </text>

      {/* Verdict */}
      {reg.verdict && (
        <>
          <rect x={PW / 2 - 34} y={PH + 18} width={68} height={13} rx={3}
            fill={vc.bg + '28'} stroke={vc.text + '45'} strokeWidth="0.7"/>
          <text x={PW / 2} y={PH + 27.5} textAnchor="middle"
            fill={vc.text} fontSize="7" fontFamily="monospace" fontWeight="bold">
            {reg.verdict}
          </text>
        </>
      )}
    </svg>
  );
}

export default function Region2DVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const regions: Region[] = Array.isArray(params.regions) ? params.regions : [];
  if (!regions.length) return null;

  const cols = Math.min(regions.length, 4);

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">REGION ANALYSIS</span>
        {params.label && (
          <span className="text-[9px] text-zinc-200 font-bold">{params.label}</span>
        )}
      </div>

      <div className="flex-1 grid gap-2 items-center"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {regions.slice(0, 4).map((reg, i) => (
          <Panel key={i} reg={reg} idx={i}/>
        ))}
      </div>

      {params.note && (
        <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
          {params.note}
        </div>
      )}
    </div>
  );
}

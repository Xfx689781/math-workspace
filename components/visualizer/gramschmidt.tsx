"use client";
import { useState, useMemo, useRef, useCallback } from 'react';

type V2 = [number, number];

const vecLen = (v: V2) => Math.sqrt(v[0]*v[0]+v[1]*v[1]);
const vecNorm = (v: V2): V2 => { const l = vecLen(v); return l > 1e-9 ? [v[0]/l,v[1]/l] : [1,0]; };
const vecDot = (a: V2, b: V2) => a[0]*b[0]+a[1]*b[1];
const vecScale = (v: V2, s: number): V2 => [v[0]*s,v[1]*s];
const vecSub = (a: V2, b: V2): V2 => [a[0]-b[0],a[1]-b[1]];

const SVG_W = 300, SVG_H = 190, OX = 150, OY = 97, SCALE = 52;

function sv(x: number, y: number): [number, number] {
  return [OX + x*SCALE, OY - y*SCALE];
}
function dv(sx: number, sy: number): V2 {
  return [(sx - OX)/SCALE, (OY - sy)/SCALE];
}

function Arrow({ x1,y1,x2,y2,color,dashed=false,width=2 }: {
  x1:number;y1:number;x2:number;y2:number;color:string;dashed?:boolean;width?:number;
}) {
  const dx = x2-x1, dy = y2-y1;
  if (Math.hypot(dx,dy) < 3) return null;
  const ang = Math.atan2(dy,dx), al = 8, aa = Math.PI/6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeDasharray={dashed?'4,3':undefined} strokeLinecap="round"/>
      <line x1={x2} y1={y2}
        x2={x2-al*Math.cos(ang-aa)} y2={y2-al*Math.sin(ang-aa)}
        stroke={color} strokeWidth={Math.max(1,width*0.75)} strokeLinecap="round"/>
      <line x1={x2} y1={y2}
        x2={x2-al*Math.cos(ang+aa)} y2={y2-al*Math.sin(ang+aa)}
        stroke={color} strokeWidth={Math.max(1,width*0.75)} strokeLinecap="round"/>
    </g>
  );
}

function RightAngleMark({ x,y,e1,e2,sz=10,color='#52525b' }: {
  x:number;y:number;e1:V2;e2:V2;sz?:number;color?:string;
}) {
  const e1s: V2 = [e1[0]*sz, -e1[1]*sz];
  const e2s: V2 = [e2[0]*sz, -e2[1]*sz];
  return (
    <polyline
      points={`${x+e1s[0]},${y+e1s[1]} ${x+e1s[0]+e2s[0]},${y+e1s[1]+e2s[1]} ${x+e2s[0]},${y+e2s[1]}`}
      fill="none" stroke={color} strokeWidth="1.2"/>
  );
}

function Grid() {
  const TICKS = [-2,-1,0,1,2];
  return (
    <>
      {TICKS.map(n => {
        const gxv = sv(n,0)[0];
        const gyv = sv(0,n)[1];
        const axis = n === 0;
        return (
          <g key={n}>
            <line x1={gxv} y1={6} x2={gxv} y2={SVG_H-6}
              stroke={axis?'#27272a':'#131316'} strokeWidth={axis?0.8:0.4}/>
            <line x1={6} y1={gyv} x2={SVG_W-6} y2={gyv}
              stroke={axis?'#27272a':'#131316'} strokeWidth={axis?0.8:0.4}/>
            {n !== 0 && <>
              <text x={gxv} y={OY+9} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">{n}</text>
              <text x={OX-3} y={gyv+2} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="end">{n}</text>
            </>}
          </g>
        );
      })}
      <text x={SVG_W-9} y={OY+9} fill="#3f3f46" fontSize="6" fontFamily="monospace">x</text>
      <text x={OX+3} y={10} fill="#3f3f46" fontSize="6" fontFamily="monospace">y</text>
      <circle cx={OX} cy={OY} r={SCALE} fill="none" stroke="#1a1a1f" strokeDasharray="2,5" strokeWidth="0.6"/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE: projection  — proj of v onto a 1D subspace W = span{w}
// ─────────────────────────────────────────────────────────────────────────────
function ProjectionMode({ data }: { data: any }) {
  const params = data?.params || {};
  const wDir: V2 = params.w || [1.2, 0.4];
  const initV: V2 = params.v || [0.8, 1.3];
  const [v, setV] = useState<V2>(initV);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const ŵ = vecNorm(wDir);
  const projScalar = vecDot(v, ŵ);
  const projV: V2 = vecScale(ŵ, projScalar);
  const comp: V2 = vecSub(v, projV);
  const compLen = vecLen(comp);
  const compDir: V2 = compLen > 1e-9 ? vecNorm(comp) : [-ŵ[1], ŵ[0]];

  const [vx,vy]  = sv(v[0],v[1]);
  const [prx,pry] = sv(projV[0],projV[1]);
  const EXT = 2.5;
  const [wn1x,wn1y] = sv(-ŵ[0]*EXT,-ŵ[1]*EXT);
  const [wp1x,wp1y] = sv(ŵ[0]*EXT,ŵ[1]*EXT);

  const onDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
    const sx = ((e.clientX-r.left)/r.width)*SVG_W, sy = ((e.clientY-r.top)/r.height)*SVG_H;
    if (Math.hypot(sx-vx,sy-vy) < 14) {
      setDragging(true);
      (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    }
  }, [vx,vy]);

  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const [nx,ny] = dv(((e.clientX-r.left)/r.width)*SVG_W, ((e.clientY-r.top)/r.height)*SVG_H);
    const c: V2 = [Math.max(-2.3,Math.min(2.3,nx)), Math.max(-1.7,Math.min(1.7,ny))];
    if (vecLen(c) > 0.15) setV(c);
  }, [dragging]);

  const distToW = Math.abs(vecDot(v, [-ŵ[1],ŵ[0]])); // distance from v to the line W

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">PROJECTION</span>
        <span className="text-[9px] text-zinc-200 font-bold">{params.label || 'Projection onto W'}</span>
        <span className="ml-auto text-[9px] text-zinc-700">drag v</span>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full select-none"
          style={{ cursor: dragging ? 'crosshair' : 'default' }}
          onPointerDown={onDown} onPointerMove={onMove}
          onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)}>
          <Grid/>

          {/* Subspace W as extended line */}
          <line x1={wn1x} y1={wn1y} x2={wp1x} y2={wp1y}
            stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
          <text x={wp1x-8} y={wp1y-7} fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.85">W</text>

          {/* proj_W(v) arrow (amber) */}
          <Arrow x1={OX} y1={OY} x2={prx} y2={pry} color="#f59e0b" width={2.5}/>

          {/* Perpendicular component: proj tip → v tip (green dashed) */}
          <line x1={prx} y1={pry} x2={vx} y2={vy}
            stroke="#22c55e" strokeWidth="2" strokeDasharray="4,3" strokeLinecap="round"/>

          {/* Right angle mark at proj tip (between W dir and comp dir) */}
          {compLen > 0.12 && (
            <RightAngleMark x={prx} y={pry} e1={ŵ} e2={compDir} sz={9} color="#52525b"/>
          )}

          {/* v arrow (purple, draggable) */}
          <Arrow x1={OX} y1={OY} x2={vx} y2={vy} color="#a855f7" width={2.5}/>
          <circle cx={vx} cy={vy} r={9} fill="transparent" stroke="#a855f7" strokeWidth="0.8"
            opacity="0.5" style={{ cursor: 'move' }}/>

          {/* Labels */}
          <text x={vx+7} y={vy-5} fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">v</text>
          <text x={prx+(prx>OX?6:-32)} y={pry-6} fill="#fcd34d" fontSize="6.5" fontFamily="monospace">proj_W(v)</text>
          {compLen > 0.2 && (
            <text x={(prx+vx)/2+5} y={(pry+vy)/2+2} fill="#4ade80" fontSize="6.5" fontFamily="monospace" opacity="0.85">v−proj ∈ W⊥</text>
          )}

          {!dragging && (
            <text x={SVG_W/2} y={SVG_H-3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              drag v · proj minimizes ‖v − w‖ over w ∈ W
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
        <div className="bg-zinc-900/40 border border-amber-900/30 rounded-lg p-2">
          <div className="text-amber-600/70 mb-0.5">proj_W(v)</div>
          <div className="text-amber-300 font-bold">({projV[0].toFixed(2)}, {projV[1].toFixed(2)})</div>
        </div>
        <div className="bg-zinc-900/40 border border-green-900/30 rounded-lg p-2">
          <div className="text-green-600/70 mb-0.5">‖v − proj‖</div>
          <div className="text-green-300 font-bold">{compLen.toFixed(3)}</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-600 mb-0.5">⟨v, ŵ⟩</div>
          <div className="text-zinc-200 font-bold">{projScalar.toFixed(3)}</div>
        </div>
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || 'proj_W(v) is the unique closest point in W to v. The error v − proj_W(v) is always perpendicular to W (right angle mark).'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE: complement  — W and W⊥, orthogonal direct sum V = W ⊕ W⊥
// ─────────────────────────────────────────────────────────────────────────────
function ComplementMode({ data }: { data: any }) {
  const params = data?.params || {};
  const wDir: V2 = params.w || [1.2, 0.4];
  const initV: V2 = params.v || [0.5, 1.4];
  const [v, setV] = useState<V2>(initV);
  const [wAngle, setWAngle] = useState(() => Math.atan2(wDir[1], wDir[0]));
  const [dragging, setDragging] = useState<'v' | 'w' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const ŵ: V2 = [Math.cos(wAngle), Math.sin(wAngle)];
  const ŵp: V2 = [-Math.sin(wAngle), Math.cos(wAngle)]; // W⊥ direction

  const projW: V2   = vecScale(ŵ,  vecDot(v, ŵ));
  const projWp: V2  = vecScale(ŵp, vecDot(v, ŵp)); // = v - projW
  const compLen = vecLen(projWp);

  const EXT = 2.4;
  const [wn1x,wn1y] = sv(-ŵ[0]*EXT, -ŵ[1]*EXT);
  const [wp1x,wp1y] = sv( ŵ[0]*EXT,  ŵ[1]*EXT);
  const [cn1x,cn1y] = sv(-ŵp[0]*EXT,-ŵp[1]*EXT);
  const [cp1x,cp1y] = sv( ŵp[0]*EXT, ŵp[1]*EXT);
  const [vx,vy]   = sv(v[0],v[1]);
  const [pwx,pwy] = sv(projW[0],projW[1]);
  const [pcx,pcy] = sv(projWp[0],projWp[1]);
  // W drag handle
  const [whx,why] = sv(ŵ[0]*1.6, ŵ[1]*1.6);

  const onDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
    const sx = ((e.clientX-r.left)/r.width)*SVG_W, sy = ((e.clientY-r.top)/r.height)*SVG_H;
    if (Math.hypot(sx-vx,sy-vy) < 14) { setDragging('v'); }
    else if (Math.hypot(sx-whx,sy-why) < 14) { setDragging('w'); }
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }, [vx,vy,whx,why]);

  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const [nx,ny] = dv(((e.clientX-r.left)/r.width)*SVG_W, ((e.clientY-r.top)/r.height)*SVG_H);
    if (dragging === 'v') {
      const c: V2 = [Math.max(-2.3,Math.min(2.3,nx)), Math.max(-1.7,Math.min(1.7,ny))];
      if (vecLen(c) > 0.15) setV(c);
    } else {
      setWAngle(Math.atan2(ny, nx));
    }
  }, [dragging]);

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">COMPLEMENT</span>
        <span className="text-[9px] text-zinc-200 font-bold">{params.label || 'V = W ⊕ W⊥'}</span>
        <span className="ml-auto text-[9px] text-zinc-700">drag v · drag W to rotate</span>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full select-none"
          style={{ cursor: dragging ? 'crosshair' : 'default' }}
          onPointerDown={onDown} onPointerMove={onMove}
          onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)}>
          <Grid/>

          {/* W⊥ line (green, behind W) */}
          <line x1={cn1x} y1={cn1y} x2={cp1x} y2={cp1y}
            stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
          {/* W line (blue) */}
          <line x1={wn1x} y1={wn1y} x2={wp1x} y2={wp1y}
            stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>

          {/* Right angle at origin between W and W⊥ */}
          <RightAngleMark x={OX} y={OY} e1={ŵ} e2={ŵp} sz={12} color="#3f3f46"/>

          {/* Labels on lines */}
          <text x={wp1x-6} y={wp1y-7} fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.9">W</text>
          <text x={cp1x+3} y={cp1y} fill="#4ade80" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.9">W⊥</text>

          {/* Decomposition rectangle: dashed from projW→v and from projWp→v */}
          <line x1={pwx} y1={pwy} x2={vx} y2={vy}
            stroke="#22c55e" strokeWidth="1.4" strokeDasharray="4,3" strokeLinecap="round" opacity="0.75"/>
          <line x1={pcx} y1={pcy} x2={vx} y2={vy}
            stroke="#3b82f6" strokeWidth="1.4" strokeDasharray="4,3" strokeLinecap="round" opacity="0.75"/>

          {/* Right angle mark at projW (W component ⊥ W⊥ component) */}
          {compLen > 0.1 && (
            <RightAngleMark x={pwx} y={pwy} e1={ŵ} e2={ŵp} sz={9} color="#3f3f46"/>
          )}

          {/* proj_W(v) arrow (blue) */}
          <Arrow x1={OX} y1={OY} x2={pwx} y2={pwy} color="#3b82f6" width={2.2}/>
          {/* proj_W⊥(v) arrow (green) */}
          <Arrow x1={OX} y1={OY} x2={pcx} y2={pcy} color="#22c55e" width={2.2}/>

          {/* v arrow (purple, draggable) */}
          <Arrow x1={OX} y1={OY} x2={vx} y2={vy} color="#a855f7" width={2.5}/>
          <circle cx={vx} cy={vy} r={9} fill="transparent" stroke="#a855f7" strokeWidth="0.8"
            opacity="0.5" style={{ cursor: 'move' }}/>

          {/* W drag handle on the W line */}
          <circle cx={whx} cy={why} r={7} fill="transparent" stroke="#3b82f6" strokeWidth="0.8"
            opacity="0.5" style={{ cursor: 'move' }}/>

          {/* Labels */}
          <text x={vx+7} y={vy-5} fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">v</text>
          <text x={(OX+pwx)/2+4} y={(OY+pwy)/2-4} fill="#93c5fd" fontSize="6" fontFamily="monospace">proj_W</text>
          <text x={(OX+pcx)/2-34} y={(OY+pcy)/2+2} fill="#86efac" fontSize="6" fontFamily="monospace">proj_W⊥</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[9px]">
        <div className="bg-zinc-900/40 border border-blue-900/30 rounded-lg p-2">
          <div className="text-blue-500/70 mb-0.5">proj_W(v) ∈ W (blue)</div>
          <div className="text-blue-200 font-bold">({projW[0].toFixed(2)}, {projW[1].toFixed(2)})</div>
        </div>
        <div className="bg-zinc-900/40 border border-green-900/30 rounded-lg p-2">
          <div className="text-green-500/70 mb-0.5">proj_W⊥(v) ∈ W⊥ (green)</div>
          <div className="text-green-200 font-bold">({projWp[0].toFixed(2)}, {projWp[1].toFixed(2)})</div>
        </div>
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || 'Every v decomposes uniquely as v = proj_W(v) + proj_W⊥(v) with the two components orthogonal. Drag v or rotate W to verify the decomposition always holds.'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE: gram-schmidt  — the orthogonalization process itself
// ─────────────────────────────────────────────────────────────────────────────
function GramSchmidtMode({ data }: { data: any }) {
  const params = data?.params || {};
  const rawVecs: V2[] = params.vectors?.slice(0,2) || [[1.5,0.4],[0.4,1.5]];
  const labels: string[] = params.labels || ['v₁','v₂'];

  const [v1, setV1] = useState<V2>(() => rawVecs[0] || [1.5,0.4]);
  const [v2, setV2] = useState<V2>(() => rawVecs[1] || [0.4,1.5]);
  const [dragging, setDragging] = useState<'v1'|'v2'|null>(null);
  const [step, setStep] = useState(4);
  const svgRef = useRef<SVGSVGElement>(null);

  const gs = useMemo(() => {
    const e1 = vecNorm(v1);
    const projScalar = vecDot(v2, e1);
    const proj = vecScale(e1, projScalar);
    const perp = vecSub(v2, proj);
    const perpLen = vecLen(perp);
    const e2: V2 = perpLen > 1e-9 ? vecNorm(perp) : [-e1[1],e1[0]];
    return { e1, e2, proj, perp, projScalar, perpLen, isLinDep: perpLen < 0.1 };
  }, [v1,v2]);

  const [v1x,v1y] = sv(v1[0],v1[1]);
  const [v2x,v2y] = sv(v2[0],v2[1]);
  const [e1x,e1y] = sv(gs.e1[0],gs.e1[1]);
  const [e2x,e2y] = sv(gs.e2[0],gs.e2[1]);
  const [prx,pry] = sv(gs.proj[0],gs.proj[1]);

  const onDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
    const sx = ((e.clientX-r.left)/r.width)*SVG_W, sy = ((e.clientY-r.top)/r.height)*SVG_H;
    if (Math.hypot(sx-v1x,sy-v1y) < 14) setDragging('v1');
    else if (Math.hypot(sx-v2x,sy-v2y) < 14) setDragging('v2');
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }, [v1x,v1y,v2x,v2y]);

  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const [nx,ny] = dv(((e.clientX-r.left)/r.width)*SVG_W, ((e.clientY-r.top)/r.height)*SVG_H);
    const c: V2 = [Math.max(-2.4,Math.min(2.4,nx)), Math.max(-1.6,Math.min(1.6,ny))];
    if (vecLen(c) < 0.25) return;
    if (dragging === 'v1') setV1(c); else setV2(c);
  }, [dragging]);

  return (
    <div className="w-full h-full flex flex-col p-3 bg-zinc-950 font-mono text-xs text-zinc-400 gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 tracking-widest uppercase">GRAM-SCHMIDT</span>
        <span className="text-[9px] text-zinc-200 font-bold">{params.label || 'orthogonalization in ℝ²'}</span>
        {gs.isLinDep && <span className="text-[9px] text-amber-500 ml-1">⚠ nearly collinear</span>}
        <div className="ml-auto flex gap-0.5">
          {[1,2,3,4].map(s => (
            <button key={s} onClick={() => setStep(s)}
              className={`text-[8px] w-5 h-5 rounded border transition-all ${
                step >= s ? 'border-blue-700/70 bg-blue-950/40 text-blue-400' : 'border-zinc-800 text-zinc-700'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full select-none"
          style={{ cursor: dragging ? 'crosshair' : 'default' }}
          onPointerDown={onDown} onPointerMove={onMove}
          onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)}>
          <Grid/>

          {step >= 2 && <Arrow x1={OX} y1={OY} x2={prx} y2={pry} color="#f59e0b" dashed width={1.5}/>}
          {step >= 2 && <text x={(OX+prx)/2+3} y={(OY+pry)/2-3} fill="#f59e0b" fontSize="6" fontFamily="monospace">proj</text>}
          {step >= 3 && !gs.isLinDep && (
            <line x1={prx} y1={pry} x2={v2x} y2={v2y}
              stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="3,2" strokeLinecap="round"/>
          )}
          <Arrow x1={OX} y1={OY} x2={v1x} y2={v1y} color="#3b82f6" width={2}/>
          <Arrow x1={OX} y1={OY} x2={v2x} y2={v2y} color="#a855f7" width={2}/>
          {step >= 1 && <Arrow x1={OX} y1={OY} x2={e1x} y2={e1y} color="#93c5fd" width={2.2}/>}
          {step >= 4 && !gs.isLinDep && <>
            <Arrow x1={OX} y1={OY} x2={e2x} y2={e2y} color="#22c55e" width={2.5}/>
            <RightAngleMark x={OX} y={OY} e1={gs.e1} e2={gs.e2} sz={11}/>
          </>}

          <circle cx={v1x} cy={v1y} r={8} fill="transparent" stroke="#3b82f6" strokeWidth="0.7" opacity="0.4" style={{ cursor:'move' }}/>
          <circle cx={v2x} cy={v2y} r={8} fill="transparent" stroke="#a855f7" strokeWidth="0.7" opacity="0.4" style={{ cursor:'move' }}/>

          <text x={v1x+7} y={v1y-4} fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">{labels[0]||'v₁'}</text>
          <text x={v2x+7} y={v2y-4} fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold">{labels[1]||'v₂'}</text>
          {step >= 1 && <text x={e1x+5} y={e1y+2} fill="#93c5fd" fontSize="8" fontFamily="monospace" fontWeight="bold">e₁</text>}
          {step >= 4 && !gs.isLinDep && <text x={e2x+5} y={e2y+2} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold">e₂</text>}

          {!dragging && <text x={SVG_W/2} y={SVG_H-3} fill="#3f3f46" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
            drag v₁ or v₂ · step buttons reveal process
          </text>}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[9px]">
        {[
          { s: 1, color: 'blue',   label: `① e₁=v₁/‖v₁‖=(${gs.e1[0].toFixed(2)},${gs.e1[1].toFixed(2)})` },
          { s: 2, color: 'amber',  label: `② ⟨v₂,e₁⟩=${gs.projScalar.toFixed(2)}` },
          { s: 3, color: 'teal',   label: `③ v₂−proj ⊥ e₁, ‖⊥‖=${gs.perpLen.toFixed(2)}` },
          { s: 4, color: 'green',  label: `④ e₂=(${gs.e2[0].toFixed(2)},${gs.e2[1].toFixed(2)})` },
        ].map(({ s, color, label }) => (
          <div key={s} className={`rounded-lg p-1.5 border transition-all ${
            step === s
              ? `border-${color}-700/50 bg-${color}-950/20`
              : 'border-zinc-900/60'
          }`}>
            <span className={`text-${color}-400 font-bold`}>{'①②③④'[s-1]} </span>
            <span className="text-zinc-500">{label.slice(2)}</span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-zinc-700 leading-relaxed border-t border-zinc-900 pt-1.5">
        {params.note || 'Right-angle mark confirms e₁ ⊥ e₂. Drag v₁ or v₂ to explore.'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export: dispatch by params.mode
// ─────────────────────────────────────────────────────────────────────────────
export default function GramSchmidtVisualizer({ data }: { data: any }) {
  const mode = data?.params?.mode ?? 'gram-schmidt';
  if (mode === 'projection') return <ProjectionMode data={data} />;
  if (mode === 'complement') return <ComplementMode data={data} />;
  return <GramSchmidtMode data={data} />;
}

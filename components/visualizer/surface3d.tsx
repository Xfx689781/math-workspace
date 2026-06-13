"use client";
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

// ─── Math expression evaluator ───────────────────────────────────────────────
function evalFn(expr: string): (x: number, y: number) => number {
  try {
    const body = expr
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g, 'Math.sin').replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan').replace(/\bexp\b/g, 'Math.exp')
      .replace(/\bln\b/g, 'Math.log').replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs').replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b(?=[^a-z])/gi, 'Math.E');
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', 'y',
      `"use strict";try{const r=(${body});return isFinite(r)?Math.max(-30,Math.min(30,r)):0;}catch{return 0;}`);
    return fn as (x: number, y: number) => number;
  } catch {
    return () => 0;
  }
}

// Imperative geometry factory — avoids JSX bufferAttribute altogether
function makeLineGeom(pts: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

// ─── Surface geometry with height-based vertex colors ────────────────────────
function buildGrid(
  fn: (x: number, y: number) => number,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  N = 50
) {
  const zs: number[] = new Array((N + 1) * (N + 1));
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const x = xMin + (i / N) * (xMax - xMin);
      const y = yMin + (j / N) * (yMax - yMin);
      zs[i * (N + 1) + j] = fn(x, y);
    }
  }
  let zMin = Infinity, zMax = -Infinity;
  for (const z of zs) { if (z < zMin) zMin = z; if (z > zMax) zMax = z; }
  if (!isFinite(zMin)) zMin = 0;
  if (!isFinite(zMax)) zMax = 1;
  const zR = Math.max(zMax - zMin, 1e-6);

  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const x = xMin + (i / N) * (xMax - xMin);
      const y = yMin + (j / N) * (yMax - yMin);
      const z = zs[i * (N + 1) + j];
      pos.push(x, z, y); // THREE Y-up: math z→THREE Y, math y→THREE Z
      const t = (z - zMin) / zR;
      let r, g, b;
      if      (t < 0.25) { r = 0;           g = t * 4;         b = 1; }
      else if (t < 0.5)  { r = 0;           g = 1;             b = 1 - (t - 0.25) * 4; }
      else if (t < 0.75) { r = (t - 0.5)*4; g = 1;             b = 0; }
      else               { r = 1;           g = 1-(t-0.75)*4;  b = 0; }
      col.push(r, g, b);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const a = i * (N + 1) + j, b2 = a + (N + 1);
      idx.push(a, b2, a + 1, b2, b2 + 1, a + 1);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  return { geom, zMin, zMax };
}

// ─── Surface mesh ─────────────────────────────────────────────────────────────
function SurfaceMesh({ geom }: { geom: THREE.BufferGeometry }) {
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide}
          roughness={0.35} metalness={0.05} transparent opacity={0.92}/>
      </mesh>
      <mesh geometry={geom}>
        <meshBasicMaterial vertexColors wireframe transparent opacity={0.09} side={THREE.DoubleSide}/>
      </mesh>
    </group>
  );
}

// ─── Coordinate axes + base grid ─────────────────────────────────────────────
function CoordAxes({ xExt, yExt, zBase, zTop }: {
  xExt: number; yExt: number; zBase: number; zTop: number;
}) {
  const AH = 0.14, AR = 0.038;
  const zRange = zTop - zBase;
  const zTip = zTop + zRange * 0.18;

  const geoms = useMemo(() => {
    // Base grid
    const gridPts: number[] = [];
    const S = 6;
    for (let i = 0; i <= S; i++) {
      const tx = xExt * (-1 + 2 * i / S);
      const ty = yExt * (-1 + 2 * i / S);
      gridPts.push(tx, zBase, -yExt,  tx, zBase,  yExt);
      gridPts.push(-xExt, zBase, ty,   xExt, zBase, ty);
    }
    return {
      grid:  makeLineGeom(gridPts),
      xAxis: makeLineGeom([0, zBase, 0,  xExt, zBase, 0]),
      yAxis: makeLineGeom([0, zBase, 0,  0, zBase, yExt]),
      zAxis: makeLineGeom([0, zBase, 0,  0, zTip, 0]),
    };
  }, [xExt, yExt, zBase, zTip]);

  return (
    <group>
      {/* Base grid */}
      <lineSegments geometry={geoms.grid}>
        <lineBasicMaterial color="#1c1c2a" transparent opacity={0.65}/>
      </lineSegments>

      {/* X axis — red */}
      <lineSegments geometry={geoms.xAxis}>
        <lineBasicMaterial color="#ef4444"/>
      </lineSegments>
      <mesh position={[xExt, zBase, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[AR, AH, 8]}/><meshBasicMaterial color="#ef4444"/>
      </mesh>
      <Text position={[xExt + 0.24, zBase, 0]} fontSize={0.2} color="#ef4444" anchorX="center">x</Text>

      {/* Vertical axis (math z = height) — green */}
      <lineSegments geometry={geoms.zAxis}>
        <lineBasicMaterial color="#22c55e"/>
      </lineSegments>
      <mesh position={[0, zTip, 0]}>
        <coneGeometry args={[AR, AH, 8]}/><meshBasicMaterial color="#22c55e"/>
      </mesh>
      <Text position={[0.24, zTip + 0.1, 0]} fontSize={0.2} color="#22c55e" anchorX="center">z</Text>

      {/* Y axis (depth in THREE = math y) — blue */}
      <lineSegments geometry={geoms.yAxis}>
        <lineBasicMaterial color="#3b82f6"/>
      </lineSegments>
      <mesh position={[0, zBase, yExt]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[AR, AH, 8]}/><meshBasicMaterial color="#3b82f6"/>
      </mesh>
      <Text position={[0, zBase, yExt + 0.24]} fontSize={0.2} color="#3b82f6" anchorX="center">y</Text>

      {/* Tick marks */}
      {[-2, -1, 1, 2].map(n => {
        const tx = (n / 2) * xExt, ty = (n / 2) * yExt;
        if (Math.abs(tx) > xExt + 0.01) return null;
        return (
          <group key={n}>
            <mesh position={[tx, zBase, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 4]}/>
              <meshBasicMaterial color="#3f3f46"/>
            </mesh>
            <mesh position={[0, zBase, ty]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.08, 4]}/>
              <meshBasicMaterial color="#3f3f46"/>
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Tangent plane + gradient arrow at point (a, b) ─────────────────────────
function TangentPlane({ fn, a, b, ext }: {
  fn: (x: number, y: number) => number;
  a: number; b: number; ext: number;
}) {
  const result = useMemo(() => {
    const h = ext * 0.005;
    const z0 = fn(a, b);
    const fx = (fn(a + h, b) - fn(a - h, b)) / (2 * h);
    const fy = (fn(a, b + h) - fn(a, b - h)) / (2 * h);
    const s = ext * 0.5;
    // Corners in THREE coords (x, mathZ, mathY)
    const c: [number, number, number][] = [
      [a - s, z0 + fx * (-s) + fy * (-s), b - s],
      [a + s, z0 + fx * ( s) + fy * (-s), b - s],
      [a + s, z0 + fx * ( s) + fy * ( s), b + s],
      [a - s, z0 + fx * (-s) + fy * ( s), b + s],
    ];
    const planeGeom = new THREE.BufferGeometry();
    planeGeom.setAttribute('position', new THREE.Float32BufferAttribute([
      ...c[0], ...c[1], ...c[2],  ...c[0], ...c[2], ...c[3],
    ], 3));
    planeGeom.computeVertexNormals();

    // Gradient arrow
    const gradLen = Math.sqrt(fx * fx + fy * fy);
    const dir = gradLen > 1e-9
      ? new THREE.Vector3(fx / gradLen, 0, fy / gradLen)
      : new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(a, z0, b);
    const scale = Math.min(gradLen * ext * 0.3, ext * 0.65);
    const tip = origin.clone().addScaledVector(dir, scale);
    const arrowGeom = makeLineGeom([origin.x, origin.y, origin.z, tip.x, tip.y, tip.z]);

    return { planeGeom, origin, tip, dir, gradLen, z0, arrowGeom };
  }, [fn, a, b, ext]);

  const { planeGeom, origin, tip, dir, gradLen, arrowGeom } = result;
  const AH = ext * 0.055, AR = ext * 0.022;
  const tipQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group>
      {/* Tangent plane */}
      <mesh geometry={planeGeom}>
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.22}
          side={THREE.DoubleSide} roughness={0.5}/>
      </mesh>
      {/* Point dot */}
      <mesh position={[origin.x, origin.y, origin.z]}>
        <sphereGeometry args={[ext * 0.028, 16, 16]}/><meshBasicMaterial color="#ffffff"/>
      </mesh>
      {/* Gradient arrow */}
      {gradLen > 0.01 && (
        <group>
          <lineSegments geometry={arrowGeom}>
            <lineBasicMaterial color="#f97316" linewidth={2}/>
          </lineSegments>
          <mesh position={[tip.x, tip.y, tip.z]} quaternion={tipQ}>
            <coneGeometry args={[AR, AH, 8]}/><meshBasicMaterial color="#f97316"/>
          </mesh>
          <Text position={[tip.x + 0.12, tip.y, tip.z]} fontSize={0.18} color="#fb923c" anchorX="left">∇f</Text>
        </group>
      )}
    </group>
  );
}

// ─── Gradient-only arrow (no tangent plane) ───────────────────────────────────
function GradientArrow({ fn, a, b, ext, zBase }: {
  fn: (x: number, y: number) => number;
  a: number; b: number; ext: number; zBase: number;
}) {
  const result = useMemo(() => {
    const h = ext * 0.005;
    const z0 = fn(a, b);
    const fx = (fn(a + h, b) - fn(a - h, b)) / (2 * h);
    const fy = (fn(a, b + h) - fn(a, b - h)) / (2 * h);
    const len = Math.sqrt(fx * fx + fy * fy);
    if (len < 0.01) return null;
    const dir = new THREE.Vector3(fx / len, 0, fy / len);
    const origin = new THREE.Vector3(a, z0, b);
    const scale = Math.min(len, 3) * ext * 0.25;
    const tip = origin.clone().addScaledVector(dir, scale);
    const dropGeom = makeLineGeom([a, zBase, b,  a, z0, b]);
    const arrowGeom = makeLineGeom([origin.x, origin.y, origin.z,  tip.x, tip.y, tip.z]);
    return { origin, tip, dir, dropGeom, arrowGeom };
  }, [fn, a, b, ext, zBase]);

  if (!result) return null;
  const { origin, tip, dir, dropGeom, arrowGeom } = result;
  const AH = ext * 0.05, AR = ext * 0.018;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group>
      <lineSegments geometry={dropGeom}>
        <lineBasicMaterial color="#52525b" transparent opacity={0.4}/>
      </lineSegments>
      <lineSegments geometry={arrowGeom}>
        <lineBasicMaterial color="#f97316" linewidth={2}/>
      </lineSegments>
      <mesh position={[tip.x, tip.y, tip.z]} quaternion={q}>
        <coneGeometry args={[AR, AH, 8]}/><meshBasicMaterial color="#f97316"/>
      </mesh>
      <mesh position={[origin.x, origin.y, origin.z]}>
        <sphereGeometry args={[AR * 0.9, 12, 12]}/><meshBasicMaterial color="#ffffff"/>
      </mesh>
      <Text position={[tip.x + 0.12, tip.y, tip.z]} fontSize={0.18} color="#fb923c" anchorX="left">∇f</Text>
    </group>
  );
}

// ─── Scene: everything inside Canvas ─────────────────────────────────────────
function Scene({ fn, xMin, xMax, yMin, yMax, showTangent, showGrad, point, target }: {
  fn: (x: number, y: number) => number;
  xMin: number; xMax: number; yMin: number; yMax: number;
  showTangent: boolean; showGrad: boolean;
  point: [number, number];
  target: THREE.Vector3;
}) {
  const { geom, zMin, zMax } = useMemo(
    () => buildGrid(fn, xMin, xMax, yMin, yMax, 50),
    [fn, xMin, xMax, yMin, yMax]
  );

  const xExt = Math.max(Math.abs(xMax), Math.abs(xMin));
  const yExt = Math.max(Math.abs(yMax), Math.abs(yMin));
  const ext  = Math.max(xExt, yExt);
  const yFloor = zMin - (zMax - zMin) * 0.04;

  return (
    <>
      <ambientLight intensity={0.55}/>
      <pointLight position={[5, 10, 5]} intensity={1.8}/>
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#818cf8"/>
      <pointLight position={[0, -5, 0]}  intensity={0.2} color="#1d4ed8"/>

      <SurfaceMesh geom={geom}/>
      <CoordAxes xExt={xExt} yExt={yExt} zBase={yFloor} zTop={zMax}/>

      {showTangent && (
        <TangentPlane fn={fn} a={point[0]} b={point[1]} ext={ext}/>
      )}
      {showGrad && !showTangent && (
        <GradientArrow fn={fn} a={point[0]} b={point[1]} ext={ext} zBase={yFloor}/>
      )}

      <OrbitControls
        target={target}
        enableDamping dampingFactor={0.07}
        autoRotate autoRotateSpeed={0.5}
        enableZoom enablePan
        maxDistance={ext * 8} minDistance={ext * 0.4}
      />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Surface3DVisualizer({ data }: { data: any }) {
  const params = data?.params || {};

  const fn = useMemo(() => evalFn(params.fnExpression || '0'), [params.fnExpression]);
  const [[xMin, xMax], [yMin, yMax]] = (params.domain || [[-2, 2], [-2, 2]]) as [[number, number], [number, number]];

  const initPx = params.point?.[0] ?? (xMin + xMax) / 2;
  const initPy = params.point?.[1] ?? (yMin + yMax) / 2;
  const [ptX, setPtX] = useState<number>(initPx);
  const [ptY, setPtY] = useState<number>(initPy);

  const showTangent = !!params.showTangentPlane;
  const showGrad    = !!params.showGradient;
  const showSliders = showTangent || showGrad;
  const ptZ = fn(ptX, ptY);

  const ext  = Math.max(Math.abs(xMax), Math.abs(xMin), Math.abs(yMax), Math.abs(yMin));
  const camD = ext * 2.6;

  const { zMin: zMinInit, zMax: zMaxInit } = useMemo(
    () => buildGrid(fn, xMin, xMax, yMin, yMax, 12),
    [fn, xMin, xMax, yMin, yMax]
  );
  const zMid = (zMinInit + zMaxInit) / 2;

  const target = useMemo(
    () => new THREE.Vector3((xMin + xMax) / 2, zMid, (yMin + yMax) / 2),
    [xMin, xMax, yMin, yMax, zMid]
  );

  return (
    <div className="w-full h-full bg-[#02020a] relative overflow-hidden">
      <Canvas
        camera={{ position: [camD * 0.85, camD * 0.65, camD * 0.85], fov: 52 }}
        gl={{ antialias: true }}>
        <Scene fn={fn} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}
          showTangent={showTangent} showGrad={showGrad}
          point={[ptX, ptY]} target={target}/>
      </Canvas>

      {/* Label */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <span className="text-[9px] font-mono text-zinc-300 bg-zinc-900/80 border border-zinc-800/50 px-2.5 py-1 rounded-lg">
          {params.label || 'z = f(x, y)'}
        </span>
        <span className="text-[8px] font-mono text-zinc-700">drag · scroll · pinch</span>
      </div>

      {/* Point sliders */}
      {showSliders && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent px-4 py-2.5 pointer-events-auto">
          <div className="flex gap-3 items-center">
            <span className="text-[8px] font-mono text-zinc-600 shrink-0">point</span>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[8px] font-mono text-red-500 w-3 shrink-0">x</span>
              <input type="range" min={xMin} max={xMax} step={(xMax - xMin) / 100}
                value={ptX} onChange={e => setPtX(Number(e.target.value))}
                className="flex-1 h-1 accent-red-500 cursor-pointer"/>
              <span className="text-[8px] font-mono text-red-400 w-8 text-right shrink-0">{ptX.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[8px] font-mono text-blue-500 w-3 shrink-0">y</span>
              <input type="range" min={yMin} max={yMax} step={(yMax - yMin) / 100}
                value={ptY} onChange={e => setPtY(Number(e.target.value))}
                className="flex-1 h-1 accent-blue-500 cursor-pointer"/>
              <span className="text-[8px] font-mono text-blue-400 w-8 text-right shrink-0">{ptY.toFixed(2)}</span>
            </div>
            <span className="text-[8px] font-mono text-amber-500 shrink-0">z = {ptZ.toFixed(3)}</span>
          </div>
        </div>
      )}

      {/* Color legend */}
      {!showSliders && (
        <div className="absolute bottom-2 left-4 right-4 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="w-14 h-1.5 rounded-full"
              style={{ background: 'linear-gradient(to right,#3b82f6,#22c55e,#eab308,#ef4444)' }}/>
            <span className="text-[7px] font-mono text-zinc-700">low → high z</span>
          </div>
          {params.note && (
            <span className="text-[7.5px] font-mono text-zinc-700 ml-auto max-w-[58%] text-right leading-tight">
              {params.note}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

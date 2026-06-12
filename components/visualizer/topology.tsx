"use client";
import { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const SHAPE_INFO: Record<string, { chi: string; genus: string; side: string; pi1: string }> = {
  torus:  { chi: 'χ = 0', genus: 'genus 1', side: 'orientable', pi1: 'π₁ = ℤ × ℤ' },
  sphere: { chi: 'χ = 2', genus: 'genus 0', side: 'orientable', pi1: 'simply connected' },
  mobius: { chi: 'χ = 0', genus: '—', side: 'non-orientable', pi1: '1-sided · 1 boundary' },
};

function MobiusStrip({ color }: { color: string }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const U = 80, V = 20;
    const pos: number[] = [];
    for (let i = 0; i <= U; i++) {
      const u = (i / U) * 2 * Math.PI;
      for (let j = 0; j <= V; j++) {
        const v = (j / V - 0.5) * 0.55;
        pos.push(
          (1 + v * Math.cos(u / 2)) * Math.cos(u),
          (1 + v * Math.cos(u / 2)) * Math.sin(u),
          v * Math.sin(u / 2),
        );
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < U; i++) {
      for (let j = 0; j < V; j++) {
        const a = i * (V + 1) + j;
        const b = a + V + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.25} metalness={0.1} />
    </mesh>
  );
}

function ShapeMesh({ shape, color }: { shape: string; color: string }) {
  if (shape === 'sphere') {
    return (
      <mesh>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshStandardMaterial color={color} wireframe={false} roughness={0.2} metalness={0.1} transparent opacity={0.85} />
      </mesh>
    );
  }
  if (shape === 'mobius') {
    return <MobiusStrip color={color} />;
  }
  // default: torus
  return (
    <mesh rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.85, 0.28, 32, 96]} />
      <meshStandardMaterial color={color} wireframe={false} roughness={0.2} metalness={0.1} transparent opacity={0.85} />
    </mesh>
  );
}

export default function TopologyVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const shape: string = params.shape || 'torus';
  const color: string = params.color || '#3b82f6';
  const label: string = params.label || shape;
  const info = SHAPE_INFO[shape] || SHAPE_INFO.torus;

  return (
    <div className="w-full h-full bg-zinc-950 relative overflow-hidden">
      <Canvas camera={{ position: [2.8, 2, 2.8], fov: 42 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[8, 8, 8]} intensity={1.8} />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#6366f1" />
        <ShapeMesh shape={shape} color={color} />
        <OrbitControls
          enableZoom={true}
          autoRotate
          autoRotateSpeed={0.7}
          maxDistance={7}
          minDistance={1.5}
          enableDamping
          dampingFactor={0.07}
        />
      </Canvas>

      {/* Top label */}
      <div className="absolute top-3 left-4 right-4 flex items-start justify-between pointer-events-none">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950/70 px-2 py-0.5 rounded">
          {label}
        </span>
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/90 to-transparent px-4 py-2 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {[info.chi, info.genus, info.side, info.pi1].map(v => (
              <span key={v} className="text-[8px] font-mono text-zinc-600">{v}</span>
            ))}
          </div>
          <span className="text-[8px] font-mono text-zinc-800">drag · scroll</span>
        </div>
      </div>
    </div>
  );
}

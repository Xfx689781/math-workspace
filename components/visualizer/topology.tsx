"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Torus } from '@react-three/drei';

export default function TopologyVisualizer({ data }: { data: any }) {
  return (
    <div className="w-full h-full bg-zinc-950 relative">
      <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <mesh rotation={[0.5, 0.3, 0]}>
          <torusGeometry args={[0.8, 0.25, 32, 80]} />
          <meshStandardMaterial color="#2563eb" wireframe roughness={0.2} />
        </mesh>
        <OrbitControls enableZoom={true} maxDistance={6} minDistance={1.5} />
      </Canvas>
      <div className="absolute top-3 left-4 text-[9px] font-mono text-zinc-600">
        TOPOLOGY_3D_MESH_RUNNING
      </div>
    </div>
  );
}
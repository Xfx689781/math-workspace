"use client";
import React from 'react';
import { Handle, Position } from 'reactflow';

export default function TheoremNode({ data }: any) {
  return (
    <div className={`p-4 rounded-xl border bg-zinc-950 text-zinc-200 font-mono text-xs min-w-[220px] shadow-2xl transition-all ${
      data.isActive ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="text-[9px] text-amber-500 font-bold mb-1 tracking-widest uppercase">Morphism // Theorem</div>
      <div className="leading-relaxed text-zinc-300">{data.label}</div>
      
      {/* 双向连接句柄 */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-zinc-700 border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-amber-500 border-none" />
    </div>
  );
}
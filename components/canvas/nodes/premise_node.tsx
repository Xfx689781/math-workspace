"use client";
import React from 'react';
import { Handle, Position } from 'reactflow';

export default function PremiseNode({ data }: any) {
  return (
    <div className={`p-4 rounded-xl border bg-zinc-950 text-zinc-200 font-mono text-xs min-w-[220px] shadow-2xl transition-all ${
      data.isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="text-[9px] text-blue-400 font-bold mb-1 tracking-widest uppercase">Premise // Radix</div>
      <div className="leading-relaxed text-zinc-300">{data.label}</div>
      
      {/* 右侧输出连接点 */}
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500 border-none" />
    </div>
  );
}
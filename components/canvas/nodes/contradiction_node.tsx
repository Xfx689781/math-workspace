"use client";
import React from 'react';
import { Handle, Position } from 'reactflow';

export default function ContradictionNode({ data }: any) {
  return (
    <div className={`p-4 rounded-xl border bg-zinc-950 text-zinc-200 font-mono text-xs min-w-[220px] shadow-2xl transition-all ${
      data.isActive ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="text-[9px] text-rose-500 font-bold mb-1 tracking-widest uppercase">Obstruction // False</div>
      <div className="leading-relaxed text-zinc-300">{data.label}</div>
      
      {/* 左侧输入接收点 */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-rose-500 border-none" />
    </div>
  );
}
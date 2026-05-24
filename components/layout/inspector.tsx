"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';
import DynamicVisualizer from '@/components/visualizer/dynamic';

export default function Inspector() {
  const { activeNodeId } = useMathStore();

  return (
    <aside className="w-[400px] bg-[#09090b] border-l border-zinc-900 p-6 z-20 flex flex-col gap-6 overflow-y-auto">
      <div>
        <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase font-mono">Inspector</h2>
        <p className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase">Visual & Formal Proof Telemetry</p>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        {/* 核心可视化视口 */}
        <div className="w-full h-72 bg-zinc-950 rounded-2xl border border-zinc-900 relative overflow-hidden shadow-inner flex-shrink-0">
          <DynamicVisualizer />
        </div>

        {/* 形式化证明/LaTeX 详情区 */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 font-serif leading-relaxed flex-1 flex flex-col">
          <span className="text-[9px] font-mono tracking-widest text-zinc-500 block mb-3 uppercase">Rigorous Logic</span>
          {activeNodeId ? (
            <p className="text-zinc-300 text-sm">
              Node <span className="text-blue-400 font-mono">[{activeNodeId}]</span> selected. 
              Here the AI would inject the precise step-by-step LaTeX proof or counter-example explanation.
            </p>
          ) : (
            <p className="text-zinc-600 text-xs font-mono italic my-auto text-center">
              Select a node in the graph to inspect structural proofs.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
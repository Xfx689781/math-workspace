"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';

export default function ControlPanel() {
  const { activeDomain, currentQuery, setQuery, isSolving, executeSolver } = useMathStore();

  return (
    <div className="absolute top-6 left-6 right-6 z-10 bg-[#09090b]/80 backdrop-blur-xl border border-zinc-900 p-4 rounded-2xl flex gap-4 shadow-2xl items-center">
      <div className="bg-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400 uppercase tracking-widest border border-zinc-800">
        {activeDomain}
      </div>
      <input
        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-blue-500/50 transition-all text-zinc-100"
        placeholder="Input an abstract conjecture or theorem to build intuition..."
        value={currentQuery}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && executeSolver()}
      />
      <button
        onClick={executeSolver}
        disabled={isSolving || !currentQuery}
        className="bg-zinc-200 text-black text-xs font-black px-6 py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all tracking-widest uppercase disabled:opacity-40"
      >
        {isSolving ? 'Computing...' : 'Execute'}
      </button>
    </div>
  );
}
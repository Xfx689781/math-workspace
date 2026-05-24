"use client";
import React from 'react';
import { useMathStore, MathSubdomain } from '@/store/useMathStore';

const DOMAINS: { id: MathSubdomain; label: string }[] = [
  { id: 'basics', label: 'CALCULUS / BASICS' },
  { id: 'analysis', label: 'REAL / COMPLEX ANALYSIS' },
  { id: 'topology', label: 'TOPOLOGY / GEOMETRY' },
  { id: 'algebra', label: 'ABSTRACT ALGEBRA' },
  { id: 'discrete', label: 'DISCRETE / PROBABILITY' },
];

export default function Sidebar() {
  const { activeDomain, setActiveDomain } = useMathStore();

  return (
    <aside className="w-64 bg-[#09090b] border-r border-zinc-900 flex flex-col justify-between p-6 z-20 shadow-2xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-md font-black tracking-[0.2em] text-white uppercase italic">Axiom Studio</h1>
          <p className="text-[9px] text-zinc-600 font-mono mt-1 tracking-wider">v1.2.0 // SOLVER ENGINE</p>
        </div>
        <nav className="space-y-2">
          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setActiveDomain(domain.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-mono tracking-widest transition-all ${
                activeDomain === domain.id 
                  ? 'bg-blue-600/10 border border-blue-500/50 text-blue-400 font-bold shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              {domain.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-[9px] font-mono text-zinc-700 tracking-tight uppercase">
        Status: Online <br/>
        Kernel: Ready
      </div>
    </aside>
  );
}
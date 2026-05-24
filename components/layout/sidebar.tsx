"use client";
import React from 'react';
import { useMathStore, MathSubdomain } from '@/store/useMathStore';

const DOMAINS: { id: MathSubdomain; label: string }[] = [
  { id: 'basics', label: 'CALCULUS / BASICS' },
  { id: 'analysis', label: 'REAL & COMPLEX ANALYSIS' },
  { id: 'topology', label: 'TOPOLOGY & GEOMETRY' },
  { id: 'algebra', label: 'ABSTRACT ALGEBRA' },
  { id: 'discrete', label: 'DISCRETE & PROBABILITY' },
];

export default function Sidebar() {
  const { activeDomain, setActiveDomain } = useMathStore();

  return (
    <aside className="w-64 bg-[#070708] border-r border-zinc-900 flex flex-col justify-between p-6 z-20 shadow-2xl">
      <div className="space-y-8">
        <div>
          {/* 改名为 Math Workspace */}
          <h1 className="text-md font-black tracking-[0.15em] text-zinc-100 uppercase italic">
            Math <span className="text-blue-500 font-sans not-italic">Workspace</span>
          </h1>
          <p className="text-[9px] text-zinc-600 font-mono mt-1 tracking-wider uppercase">
            Axiomatic Topology Graph // v1.2.0
          </p>
        </div>
        <nav className="space-y-1.5">
          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setActiveDomain(domain.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-mono tracking-widest transition-all duration-300 relative group ${
                activeDomain === domain.id 
                  ? 'bg-blue-600/5 border border-blue-500/30 text-blue-400 font-bold shadow-[0_0_20px_rgba(59,130,246,0.05)]' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              {activeDomain === domain.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-blue-500 rounded-r-full animate-pulse" />
              )}
              {domain.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-[9px] font-mono text-zinc-700 tracking-tight leading-relaxed">
        KERNEL // ACTIVE <br/>
        SYSTEM // IDLE
      </div>
    </aside>
  );
}
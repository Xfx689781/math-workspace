"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';

export default function Topbar() {
  const appMode      = useMathStore(s => s.appMode);
  const setAppMode   = useMathStore(s => s.setAppMode);
  const errorMessage = useMathStore(s => s.errorMessage);
  const visualConfig = useMathStore(s => s.visualConfig);
  const isSolving    = useMathStore(s => s.isSolving);
  const currentQuery = useMathStore(s => s.currentQuery);
  const executeSolver = useMathStore(s => s.executeSolver);

  // Show input bar in topbar once a result exists, while loading, or on error (so user can retry)
  const showInput = !!(visualConfig || isSolving || errorMessage);

  const handleBack = () => {
    setAppMode(null);
    useMathStore.setState({
      visualConfig: null, nodes: [], edges: [], steps: [],
      currentQuery: '', errorMessage: null, cachedConfigs: {},
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSolving) executeSolver();
  };

  return (
    <header className="w-full bg-[#070708] border-b border-zinc-900 z-10 shrink-0">
      {errorMessage && (
        <div className="px-6 py-1.5 bg-rose-950/30 border-b border-rose-900/40 text-[10px] font-mono text-rose-400 flex items-center gap-2">
          <span className="text-rose-500">✕</span>
          {errorMessage}
        </div>
      )}

      <div className="h-12 px-5 flex items-center gap-4">
        {/* Left: back + brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBack}
            className="group flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors font-mono text-[10px] uppercase tracking-widest"
          >
            <span className="inline-block group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back</span>
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2 select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-black tracking-[0.12em] text-zinc-100 uppercase italic">
              Math <span className="text-blue-500 font-sans not-italic">Workspace</span>
            </span>
          </div>
        </div>

        {/* Center: input — only when active */}
        <div className="flex-1 flex items-center gap-2">
          {showInput && (
            <>
              <input
                type="text"
                value={currentQuery}
                onChange={e => useMathStore.setState({ currentQuery: e.target.value })}
                onKeyDown={handleKeyDown}
                disabled={isSolving}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
              <button
                onClick={executeSolver}
                disabled={isSolving || !currentQuery?.trim()}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all ${
                  isSolving
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : currentQuery?.trim()
                    ? 'bg-blue-600/10 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {isSolving
                  ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 border border-t-transparent border-zinc-500 rounded-full animate-spin inline-block" /><span>Solving</span></span>
                  : 'Run'}
              </button>
            </>
          )}
        </div>

        {/* Right: mode badge */}
        {appMode && (
          <div className={`shrink-0 flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-mono tracking-widest uppercase ${
            appMode === 'theorem'
              ? 'border-blue-900/50 text-blue-600 bg-blue-950/20'
              : 'border-violet-900/50 text-violet-600 bg-violet-950/20'
          }`}>
            <span>{appMode === 'theorem' ? '∀' : '∫'}</span>
            <span>{appMode === 'theorem' ? 'Theorem' : 'Problem'}</span>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';

const MODE_BADGE = {
  theorem: { en: 'Theorem', zh: '定理', icon: '∀', cls: 'border-blue-900/50 text-blue-600 bg-blue-950/20' },
  problem: { en: 'Problem', zh: '解题', icon: '∫', cls: 'border-violet-900/50 text-violet-600 bg-violet-950/20' },
  latex:   { en: 'LaTeX',   zh: 'LaTeX', icon: 'Σ', cls: 'border-emerald-900/50 text-emerald-600 bg-emerald-950/20' },
};

export default function Topbar() {
  const appMode       = useMathStore(s => s.appMode);
  const setAppMode    = useMathStore(s => s.setAppMode);
  const language      = useMathStore(s => s.language);
  const setLanguage   = useMathStore(s => s.setLanguage);
  const errorMessage  = useMathStore(s => s.errorMessage);
  const visualConfig  = useMathStore(s => s.visualConfig);
  const isSolving     = useMathStore(s => s.isSolving);
  const currentQuery  = useMathStore(s => s.currentQuery);
  const executeSolver = useMathStore(s => s.executeSolver);

  const showInput = appMode !== 'latex' && !!(visualConfig || isSolving || errorMessage);

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

  const badge = appMode && appMode !== 'latex' && appMode in MODE_BADGE
    ? MODE_BADGE[appMode as 'theorem' | 'problem' | 'latex']
    : appMode === 'latex' ? MODE_BADGE.latex : null;

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
            <span>{language === 'zh' ? '返回' : 'Back'}</span>
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2 select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-black tracking-[0.12em] text-zinc-100 uppercase italic">
              Math <span className="text-blue-500 font-sans not-italic">Workspace</span>
            </span>
          </div>
        </div>

        {/* Center: search input (math modes only, when active) */}
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
                  ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 border border-t-transparent border-zinc-500 rounded-full animate-spin inline-block" /><span>{language === 'zh' ? '计算中' : 'Solving'}</span></span>
                  : (language === 'zh' ? '运行' : 'Run')}
              </button>
            </>
          )}
        </div>

        {/* Right: language toggle + mode badge */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center gap-0.5 bg-zinc-950 border border-zinc-800/60 rounded-md p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase transition-all ${language === 'en' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}
            >EN</button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest transition-all ${language === 'zh' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}
            >中文</button>
          </div>

          {/* Mode badge */}
          {badge && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono tracking-widest uppercase ${badge.cls}`}>
              <span>{badge.icon}</span>
              <span>{language === 'zh' ? badge.zh : badge.en}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

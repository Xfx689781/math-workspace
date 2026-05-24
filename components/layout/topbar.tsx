"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';

export default function Topbar() {
  const { 
    currentQuery, 
    setQuery, 
    executeSolver, 
    isSolving, 
    visualConfig 
  } = useMathStore();

  // 捕获回车事件，实现极速推演
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSolving) {
      executeSolver();
    }
  };

  return (
    <header className="h-14 w-full bg-[#070708] border-b border-zinc-900 px-6 flex items-center justify-between z-10 shrink-0">
      {/* 🧭 左侧：动态面包屑拓扑航线 */}
      <div className="flex items-center space-x-2 select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <div className="flex items-center space-x-1.5 font-mono text-[10px] tracking-wider text-zinc-500">
          <span className="uppercase">Workspace</span>
          <span>/</span>
          {visualConfig ? (
            <span className="text-zinc-300 font-bold transition-all">
              {visualConfig.subdomainLabel.split(' ')[0]}
            </span>
          ) : (
            <span className="text-zinc-600 italic">Idle_Locus</span>
          )}
        </div>
      </div>

      {/* 🔍 中间：核心学术指令输入内核 */}
      <div className="flex-1 max-w-xl mx-8 relative flex items-center">
        <input
          type="text"
          value={currentQuery}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSolving}
          placeholder="Enter conjecture or domain (e.g., 'uniform convergence')..."
          className="w-full bg-[#030303] border border-zinc-900 rounded-xl px-4 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-40"
        />
        
        {/* 右侧微型状态指示 */}
        <div className="absolute right-3 font-mono text-[9px] text-zinc-600 pointer-events-none uppercase">
          {isSolving ? "Parsing..." : "SYS//READY"}
        </div>
      </div>

      {/* ⚡ 右侧：一键高维推演触发泵 */}
      <div>
        <button
          onClick={executeSolver}
          disabled={isSolving || !currentQuery.trim()}
          className={`px-4 py-1.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${
            isSolving
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
              : currentQuery.trim()
              ? 'bg-blue-600/10 border border-blue-500/40 text-blue-400 font-bold hover:bg-blue-600 hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isSolving ? (
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 border border-t-transparent border-zinc-500 rounded-full animate-spin" />
              <span>Execute</span>
            </span>
          ) : (
            "Execute"
          )}
        </button>
      </div>
    </header>
  );
}
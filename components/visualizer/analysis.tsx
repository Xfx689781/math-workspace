"use client";
import React, { useState } from 'react';

export default function AnalysisVisualizer({ data }: { data: any }) {
  const [n, setN] = useState(1);

  // 模拟绘制 f_n(x) = x^n 演示非一致收敛
  const pathData = Array.from({ length: 50 }).map((_, i) => {
    const x = i / 49;
    const y = Math.pow(x, n);
    return `${i === 0 ? 'M' : 'L'} ${20 + x * 260} ${140 - y * 100}`;
  }).join(' ');

  return (
    <div className="w-full h-full bg-zinc-950 p-4 flex flex-col font-mono text-xs">
      <div className="text-[9px] text-zinc-500 uppercase mb-2">Limit / Measure Stream</div>
      <div className="flex-1 border border-zinc-900 bg-black rounded-lg relative flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 300 160" className="w-full h-full">
          <line x1="20" y1="140" x2="280" y2="140" stroke="#3f3f46" />
          <line x1="20" y1="20" x2="20" y2="140" stroke="#3f3f46" />
          <path d={pathData} fill="none" stroke="#f43f5e" strokeWidth="2" className="transition-all duration-300" />
          <path d="M 20 140 L 280 40" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] text-zinc-400">Convergence (n):</span>
        <input 
          type="range" min="1" max="20" value={n} 
          onChange={(e) => setN(Number(e.target.value))}
          className="flex-1 accent-rose-500 h-1 bg-zinc-800 appearance-none rounded-full"
        />
      </div>
    </div>
  );
}
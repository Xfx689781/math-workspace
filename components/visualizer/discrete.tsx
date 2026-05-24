"use client";
import React from 'react';

export default function DiscreteVisualizer({ data }: { data: any }) {
  return (
    <div className="w-full h-full bg-zinc-950 p-4 flex flex-col items-center justify-center font-mono">
      <div className="text-[9px] text-zinc-500 absolute top-3 left-3 uppercase">Combinatorics & Graph View</div>
      <div className="relative w-32 h-32">
        {/* 模拟一个简单的二叉图或概率树 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full" />
        <svg className="absolute inset-0 w-full h-full" pointerEvents="none">
          <line x1="50%" y1="16" x2="20%" y2="60" stroke="#7e22ce" strokeWidth="2" />
          <line x1="50%" y1="16" x2="80%" y2="60" stroke="#7e22ce" strokeWidth="2" />
          <line x1="20%" y1="76" x2="10%" y2="110" stroke="#7e22ce" strokeWidth="2" />
          <line x1="20%" y1="76" x2="30%" y2="110" stroke="#7e22ce" strokeWidth="2" />
        </svg>
        <div className="absolute top-[60px] left-[20%] -translate-x-1/2 w-4 h-4 bg-purple-400 rounded-full" />
        <div className="absolute top-[60px] left-[80%] -translate-x-1/2 w-4 h-4 bg-purple-400 rounded-full" />
        <div className="absolute top-[110px] left-[10%] -translate-x-1/2 w-3 h-3 bg-purple-300 rounded-full" />
        <div className="absolute top-[110px] left-[30%] -translate-x-1/2 w-3 h-3 bg-purple-300 rounded-full" />
      </div>
      <div className="mt-6 text-[10px] text-zinc-500 text-center">
        Rendering Discrete Structures / Trees
      </div>
    </div>
  );
}
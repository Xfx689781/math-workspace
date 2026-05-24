"use client";
import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import ControlPanel from '@/components/layout/control';
import Inspector from '@/components/layout/inspector';
// 假设你稍后会在 canvas/graph.tsx 里写 React Flow，先用个占位符或直接引入
import WorkspaceGraph from '@/components/canvas/graph'; 

export default function AxiomStudioPage() {
  return (
    <div className="w-screen h-screen flex bg-[#030303] text-zinc-200 overflow-hidden font-sans antialiased selection:bg-blue-500/30">
      {/* 左侧：导航栏 */}
      <Sidebar />
      
      {/* 中间：主工作区 (包含顶部输入框和拓扑画布) */}
      <main className="flex-1 flex flex-col relative h-full">
        <ControlPanel />
        <WorkspaceGraph />
      </main>

      {/* 右侧：属性与可视化检查器 */}
      <Inspector />
    </div>
  );
}
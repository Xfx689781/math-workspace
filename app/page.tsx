"use client";
import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import Inspector from '@/components/layout/inspector';
import DynamicVisualizer from '@/components/layout/../visualizer/dynamic'; // 绑定中央渲染层
import { useMathStore } from '@/store/useMathStore';

export default function AxiomStudioPage() {
  const { visualConfig } = useMathStore();

  return (
    <div className="w-screen h-screen bg-[#030303] text-zinc-300 flex overflow-hidden font-sans selection:bg-blue-500/30">
      {/* 左侧大类导航 */}
      <Sidebar />

      {/* 中央主展区与头部搜索区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        
        {/* 🚀 主舞台：右边栏的交互模型与内容现在强势霸占整个中心巨幕！ */}
        <main className="flex-1 w-full h-full overflow-hidden relative bg-[#020203]">
          {visualConfig && (
            <div className="absolute top-4 left-6 z-10 pointer-events-none">
              <span className="text-[9px] font-mono tracking-[0.25em] text-blue-500/80 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-md uppercase backdrop-blur-md">
                {visualConfig.subdomainLabel}
              </span>
            </div>
          )}
          <DynamicVisualizer />
        </main>
      </div>

      {/* 右侧边栏：现在的 React Flow 垂直导图容器 */}
      <Inspector />
    </div>
  );
}
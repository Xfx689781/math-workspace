"use client";

import React from 'react';
import { useMathStore } from '@/store/useMathStore';
// 1️⃣ 引入你全小写的 LaTeX 渲染器组件
import MathRenderer from './mathrenderer'; 

// 引入原有的各个领域几何画布组件
import BasicsVisualizer from './basics';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import AnalysisVisualizer from './analysis';
import DiscreteVisualizer from './discrete';

export default function DynamicVisualizer() {
  // 从 store 中安全取出 visualConfig
  const { visualConfig } = useMathStore();

  // 🛡️ 安全守卫：如果当前没有激活的节点或配置为空，返回待机占位提示
  if (!visualConfig || !visualConfig.type) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center mb-3 opacity-60">
          <span className="text-zinc-600 font-mono text-xs">∅</span>
        </div>
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          Telemetry Pending
        </p>
        <p className="text-[11px] text-zinc-600 font-serif max-w-[200px] mt-1 leading-relaxed">
          Select an active locus in the diagram to stream geometric manifestations.
        </p>
      </div>
    );
  }

  // 2️⃣ 核心策略：动态按类型渲染具体的几何/数理交互画布
  const renderVisualCanvas = () => {
    switch (visualConfig.type) {
      case 'basics-plot':
        return <BasicsVisualizer data={visualConfig.data} />;
        
      case 'topology-3d':
        return <TopologyVisualizer data={visualConfig.data} />;
        
      case 'algebra-sequence':
        return <AlgebraVisualizer data={visualConfig.data} />;

      case 'analysis-space':
        return <AnalysisVisualizer data={visualConfig.data} />;

      case 'discrete-graph':
        return <DiscreteVisualizer data={visualConfig.data} />;
        
      default:
        return (
          <div className="p-4 text-[10px] font-mono text-zinc-600">
            Unknown structural type: {visualConfig.type}
          </div>
        );
    }
  };

  // 3️⃣ 统一版面布局：上方为交互图形舞台，下方为由 AI 注入的严密 LaTeX 学术内容卡片
  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
      
      {/* 🔮 动态几何模型 / 交互滑块舞台 */}
      <div className="flex-1 min-h-[300px] bg-zinc-950/20 border border-zinc-900 rounded-2xl relative mb-4">
        {renderVisualCanvas()}
      </div>

      {/* 🪐 严密数理逻辑：Formal Definition 展示区 */}
      {visualConfig.data?.definition && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl mb-4">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">
            Formal Definition
          </div>
          <MathRenderer content={visualConfig.data.definition} />
        </div>
      )}

      {/* 🧪 严密数理逻辑：Illustrative Counter / Example 展示区 */}
      {visualConfig.data?.example && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">
            Illustrative Counter / Example
          </div>
          <MathRenderer content={visualConfig.data.example} />
        </div>
      )}
      
    </div>
  );
}
"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';
import BasicsVisualizer from './basics';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import AnalysisVisualizer from './analysis';
import DiscreteVisualizer from './discrete';

export default function DynamicVisualizer() {
  // 从 store 中安全取出 visualConfig
  const { visualConfig } = useMathStore();

  // 🛡️ 安全守卫：如果当前没有激活的节点或配置为空，返回高雅的待机占位提示
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

  // 当确认配置存在时，再安全地进行类型分发
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
}
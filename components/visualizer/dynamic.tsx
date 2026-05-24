"use client";
import React from 'react';
import { useMathStore } from '@/store/useMathStore';
import BasicsVisualizer from './basics';
import AnalysisVisualizer from './analysis';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import DiscreteVisualizer from './discrete';

export default function DynamicVisualizer() {
  const { visualConfig } = useMathStore();

  switch (visualConfig.type) {
    case 'basics-plot':
      // 激活微积分、多变量微积分、简单曲线的可视化
      return <BasicsVisualizer data={visualConfig.data} />;
      
    case 'analysis-stream':
      // 激活分析模块（函数序列、测度分割）
      return <AnalysisVisualizer data={visualConfig.data} />;
      
    case 'topology-3d':
      // 激活拓扑与微分几何模块 (Three.js WebGL)
      return <TopologyVisualizer data={visualConfig.data} />;
      
    case 'algebra-diagram':
      // 激活群论、范畴论交换图表
      return <AlgebraVisualizer data={visualConfig.data} />;
      
    case 'discrete-combinatorics':
      // 激活组合数学图论与概率空间
      return <DiscreteVisualizer data={visualConfig.data} />;
      
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs italic p-6 text-center">
          <div>Axiom Engine Idle</div>
          <div className="text-[10px] mt-1 text-zinc-700">INPUT A PROBLEM TO COMPUTE VISUAL RADICES</div>
        </div>
      );
  }
}
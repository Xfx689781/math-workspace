"use client";
import React, { useState } from 'react';

interface BasicsProps {
  data: {
    expression: string;
    type: 'single-variable' | 'multivariable-slice';
    points: Array<{ x: number; y: number }>;
    tangentSlope?: number;
  };
}

export default function BasicsVisualizer({ data }: BasicsProps) {
  const [sliderVal, setSliderVal] = useState(50); // 用于多变量微积分切片或切点移动的互动

  return (
    <div className="w-full h-full flex flex-col p-4 bg-zinc-950 font-mono text-xs text-zinc-400 justify-between">
      <div className="text-[10px] text-zinc-600 tracking-wider mb-2">
        BASICS_RENDERER // EXPRESSION: {data.expression || 'f(x)'}
      </div>

      {/* 2D/2.5D 图形视口 */}
      <div className="flex-1 border border-zinc-900 rounded-xl bg-black relative flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 200">
          {/* 坐标轴 */}
          <line x1="20" y1="100" x2="280" y2="100" stroke="#27272a" strokeWidth="1" />
          <line x1="150" y1="10" x2="150" y2="190" stroke="#27272a" strokeWidth="1" />
          
          {/* 如果是多变量微积分，绘制多层等高线或切片阴影 */}
          {data.type === 'multivariable-slice' && (
            <g opacity="0.3">
              <path d="M 50,150 Q 150,50 250,150" fill="none" stroke="#2563eb" strokeWidth="1" />
              <path d="M 50,130 Q 150,30 250,130" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <path d="M 50,110 Q 150,10 250,110" fill="none" stroke="#60a5fa" strokeWidth="1" />
            </g>
          )}

          {/* 主函数曲线渲染 */}
          <path 
            d="M 50,140 Q 150,20 250,160" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2" 
          />

          {/* 互动切点点缀 */}
          <circle cx={50 + sliderVal * 2} cy={140 - sliderVal * 0.8} r="4" fill="#f59e0b" />
        </svg>
      </div>

      {/* 过程式学习控件：允许用户随意拖动参数，直观理解偏导数/导数变化 */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span>Interactive Domain Slider (<code className="text-amber-500">x_0</code>)</span>
          <span className="text-zinc-500">Value: {(sliderVal / 50).toFixed(2)}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
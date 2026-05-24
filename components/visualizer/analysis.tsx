"use client";
import React, { useState } from 'react';

export default function AnalysisVisualizer({ data }: { data: any }) {
  // 允许用户在右侧面板直接进行可互动微调：拖动 n 的阶数
  const [n, setN] = useState(4);
  const [epsilon, setEpsilon] = useState(0.12);

  if (!data) return null;

  // 生成 f_n(x) = x^n 在 [0, 1] 区间的 SVG 采样路径点
  const generatePath = (power: number) => {
    let points = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const y = Math.pow(x, power);
      // 映射到 SVG 坐标画布 (宽300，高200，Y轴反转)
      const svgX = 40 + x * 220;
      const svgY = 160 - y * 120;
      points.push(`${svgX},${svgY}`);
    }
    return points.join(' ');
  };

  return (
    <div className="w-full h-full bg-[#050506] p-5 flex flex-col space-y-5 overflow-y-auto select-none border-t border-zinc-900 lg:border-t-0">
      <div>
        <span className="text-[9px] font-mono tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
          REAL ANALYSIS // LOCUS
        </span>
        <h2 className="text-sm font-bold text-zinc-200 font-mono mt-2">{data.title}</h2>
      </div>

      {/* 📘 严谨的学术定义与公式展现 */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Formal Definition</h4>
          <p className="text-xs text-zinc-300 font-serif leading-relaxed mt-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/60 overflow-x-auto text-center italic">
            {data.definition}
          </p>
        </div>

        {data.proof && (
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Rigorous Proof Structure</h4>
            <p className="text-[11px] text-zinc-400 font-serif leading-relaxed mt-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/40">
              {data.proof}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Illustrative Counter / Example</h4>
          <p className="text-[11px] text-zinc-400 font-serif leading-relaxed mt-1">
            {data.example}
          </p>
        </div>
      </div>

      {/* 📈 几何直观可互动引擎 (Interactive Manifestation) */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-4 flex flex-col space-y-4">
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          Interactive Live Geometrical Model
        </h4>

        {data.interactiveType === 'epsilon-tube' && (
          <div className="space-y-4">
            {/* SVG 渲染数学几何图像 */}
            <div className="w-full h-44 bg-[#030303] border border-zinc-900 rounded-xl relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 200">
                {/* 坐标轴 */}
                <line x1="40" y1="160" x2="270" y2="160" stroke="#27272a" strokeWidth="1" />
                <line x1="40" y1="30" x2="40" y2="160" stroke="#27272a" strokeWidth="1" />
                <text x="275" y="164" fill="#52525b" fontSize="8" fontFamily="monospace">x</text>
                <text x="36" y="25" fill="#52525b" fontSize="8" fontFamily="monospace">y</text>

                {/* 极限函数 f(x) = 0 标记 */}
                <line x1="40" y1="160" x2="260" y2="160" stroke="#52525b" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* 🌟 核心：Epsilon-Tube 挤压带渲染 (几何化直观) */}
                <rect 
                  x="40" 
                  y={160 - epsilon * 120} 
                  width="220" 
                  height={epsilon * 240} 
                  fill="rgba(59, 130, 246, 0.04)" 
                  stroke="rgba(59, 130, 246, 0.15)"
                  strokeDasharray="2,2"
                />
                <text x="45" y={155 - epsilon * 120} fill="#3b82f6" fontSize="7" fontFamily="monospace" opacity="0.6">
                  f(x) + ε
                </text>

                {/* 动态逼近曲线 f_n(x) = x^n */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  points={generatePath(n)}
                  className="transition-all duration-150 ease-out"
                />
                
                {/* 边界标识 */}
                <text x="255" y="172" fill="#52525b" fontSize="8" fontFamily="monospace">1</text>
              </svg>

              <div className="absolute top-2 right-3 text-[8px] font-mono text-zinc-600 bg-zinc-900/50 px-1.5 py-0.5 rounded">
                RED: f_{n}(x) // BLUE: ε-Tube
              </div>
            </div>

            {/* 控制拉条 */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500">SEQUENCE INDEX (n)</span>
                <span className="text-red-400 font-bold">n = {n}</span>
              </div>
              <input 
                type="range" min="1" max="24" value={n} 
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full accent-blue-500 bg-zinc-900 h-1 rounded"
              />

              <div className="flex justify-between items-center text-[10px] font-mono mt-2">
                <span className="text-zinc-500">TOLERANCE BOUND (ε)</span>
                <span className="text-blue-400 font-bold">ε = {epsilon.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.05" max="0.4" step="0.01" value={epsilon} 
                onChange={(e) => setEpsilon(Number(e.target.value))}
                className="w-full accent-blue-500 bg-zinc-900 h-1 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
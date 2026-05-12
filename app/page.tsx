"use client";
import React, { useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';

// 1. 定义更具学术感的自定义样式 (Visualizer Style)
const nodeStyle = {
  background: '#0a0a0a',
  color: '#f4f4f5',
  border: '1px solid #27272a',
  borderRadius: '12px',
  padding: '15px',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
  width: 200,
  textAlign: 'center' as const,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
};

const initialNodes = [
  { 
    id: '1', 
    data: { label: 'Lebesgue Measure Space (X, Σ, μ)' }, 
    position: { x: 250, y: 50 },
    style: { ...nodeStyle, borderColor: '#3b82f6' } 
  },
  { 
    id: '2', 
    data: { label: 'Outer Measure μ*' }, 
    position: { x: 50, y: 200 },
    style: nodeStyle 
  },
  { 
    id: '3', 
    data: { label: 'Carathéodory Criterion' }, 
    position: { x: 450, y: 200 },
    style: nodeStyle 
  },
  { 
    id: '4', 
    data: { label: 'Limit Process on Manifold' }, 
    position: { x: 250, y: 350 },
    style: { ...nodeStyle, borderColor: '#10b981' } 
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'Generates' },
  { id: 'e2-3', source: '2', target: '3', label: 'Restricts' },
  { id: 'e3-1', source: '3', target: '1', label: 'Defines Σ', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-4', source: '1', target: '4', animated: true, label: 'Metric Link', style: { stroke: '#10b981' } },
];

export default function MathWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <div className="w-screen h-screen bg-[#050505]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        {/* 透明悬浮面板 - 增加商业科技感 */}
        <Panel position="top-left" className="m-6 p-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl w-80">
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Math Workspace</h1>
          <p className="text-xs text-zinc-500 mt-1 mb-6">Structuralist Intelligence Engine</p>
          
          <div className="space-y-3">
            <div className="group relative">
              <input 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 outline-none focus:border-blue-500 transition-all"
                placeholder="Enter concept (e.g. Adjoint, Scheme...)"
              />
            </div>
            <button className="w-full bg-zinc-100 text-black py-2.5 rounded-lg text-xs font-bold hover:bg-white transition-colors">
              GENERATE STRUCTURE
            </button>
            <button className="w-full border border-zinc-800 text-zinc-400 py-2.5 rounded-lg text-xs font-bold hover:bg-zinc-900 transition-colors">
              ANALYZE PROOF PATH
            </button>
          </div>
        </Panel>

        <Background color="#111" gap={20} size={1} />
        <Controls className="bg-zinc-800 border-zinc-700 fill-white" />
      </ReactFlow>
    </div>
  );
}
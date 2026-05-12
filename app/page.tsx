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

// 模拟 AI 生成的高级数学结构 (例如 Lebesgue Integration 的前置结构)
const initialNodes = [
  { 
    id: '1', 
    data: { label: 'Measurable Space $(X, \mathcal{F})$' }, 
    position: { x: 250, y: 0 },
    className: 'p-6 bg-zinc-900 border-2 border-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] font-mono w-64'
  },
  { 
    id: '2', 
    data: { label: 'Simple Functions $\phi = \sum a_i \chi_{E_i}$' }, 
    position: { x: 0, y: 150 },
    className: 'p-4 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg w-60'
  },
  { 
    id: '3', 
    data: { label: 'Lebesgue Integral $\int f d\mu$' }, 
    position: { x: 500, y: 150 },
    className: 'p-4 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg w-60'
  },
];

const initialEdges = [
  { 
    id: 'e1-2', source: '1', target: '2', label: 'defines basis', 
    animated: true, style: { stroke: '#3b82f6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } 
  },
  { 
    id: 'e2-3', source: '2', target: '3', label: 'supremum limit', 
    style: { stroke: '#10b981' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } 
  }
];

export default function MathUniverse() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <div className="w-screen h-screen bg-[#050505] font-sans">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        {/* Floating AI Command Panel */}
        <Panel position="top-left" className="m-8">
          <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-2xl w-80">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <h2 className="text-white font-bold tracking-widest text-sm">COGNITIVE ENGINE</h2>
            </div>
            <input 
              placeholder="Input structure (e.g. Adjoint, Scheme...)" 
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white text-xs mb-4 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-black text-[10px] font-black py-2 rounded uppercase hover:bg-blue-500 hover:text-white transition-all">
                Map Topology
              </button>
              <button className="flex-1 border border-zinc-700 text-zinc-400 text-[10px] font-black py-2 rounded uppercase hover:bg-zinc-800">
                Verify Proof
              </button>
            </div>
          </div>
        </Panel>

        {/* Global Structural Metrics */}
        <Panel position="bottom-right" className="m-8 text-right">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
            Structuralist Workspace v1.0.4<br/>
            Nodes: {nodes.length} | Edges: {edges.length}<br/>
            Engine: AI-Powered Lattice Generation
          </div>
        </Panel>

        <Background color="#1a1a1a" gap={40} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
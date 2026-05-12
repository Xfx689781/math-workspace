"use client";
import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// 初始化的数学结构节点（以代数几何为例）
const initialNodes = [
  { 
    id: '1', 
    type: 'input',
    data: { label: 'Spec(R): Affine Scheme' }, 
    position: { x: 250, y: 5 },
    className: 'bg-zinc-900 text-white border-blue-500 border-2 p-4 rounded-lg shadow-2xl'
  },
  { 
    id: '2', 
    data: { label: 'Structure Sheaf: O_X' }, 
    position: { x: 100, y: 150 },
    className: 'bg-zinc-900 text-zinc-300 border-zinc-700 p-3 rounded-md'
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'induces', animated: true, style: { stroke: '#3b82f6' } }
];

export default function MathWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  return (
    <div className="w-screen h-screen bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Panel position="top-left" className="bg-zinc-900/80 backdrop-blur-md p-6 border border-zinc-800 rounded-xl m-4">
          <h1 className="text-2xl font-bold text-white tracking-tighter">MATH UNIVERSE <span className="text-blue-500">v1.0</span></h1>
          <p className="text-zinc-500 text-sm mt-1 mb-4 italic">Structuralism-based Reasoning Engine</p>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all">
              Derive Structure
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-md text-sm font-medium transition-all">
              Proof Assistant
            </button>
          </div>
        </Panel>
        
        <Background color="#222" gap={20} />
        <Controls className="bg-zinc-800 border-zinc-700 fill-white" />
      </ReactFlow>
    </div>
  );
}
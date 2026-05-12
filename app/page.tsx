"use client";
import React, { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// 定制化的学术风格
const nodeStyles = "bg-[#121212] border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-2xl min-w-[150px] font-mono text-sm";

export default function MathWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState("");

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const exploreStructure = async () => {
    const res = await fetch('/api/parse', {
      method: 'POST',
      body: JSON.stringify({ concept: input }),
    });
    const data = await res.json();

    // 将 AI 生成的结构转化为 React Flow 节点
    const newNodes = data.nodes.map((n: any, index: number) => ({
      id: n.id,
      position: { x: 100 + index * 200, y: 150 + (index % 2) * 100 },
      data: { label: n.label },
      className: nodeStyles
    }));

    setNodes(newNodes);
    setEdges(data.edges);
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-zinc-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        {/* 左上角控制面板：真正的 Workspace 交互感 */}
        <Panel position="top-left" className="bg-[#121212]/90 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl m-6 w-96 shadow-2xl">
          <h1 className="text-xl font-bold tracking-tighter text-white mb-1">AXIOMATIC SPACE</h1>
          <p className="text-xs text-zinc-500 mb-6">Structural Visualization Engine</p>
          
          <input 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm mb-4 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Search structure (e.g. Adjoint, Lebesgue...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={exploreStructure}
              className="bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-all"
            >
              GENERATE MAP
            </button>
            <button className="bg-zinc-800 text-zinc-300 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700">
              PROOF MODE
            </button>
          </div>
        </Panel>

        <Background color="#222" gap={30} size={1} />
        <Controls className="fill-white bg-zinc-800 border-zinc-700" />
      </ReactFlow>
    </div>
  );
}
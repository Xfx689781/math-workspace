"use client";
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useMathStore } from '@/store/useMathStore';

import PremiseNode from './nodes/premise_node';
import TheoremNode from './nodes/theorem_node';
import ContradictionNode from './nodes/contradiction_node';

export default function WorkspaceGraph() {
  const { nodes, edges, activeNodeId, setActiveNode, isSolving } = useMathStore();

  const nodeTypes = useMemo(() => ({
    premise: PremiseNode,
    theorem: TheoremNode,
    contradiction: ContradictionNode,
  }), []);

  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((node, index) => ({
      id: node.id,
      type: node.type, 
      position: { 
        x: 150 + index * 280, 
        y: 200 + (index % 2 === 0 ? 0 : 90) 
      },
      data: { 
        label: node.label,
        isActive: activeNodeId === node.id 
      },
    }));
  }, [nodes, activeNodeId]);

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
      labelStyle: { fill: '#71717a', fontSize: 9, fontFamily: 'monospace', backgroundColor: '#030303' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }));
  }, [edges]);

  return (
    <div className="w-full h-full bg-[#030303] relative flex items-center justify-center">
      {/* 🚀 华丽的空状态/加载中全屏占位 */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none p-8 animate-fade-in">
          {isSolving ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
              <p className="text-xs font-mono tracking-[0.2em] text-zinc-400 uppercase animate-pulse">
                Parsing Cognitive Axioms...
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3 max-w-md">
              <div className="w-24 h-24 mx-auto border border-dashed border-zinc-800 rounded-full flex items-center justify-center opacity-40 animate-[spin_60s_linear_infinite]">
                <div className="w-16 h-16 border border-zinc-700 rounded-full border-t-blue-500/30" />
              </div>
              <h3 className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase mt-4">
                Workspace Empty
              </h3>
              <p className="text-[11px] text-zinc-600 font-serif max-w-xs leading-relaxed mx-auto">
                Enter an abstract conjecture (e.g., "separation axioms") above to extract non-linear topological dependencies.
              </p>
            </div>
          )}
        </div>
      )}

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setActiveNode(node.id)}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#141416" gap={30} size={1} />
        <Controls className="fill-zinc-600 bg-zinc-950 border-zinc-900 stroke-none [&>button]:border-zinc-900 hover:[&>button]:bg-zinc-900" />
      </ReactFlow>
    </div>
  );
}
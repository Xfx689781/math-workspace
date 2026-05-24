"use client";
import React, { useMemo } from 'react';
import ReactFlow, { Background, Node, Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useMathStore } from '@/store/useMathStore';

import PremiseNode from '../canvas/nodes/premise_node';
import TheoremNode from '../canvas/nodes/theorem_node';
import ContradictionNode from '../canvas/nodes/contradiction_node';

export default function Inspector() {
  const { nodes, edges, activeNodeId, setActiveNode, isSolving } = useMathStore();

  const nodeTypes = useMemo(() => ({
    premise: PremiseNode,
    theorem: TheoremNode,
    contradiction: ContradictionNode,
  }), []);

  // 🚀 纵向垂直流排版系统：确保所有卡片在右侧栏规整排开，不发生左右重叠倾轧
  const verticalFlowNodes: Node[] = useMemo(() => {
    return nodes.map((node, index) => ({
      id: node.id,
      type: node.type,
      position: { x: 20, y: 30 + index * 130 }, 
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
      labelStyle: { fill: '#52525b', fontSize: 8, fontFamily: 'monospace', backgroundColor: '#070708' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }));
  }, [edges]);

  return (
    <aside className="w-80 bg-[#070708] border-l border-zinc-900 flex flex-col z-20 overflow-hidden shrink-0">
      <div className="p-4 border-b border-zinc-900 bg-[#0b0b0d]">
        <h3 className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          Axiomatic Dependency Tree
        </h3>
        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-tight mt-0.5">
          Vertical Topological DAG Flow
        </p>
      </div>

      <div className="flex-1 relative bg-[#040405]">
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              {isSolving ? "Compiling Graph..." : "No Active Graph"}
            </p>
          </div>
        )}

        <ReactFlow
          nodes={verticalFlowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setActiveNode(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.2}
          panOnDrag={true}
          zoomOnScroll={false}
        >
          <Background color="#111" gap={20} size={0.5} />
        </ReactFlow>
      </div>
    </aside>
  );
}
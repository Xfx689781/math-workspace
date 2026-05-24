"use client";
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useMathStore } from '@/store/useMathStore';

// 引入自定义的三个数学节点组件
import PremiseNode from './nodes/premise_node';
import TheoremNode from './nodes/theorem_node';
import ContradictionNode from './nodes/contradiction_node';

export default function WorkspaceGraph() {
  const { nodes, edges, activeNodeId, setActiveNode } = useMathStore();

  // 映射自定义节点类型到 React Flow 核心
  const nodeTypes = useMemo(() => ({
    premise: PremiseNode,
    theorem: TheoremNode,
    contradiction: ContradictionNode,
  }), []);

  // 转换 Zustand 节点为标准 Flow 节点，并计算排布坐标以防止重叠
  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((node, index) => ({
      id: node.id,
      type: node.type, 
      position: { 
        x: 180 + index * 260, 
        y: 220 + (index % 2 === 0 ? 0 : 70) 
      },
      data: { 
        label: node.label,
        isActive: activeNodeId === node.id 
      },
    }));
  }, [nodes, activeNodeId]);

  // 转换 Zustand 边数据，配置动态发光与箭头导向
  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
      labelStyle: { fill: '#52525b', fontSize: 10, fontFamily: 'monospace', backgroundColor: '#030303' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }));
  }, [edges]);

  return (
    <div className="w-full h-full bg-[#030303]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setActiveNode(node.id)}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        {/* 暗黑学术网格背景 */}
        <Background color="#18181b" gap={40} size={1} />
        {/* 覆盖默认样式的缩放控制器 */}
        <Controls className="fill-zinc-500 bg-zinc-950 border-zinc-900 stroke-none [&>button]:border-zinc-900 hover:[&>button]:bg-zinc-900" />
      </ReactFlow>
    </div>
  );
}
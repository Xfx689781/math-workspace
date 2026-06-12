"use client";
import { useMemo } from 'react';

interface GNode { id: string; label: string }
interface GEdge { from: string; to: string; label?: string; weight?: number }

export default function DiscreteVisualizer({ data }: { data: any }) {
  const params = data?.params || {};
  const rawNodes: GNode[] = params.nodes?.length
    ? params.nodes
    : [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
  const rawEdges: GEdge[] = params.edges?.length
    ? params.edges
    : [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }];
  const isDirected: boolean = params.graphType !== 'undirected';
  const graphLabel: string = params.label || 'Graph Structure';

  const SVG_W = 300;
  const SVG_H = 160;
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const radius = Math.min(SVG_W, SVG_H) * 0.35;
  const NODE_R = 14;
  const N = rawNodes.length;

  // Circular layout
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    if (N === 1) {
      pos[rawNodes[0].id] = { x: cx, y: cy };
    } else {
      rawNodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / N - Math.PI / 2;
        pos[node.id] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
      });
    }
    return pos;
  }, [rawNodes, N, cx, cy, radius]);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 p-4 font-mono">
      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
        {graphLabel}
        <span className="ml-2 text-purple-500">{isDirected ? 'DIRECTED' : 'UNDIRECTED'}</span>
      </div>

      <div className="flex-1 flex items-center justify-center border border-zinc-900 rounded-xl bg-[#030303] overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: '160px' }}>
          <defs>
            <marker id="darrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#a855f7" />
            </marker>
          </defs>

          {/* Edges */}
          {rawEdges.map((edge, i) => {
            const p1 = positions[edge.from];
            const p2 = positions[edge.to];
            if (!p1 || !p2) return null;

            // Shorten line so arrowhead touches node edge
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist;
            const ny = dy / dist;
            const x1 = p1.x + nx * (NODE_R + 2);
            const y1 = p1.y + ny * (NODE_R + 2);
            const x2 = p2.x - nx * (NODE_R + 5);
            const y2 = p2.y - ny * (NODE_R + 5);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#7e22ce"
                  strokeWidth="1.5"
                  markerEnd={isDirected ? 'url(#darrow)' : undefined}
                />
                {(edge.label || edge.weight !== undefined) && (
                  <text
                    x={midX} y={midY - 4}
                    textAnchor="middle"
                    fill="#a78bfa"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {edge.label || edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {rawNodes.map((node) => {
            const p = positions[node.id];
            if (!p) return null;
            return (
              <g key={node.id}>
                <circle cx={p.x} cy={p.y} r={NODE_R} fill="#09090b" stroke="#7c3aed" strokeWidth="1.5" />
                <text
                  x={p.x} y={p.y + 4}
                  textAnchor="middle"
                  fill="#c4b5fd"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 text-[9px] text-zinc-700 text-center">
        {N} nodes · {rawEdges.length} edges
      </div>
    </div>
  );
}

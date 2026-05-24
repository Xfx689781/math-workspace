import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { query, domain } = await req.json();

  let nodes: any[] = [];
  let edges: any[] = [];
  let visualConfig = { type: 'placeholder', data: {} };

  // 核心逻辑：根据前端传递的 domain，分发不同的图节点和可视化策略
  if (domain === 'basics') {
    nodes = [
      { id: 'b1', label: `Target: ${query || 'Function Space'}`, type: 'premise' },
      { id: 'b2', label: 'Partial Derivatives Matrix', type: 'theorem' },
      { id: 'b3', label: 'Local Linear Approximation', type: 'theorem' }
    ];
    edges = [
      { id: 'be1', source: 'b1', target: 'b2' },
      { id: 'be2', source: 'b2', target: 'b3' }
    ];
    visualConfig = {
      type: 'basics-plot',
      data: { expression: query, type: 'multivariable-slice' }
    };
  } else if (domain === 'topology') {
    nodes = [
      { id: 't1', label: `Space X from Statement`, type: 'premise' },
      { id: 't2', label: 'Fundamental Group $\\pi_1(X)$', type: 'theorem' }
    ];
    edges = [{ id: 'te1', source: 't1', target: 't2' }];
    visualConfig = {
      type: 'topology-3d',
      data: { geometry: 'torus' }
    };
  } else {
    // 默认兜底结构
    nodes = [{ id: 'd1', label: `Parsed node for ${domain}`, type: 'premise' }];
  }

  return NextResponse.json({ nodes, edges, visualConfig });
}
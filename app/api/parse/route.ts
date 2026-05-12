import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { query } = await req.json();

  // AI 应该生成类似如下的结构数据
  const graphData = {
    nodes: [
      { id: 'adj-1', label: 'Hilbert Space $H$', type: 'domain' },
      { id: 'adj-2', label: 'Linear Map $T: H \to H$', type: 'operator' },
      { id: 'adj-3', label: 'Adjoint $T^*: \langle Tv, w \rangle = \langle v, T^*w \rangle$', type: 'definition' },
      { id: 'adj-4', label: 'Self-Adjointness (Spectral Thm)', type: 'insight' }
    ],
    edges: [
      { source: 'adj-1', target: 'adj-2', label: 'supports' },
      { source: 'adj-2', target: 'adj-3', label: 'unique existence' },
      { source: 'adj-3', target: 'adj-4', label: 'leads to' }
    ],
    proofSteps: [
      "Step 1: Riesz Representation Theorem ensures existence.",
      "Step 2: Linear functionals on Hilbert spaces..."
    ]
  };

  return NextResponse.json(graphData);
}
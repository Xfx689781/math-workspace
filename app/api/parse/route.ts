// app/api/parse/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { concept } = await req.json();

  // 这里未来对接 Claude-3.5 或 GPT-4o
  // 模拟 AI 生成 Lebesgue Measure 的结构化图谱
  const structuralMap = {
    nodes: [
      { id: '1', label: 'Algebra of Sets', type: 'base' },
      { id: '2', label: 'Pre-measure $\mu_0$', type: 'construction' },
      { id: '3', label: 'Outer Measure $\mu^*$', type: 'extension' },
      { id: '4', label: 'Carathéodory Measurability', type: 'criterion' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'domain' },
      { id: 'e2-3', source: '2', target: '3', label: 'infimum' },
      { id: 'e3-4', source: '3', target: '4', label: 'restriction' },
    ]
  };

  return NextResponse.json(structuralMap);
}
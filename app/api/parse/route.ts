// 后端需要返回结构化的 JSON，告诉前端如何更新画布
export async function POST(req: Request) {
  const { concept } = await req.json();

  // 模拟深度搜索结果：例如输入 "Lebesgue Measure"
  return Response.json({
    newNodes: [
      { id: 'm1', label: 'Carathéodory Extension', position: { x: 400, y: 200 } },
      { id: 'm2', label: '$\sigma$-algebra of Measurable Sets', position: { x: 400, y: 350 } }
    ],
    newEdges: [
      { source: 'concept', target: 'm1', label: 'construction' },
      { source: 'm1', target: 'm2', label: 'defines' }
    ],
    proofInsight: "The measure is built via pre-measure on a ring, then extended using the outer measure infimum."
  });
}
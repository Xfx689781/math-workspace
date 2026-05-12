import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { formula } = await req.json();

    // 模拟 AI/数学引擎的灵感生成逻辑
    let inspiration = "这是一个有趣的结构。";
    if (formula.includes('^2')) {
      inspiration = "检测到平方项，建议联想勾股定理或圆的参数方程。";
    } else if (formula.includes('\\int') || formula.includes('dx')) {
      inspiration = "这是一个微积分表达式，建议检查其收敛性或尝试分部积分。";
    }

    return NextResponse.json({ 
      suggestion: inspiration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
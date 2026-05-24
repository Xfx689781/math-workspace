import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 初始化客户端。如果要用 DeepSeek，可以加上 baseURL: "https://api.deepseek.com/v1"
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 🪐 物理定轨：调用大模型，并强制开启 json_object 模式
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // 或者切换为 deepseek-chat 等具备强数理逻辑的模型
      response_format: { type: 'json_object' },
      temperature: 0.1, // 极低温度，确保生成的数学结构稳定，不胡说八道
      messages: [
        {
          role: 'system',
          content: `You are an advanced Structuralist Mathematics Reasoning Engine. 
Your task is to parse a mathematical term/query, determine its exact mathematical subdomain, and build a localized directed acyclic graph (DAG) of definitions, theorems, or obstructions.

CRITICAL JSON FORMAT RULE:
You must respond with a clean, valid JSON object matching this exact structure:
{
  "activeDomain": "analysis",
  "subdomainLabel": "REAL ANALYSIS (实分析)",
  "nodes": [
    { "id": "n1", "type": "premise", "label": "Short Title" },
    { "id": "n2", "type": "theorem", "label": "Theorem Title" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "implies" }
  ],
  "visualConfigs": {
    "n1": {
      "type": "analysis-space",
      "title": "Full Node Name",
      "definition": "Rigorous description with LaTeX wrapped in double dollar signs, e.g., 'A sequence $$ \\\\{f_n\\\\} $$ converges...'.",
      "example": "Counter-example or example with LaTeX wrapped in double dollar signs.",
      "interactiveType": "epsilon-tube"
    }
  }
}

CRITICAL LATEX RENDERING RULE:
- In the "definition" and "example" fields, all mathematical symbols, expressions, and functions MUST be wrapped in double dollar signs ($$ ... $$) so the frontend Markdown compiler can detect them.
- Example: Use "$$ \\\\forall \\\\varepsilon > 0 $$" instead of raw text. 
- Ensure all backslashes inside JSON strings are properly escaped as double backslashes (\\\\) or quadruple backslashes (\\\\\\\\) so the JSON parsing doesn't break.`
        },
        {
          role: 'user',
          content: `Execute axiomatic semantic expansion for: "${query}"`
        }
      ]
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error('Empty response from reasoning core.');

    // 解析出高维数学蓝图 JSON
    const blueprint = JSON.parse(rawContent);
    return NextResponse.json(blueprint);

  } catch (error: any) {
    console.error('Reasoning Pipeline collapsed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
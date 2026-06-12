import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { description, language } = await req.json();
    if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 });

    const langNote = language === 'zh'
      ? 'The user works in Chinese. You may use Chinese text for prose explanations, but all LaTeX commands must remain standard LaTeX.'
      : 'Output in English only.';

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate clean, renderable LaTeX content for: "${description}"

${langNote}

Rules:
- Use $$...$$ for display math blocks (each on its own line)
- Use $...$ for inline math within prose
- Use **bold** for theorem/definition labels (markdown bold, compatible with the renderer)
- Include a brief prose introduction when helpful
- Keep it mathematically precise and well-formatted
- Do NOT wrap in \\documentclass or \\begin{document} — just the content

Output ONLY the content, no explanations about what you did.`
      }]
    });

    const content = response.content.find(b => b.type === 'text');
    const latex = content?.type === 'text' ? content.text.trim() : '';
    return NextResponse.json({ latex });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

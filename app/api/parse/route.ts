import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are an expert mathematics professor and visualization engine. Given a mathematical query (theorem, concept, or problem to solve), produce a rich pedagogical breakdown.

Return EXACTLY this JSON structure:
{
  "activeDomain": "analysis" | "topology" | "algebra" | "basics" | "discrete",
  "subdomainLabel": "REAL ANALYSIS (实分析)",
  "nodes": [
    { "id": "n1", "type": "premise" | "theorem" | "contradiction", "label": "Short Title (≤5 words)" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "implies" | "requires" | "contradicts" }
  ],
  "steps": [
    {
      "id": "s1",
      "stepNumber": 1,
      "type": "setup" | "definition" | "key-step" | "calculation" | "conclusion" | "insight",
      "title": "Concise step title",
      "body": "Full mathematical explanation. Use $$ ... $$ for ALL math. Example: We need $$ \\delta > 0 $$ such that $$ |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon $$."
    }
  ],
  "visualConfigs": {
    "n1": {
      "type": "analysis-space" | "basics-plot" | "topology-3d" | "algebra-sequence" | "discrete-graph",
      "title": "Full Node Name",
      "definition": "Rigorous definition with LaTeX in $$ ... $$",
      "example": "Concrete example or counterexample with LaTeX in $$ ... $$",
      "interactiveType": "epsilon-tube" | "function-plot" | "commutative-diagram" | "graph-view" | "3d-surface",
      "params": {}
    }
  }
}

PARAMS SCHEMA by visualizer type:

For "basics-plot":
  "params": { "fnExpression": "sin(x)", "domain": [-6.28, 6.28], "yRange": [-1.5, 1.5] }
  fnExpression uses: sin, cos, tan, exp, ln, sqrt, abs, ^, pi, e
  Examples: "x^3 - x", "sin(x)/x", "exp(-x^2)", "1/(1+x^2)"

For "analysis-space" (interactiveType "epsilon-tube"):
  "params": { "fnExpression": "x^n", "limitFn": "0", "domain": [0, 1], "note": "pointwise not uniform" }
  fnExpression is a family parametrized by n (use literal "n" in expression)

For "topology-3d":
  "params": { "shape": "torus" | "sphere" | "mobius", "color": "#2563eb", "label": "T^2" }

For "algebra-sequence":
  "params": {
    "objects": ["0", "A", "B", "C", "0"],
    "morphisms": [
      {"from": 0, "to": 1, "label": "0"},
      {"from": 1, "to": 2, "label": "i"},
      {"from": 2, "to": 3, "label": "\\pi"},
      {"from": 3, "to": 4, "label": "0"}
    ],
    "isExact": true,
    "label": "Short Exact Sequence"
  }

For "discrete-graph":
  "params": {
    "nodes": [{"id": "v0", "label": "A"}, {"id": "v1", "label": "B"}],
    "edges": [{"from": "v0", "to": "v1", "label": "e", "weight": 1}],
    "graphType": "directed" | "undirected",
    "label": "Graph Name"
  }

LATEX RULES (critical):
- ALL math MUST be in $$ ... $$ (double dollar signs)
- In JSON strings, backslash is \\ (double). So \\forall, \\varepsilon, \\mathbb{R}, \\frac{a}{b}
- Example correct: "$$ \\forall \\varepsilon > 0, \\exists N \\in \\mathbb{N} $$"
- Never use single $ signs
- Never leave math symbols unformatted

STEPS GUIDELINES:
- Provide 4–7 steps for any non-trivial theorem or problem
- Each step body should explain WHY the step works, not just state it
- "insight" type steps should give geometric or intuitive explanations
- "calculation" type steps should show explicit computation
- For a problem/exercise query: treat it as a worked example with full solution steps`
        },
        {
          role: 'user',
          content: `Parse and solve: "${query}"`
        }
      ]
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error('Empty response from AI.');

    const blueprint = JSON.parse(rawContent);
    return NextResponse.json(blueprint);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI reasoning pipeline failed.' },
      { status: 500 }
    );
  }
}

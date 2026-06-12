import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

const SYSTEM_PROMPT = `You are an expert mathematics professor and interactive visualization engine. Given a mathematical query, produce a rich pedagogical breakdown as JSON.

Return EXACTLY this JSON structure (no markdown, no code fences — raw JSON only):
{
  "activeDomain": "analysis" | "topology" | "algebra" | "basics" | "discrete",
  "subdomainLabel": "string — see LANGUAGE RULES below",
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
      "body": "Full explanation with $$ ... $$ math blocks."
    }
  ],
  "visualConfigs": {
    "n1": {
      "type": "see VISUALIZATION SELECTION below",
      "title": "Full concept name",
      "definition": "Rigorous definition with LaTeX",
      "example": "Concrete example with LaTeX",
      "interactiveType": "string",
      "params": {}
    }
  }
}

━━━ VISUALIZATION SELECTION — DECISION TREE (first matching rule wins) ━━━

RULE 1 — RIEMANN INTEGRATION  → type: "riemann-sum"
  Use when query involves ANY of: Riemann sums, Darboux sums, upper/lower sums,
  Riemann integrability criterion, oscillation of f, mesh of partition, norm ‖P‖,
  integrability of continuous/monotone functions, computing ∫ as a limit of sums,
  the Riemann integral definition, area under a curve.
  EXAMPLES: "Riemann Integrability Criterion", "Darboux sums", "∫₀¹ x² dx",
  "every continuous function on [a,b] is Riemann integrable", "Riemann sum definition".

RULE 2 — EPSILON-DELTA LIMITS / CONTINUITY  → type: "epsilon-delta"
  Use when query involves ANY of: ε-δ definition of a limit, continuity at a point,
  uniform continuity, lim_{x→a} f(x) = L, δ-neighborhood, sequential continuity,
  the definition of a limit.
  EXAMPLES: "ε-δ definition of continuity", "lim x→2 of x²", "uniform continuity on [a,b]".

RULE 3 — TOPOLOGY OF SETS IN ℝⁿ  → type: "set-diagram"
  Use when query involves ANY of: compactness, Heine-Borel, open covers, finite subcovers,
  closed sets, bounded sets, Bolzano-Weierstrass, Baire category, metric balls, neighborhoods,
  connectedness, open/closed sets in ℝⁿ.
  EXAMPLES: "Heine-Borel theorem", "compactness", "Bolzano-Weierstrass".

RULE 4 — SURFACE / MANIFOLD TOPOLOGY  → type: "topology-3d"
  Use ONLY when query involves surfaces or manifolds: Möbius strip, torus, Klein bottle,
  sphere, manifold genus, surface classification, Euler characteristic.
  DO NOT use for Heine-Borel, compactness, or sets in ℝⁿ.

RULE 5 — SEQUENCES OF FUNCTIONS  → type: "analysis-space"
  Use when query involves a PARAMETRIC FAMILY f_n(x) converging to a limit function:
  uniform vs pointwise convergence of {f_n}, convergence of function sequences.
  EXAMPLES: "f_n(x) = x^n on [0,1]", "uniform convergence", "pointwise convergence".
  NOT for sequences of numbers. NOT for limits lim_{x→a}.

RULE 6 — ALGEBRAIC STRUCTURES  → type: "algebra-sequence"
  Use for: groups, rings, fields, exact sequences, commutative diagrams, homomorphisms,
  functors, natural transformations, short exact sequences.

RULE 7 — GRAPH THEORY  → type: "discrete-graph"
  Use for: graphs, trees, networks, planar graphs, graph coloring, Euler path.

RULE 8 — SINGLE FUNCTION (last resort)  → type: "basics-plot"
  Use ONLY when rules 1–7 do not match: derivatives, tangent lines, Taylor series,
  roots/extrema, IVT/MVT/Rolle's illustrated on a curve.
  NEVER use for integration (use riemann-sum), NEVER for ε-δ limits (use epsilon-delta).

━━━ PARAMS SCHEMA ━━━

For "riemann-sum":
  "params": {
    "fnExpression": "x**2",
    "domain": [0, 1],
    "n": 6,
    "sumType": "upper",
    "label": "f(x) = x²",
    "note": "As n → ∞, U(f,P) − L(f,P) → 0: Riemann integrability criterion satisfied"
  }
  fnExpression: same syntax as basics-plot. sumType: "upper" | "lower" | "left" | "right" | "midpoint".
  Choose domain to match the integral. Choose fnExpression that is the function being integrated.

For "epsilon-delta":
  "params": {
    "fnExpression": "x**2",
    "a": 2,
    "L": 4,
    "domain": [0, 4],
    "epsilon": 1.0,
    "delta": 0.45,
    "note": "Choose δ = min(1, ε/5): then 0 < |x-2| < δ ⟹ |x²-4| < ε"
  }
  "a" is the point, "L" is the limit value (compute L = f(a) for continuous f).
  "domain" should bracket [a−2.5, a+2.5]. "delta" should be a valid δ for the given ε.

For "set-diagram":
  "params": {
    "setType": "closed-disk" | "closed-rect",
    "centerX": 0, "centerY": 0, "radius": 1.0,
    "coverBalls": [
      {"cx": -0.7, "cy":  0.7, "r": 0.8}, {"cx":  0.7, "cy":  0.7, "r": 0.8},
      {"cx": -0.7, "cy": -0.7, "r": 0.8}, {"cx":  0.7, "cy": -0.7, "r": 0.8},
      {"cx":  0.0, "cy":  1.3, "r": 0.6}, {"cx":  0.0, "cy": -1.3, "r": 0.6},
      {"cx":  1.4, "cy":  0.0, "r": 0.5}, {"cx": -1.4, "cy":  0.0, "r": 0.5}
    ],
    "finiteSubcover": [0, 1, 2, 3],
    "label": "K = \\\\overline{B}(0,1) \\\\subseteq \\\\mathbb{R}^2",
    "note": "4 open balls suffice — Heine-Borel: closed + bounded ⟹ compact"
  }
  RULES: coverBalls must actually COVER the full set K. finiteSubcover must also fully cover K.

For "basics-plot":
  "params": { "fnExpression": "sin(x)", "domain": [-6.28, 6.28], "yRange": [-1.5, 1.5] }
  fnExpression: sin, cos, tan, exp, ln, sqrt, abs, ^, pi, e. Examples: "x^3-x", "exp(-x^2)"

For "analysis-space":
  "params": { "fnExpression": "x**n", "limitFn": "0", "domain": [0, 1], "note": "pointwise not uniform" }

For "topology-3d":
  "params": { "shape": "torus" | "sphere" | "mobius", "color": "#2563eb", "label": "T²" }

For "algebra-sequence":
  "params": {
    "objects": ["0", "A", "B", "C", "0"],
    "morphisms": [
      {"from": 0, "to": 1, "label": "0"}, {"from": 1, "to": 2, "label": "i"},
      {"from": 2, "to": 3, "label": "\\\\pi"}, {"from": 3, "to": 4, "label": "0"}
    ],
    "isExact": true, "label": "Short Exact Sequence"
  }

For "discrete-graph":
  "params": {
    "nodes": [{"id": "v0", "label": "A"}, {"id": "v1", "label": "B"}],
    "edges": [{"from": "v0", "to": "v1", "label": "e", "weight": 1}],
    "graphType": "directed" | "undirected", "label": "Graph Name"
  }

━━━ LATEX RULES ━━━
- ALL math in $$ ... $$ (display) or in text as part of prose
- In JSON strings: backslash → \\\\ (quadruple in source = double in JSON string)
- Example: "$$ \\\\forall \\\\varepsilon > 0, \\\\exists N \\\\in \\\\mathbb{N} $$"
- Never single $ signs. Never bare math symbols.

━━━ STEPS GUIDELINES ━━━
- 4–7 steps for any non-trivial theorem or problem
- Explain WHY each step works, not just state it
- "insight" steps: geometric or intuitive explanation
- "calculation" steps: explicit computation with numbers

━━━ PROOF MANDATE — CRITICAL ━━━
For EVERY theorem query you MUST write a COMPLETE RIGOROUS MATHEMATICAL PROOF in the steps array.
A description of what the theorem says is NOT a proof. PROOFS ARE MANDATORY.

Required proof structure:
  1. type "setup"       → State the theorem EXACTLY. Define all symbols. State what we will prove.
  2. type "definition"  → Define all mathematical objects used (topology, limits, compactness, etc.)
  3. type "key-step"    → First major proof argument with FULL justification citing definitions
  4. type "key-step"    → Additional key steps (use as many as needed — at least 2 key-steps)
  5. type "conclusion"  → Synthesize all key-steps. Write "Therefore [complete statement] ∎"
  6. type "insight"     → Why is this result true geometrically or intuitively?

PROOF RULES (HARD REQUIREMENTS):
- Never omit the proof. Never write "the proof follows from..." without completing it.
- Each key-step must state WHICH prior definition or step it uses as justification.
- For compactness proofs: show the covering argument step by step — exhibit the finite subcover.
- For convergence proofs: exhibit the N(ε) explicitly with the calculation showing it works.
- For algebraic proofs: show every algebraic manipulation inline with $$ ... $$.
- For existence proofs: construct the object or cite the exact existence theorem.
- Write full sentences in each step body, not bullet fragments.
- Display math blocks with $$ ... $$ for every equation.
- Minimum 5 steps total for any real theorem (setup + ≥2 key-steps + conclusion + insight).`;

export async function POST(req: Request) {
  try {
    const { query, mode, language } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

    const languageRule = language === 'zh'
      ? '\n\nLANGUAGE: Chinese mode. subdomainLabel format: "TOPOLOGY (拓扑学)", "ANALYSIS (实分析)", etc. — English name followed by Chinese in parentheses. Step bodies in English; key terms may include Chinese translations.'
      : '\n\nLANGUAGE: English mode. ALL text must be English only. subdomainLabel must be English only: "TOPOLOGY", "REAL ANALYSIS", "ALGEBRA", etc. ZERO Chinese characters anywhere in the response.';

    const modeHint = mode === 'problem'
      ? '\n\nMODE: Problem Solver. Prioritize calculation steps, explicit worked solutions, "calculation" and "conclusion" step types. Visualization should illustrate the problem setup or result.'
      : '\n\nMODE: Theorem Prover. Prioritize formal definitions, proof structure, "definition", "key-step", and "insight" step types. Visualization should directly illustrate the mathematical concept.';

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 20000,
      thinking: { type: 'adaptive' },
      system: `${SYSTEM_PROMPT}${languageRule}${modeHint}\n\nCRITICAL: Respond with a single raw JSON object. No markdown. No code fences. No explanation text. Keep each step body under 400 words to stay within token limits.`,
      messages: [{ role: 'user', content: `Parse and solve: "${query}"` }],
    });

    const content = response.content.find(b => b.type === 'text');
    if (!content || content.type !== 'text') throw new Error('No text in AI response.');

    // Strip code fences, then extract the outermost JSON object robustly
    let raw = content.text
      .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

    // Find first { and last } to handle any stray preamble/suffix
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('AI did not return valid JSON. Try a more specific query.');
    }
    raw = raw.slice(start, end + 1);

    let blueprint: any;
    try {
      blueprint = JSON.parse(raw);
    } catch (jsonErr: any) {
      // Last resort: attempt to recover a partial response (truncation)
      // Truncate at the last complete top-level key that parses
      const safeEnd = raw.lastIndexOf(',"steps"');
      if (safeEnd > 0) {
        try {
          // Try closing the object after the last well-formed step array
          const partial = raw.slice(0, safeEnd) + '}';
          blueprint = JSON.parse(partial);
        } catch {
          throw new Error(`Response was too long and got cut off. Try a shorter or more specific query. (${jsonErr.message})`);
        }
      } else {
        throw new Error(`JSON parse failed — response may have been truncated. Try a more specific query. (${jsonErr.message})`);
      }
    }

    return NextResponse.json(blueprint);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'AI reasoning pipeline failed.' }, { status: 500 });
  }
}

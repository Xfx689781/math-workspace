"use client";
import { useMathStore } from '@/store/useMathStore';
import MathRenderer from './mathrenderer';
import StepByStep from './steps';
import BasicsVisualizer from './basics';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import AnalysisVisualizer from './analysis';
import DiscreteVisualizer from './discrete';
import SetDiagramVisualizer from './setdiagram';
import RiemannSumVisualizer from './riemannsum';
import EpsilonDeltaVisualizer from './epsilondelta';
import LevelSetVisualizer from './levelset';
import GramSchmidtVisualizer from './gramschmidt';
import GroupOrbitVisualizer from './grouporbit';
import Surface3DVisualizer from './surface3d';

const EN = {
  heroTheorem: 'What theorem shall we explore?',
  heroProblem: 'What problem shall we solve?',
  heroSubTheorem: 'Formal definition · Proof steps · Visual structure',
  heroSubProblem: 'Step-by-step · Calculations · Interactive visual',
  phTheorem: 'Enter a theorem, concept, or definition…',
  phProblem: 'Enter a problem or exercise to solve…',
  thinking: 'Reasoning with Claude…',
  thinkingSub: 'Constructing visualization blueprint',
  formalDef: 'Formal Definition',
  proofSol: 'Proof / Solution',
  example: 'Example / Counterexample',
  examplesTheorem: ['Bolzano-Weierstrass theorem', 'Heine-Borel theorem', 'uniform convergence', 'Cauchy sequence', 'intermediate value theorem'],
  examplesProblem: ['prove √2 is irrational', 'compute ∫₀¹ x² dx', "Taylor series of sin(x)", 'eigenvalues of [[1,2],[3,4]]', 'show ℝ is uncountable'],
};
const ZH = {
  heroTheorem: '要探索哪个定理？',
  heroProblem: '要解决哪道题？',
  heroSubTheorem: '形式定义 · 证明步骤 · 可视结构',
  heroSubProblem: '分步解答 · 详细计算 · 交互可视化',
  phTheorem: '输入定理、概念或定义…',
  phProblem: '输入要解决的习题…',
  thinking: '正在用 Claude 推理中…',
  thinkingSub: '构建可视化蓝图',
  formalDef: '正式定义',
  proofSol: '证明 / 解答',
  example: '例子 / 反例',
  examplesTheorem: ['Bolzano-Weierstrass定理', 'Heine-Borel定理', '一致收敛', 'Cauchy列', '介值定理'],
  examplesProblem: ['证明√2∉ℚ', '计算∫₀¹ x² dx', 'sin(x)的Taylor展开', '求矩阵特征值', '证明ℝ不可数'],
};

function EmptyHero() {
  const appMode       = useMathStore(s => s.appMode);
  const language      = useMathStore(s => s.language);
  const currentQuery  = useMathStore(s => s.currentQuery);
  const isSolving     = useMathStore(s => s.isSolving);
  const executeSolver = useMathStore(s => s.executeSolver);

  const t = language === 'zh' ? ZH : EN;
  const isTheorem = appMode === 'theorem';

  if (isSolving) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-5">
        <div className={`w-10 h-10 rounded-full border-2 border-t-transparent animate-spin ${isTheorem ? 'border-blue-500' : 'border-violet-500'}`} />
        <div className="text-center space-y-1">
          <p className="text-sm font-mono text-zinc-400">{t.thinking}</p>
          <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider">{t.thinkingSub}</p>
        </div>
      </div>
    );
  }

  const heroSymbol  = isTheorem ? '∀ε > 0, ∃δ > 0 …' : '∫ f(x) dx = F(b) − F(a)';
  const heroTitle   = isTheorem ? t.heroTheorem : t.heroProblem;
  const heroSub     = isTheorem ? t.heroSubTheorem : t.heroSubProblem;
  const placeholder = isTheorem ? t.phTheorem : t.phProblem;
  const examples    = isTheorem ? t.examplesTheorem : t.examplesProblem;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 gap-8 relative">
      <div className={`absolute w-[500px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-[0.04] ${isTheorem ? 'bg-blue-500' : 'bg-violet-500'}`} />
      <div className="text-center space-y-2 relative">
        <div className={`text-2xl font-serif mb-3 opacity-30 tracking-wide ${isTheorem ? 'text-blue-400' : 'text-violet-400'}`}>
          {heroSymbol}
        </div>
        <h2 className="text-2xl font-bold text-zinc-200 tracking-tight">{heroTitle}</h2>
        <p className="text-xs text-zinc-600 font-mono tracking-wide">{heroSub}</p>
      </div>
      <div className="w-full max-w-2xl space-y-4 relative">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentQuery}
            onChange={e => useMathStore.setState({ currentQuery: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter' && !isSolving) executeSolver(); }}
            placeholder={placeholder}
            autoFocus
            className={`flex-1 bg-zinc-900/70 border rounded-2xl px-6 py-4 text-sm font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 transition-all ${
              isTheorem
                ? 'border-zinc-800 focus:border-blue-500/50 focus:ring-blue-500/15'
                : 'border-zinc-800 focus:border-violet-500/50 focus:ring-violet-500/15'
            }`}
          />
          <button
            onClick={executeSolver}
            disabled={!currentQuery?.trim()}
            className={`shrink-0 w-14 h-14 rounded-2xl text-xl font-bold transition-all duration-300 ${
              currentQuery?.trim()
                ? isTheorem
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.35)]'
                  : 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.35)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-700 cursor-not-allowed'
            }`}
          >→</button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => useMathStore.setState({ currentQuery: ex })}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                isTheorem
                  ? 'border-blue-900/30 text-blue-900 hover:text-blue-400 hover:border-blue-700/50 bg-blue-950/10'
                  : 'border-violet-900/30 text-violet-900 hover:text-violet-400 hover:border-violet-700/50 bg-violet-950/10'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderCanvas(type: string, data: any) {
  switch (type) {
    case 'basics-plot':      return <BasicsVisualizer data={data} />;
    case 'topology-3d':      return <TopologyVisualizer data={data} />;
    case 'algebra-sequence': return <AlgebraVisualizer data={data} />;
    case 'analysis-space':   return <AnalysisVisualizer data={data} />;
    case 'discrete-graph':   return <DiscreteVisualizer data={data} />;
    case 'set-diagram':      return <SetDiagramVisualizer data={data} />;
    case 'riemann-sum':      return <RiemannSumVisualizer data={data} />;
    case 'epsilon-delta':    return <EpsilonDeltaVisualizer data={data} />;
    case 'level-set':        return <LevelSetVisualizer data={data} />;
    case 'gram-schmidt':     return <GramSchmidtVisualizer data={data} />;
    case 'group-orbit':      return <GroupOrbitVisualizer data={data} />;
    case 'surface-3d':       return <Surface3DVisualizer data={data} />;
    default: return null;
  }
}

// ── Text-only layout: theorem proof or problem solution without a canvas ──
function TextOnlyResult() {
  const { visualConfig, steps, language, appMode } = useMathStore();
  const t = language === 'zh' ? ZH : EN;
  const isTheorem = appMode === 'theorem';

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* Subdomain label */}
        {visualConfig?.subdomainLabel && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-[0.25em] text-blue-500/80 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-md uppercase">
              {visualConfig.subdomainLabel}
            </span>
            <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
              isTheorem
                ? 'text-blue-600 border-blue-900/30 bg-blue-950/10'
                : 'text-violet-600 border-violet-900/30 bg-violet-950/10'
            }`}>
              {isTheorem ? 'Theorem' : 'Problem'}
            </span>
          </div>
        )}

        {/* Title */}
        {visualConfig?.data?.title && (
          <h1 className="text-xl font-bold text-zinc-100 leading-snug tracking-tight">
            {visualConfig.data.title}
          </h1>
        )}

        {/* Formal Definition */}
        {visualConfig?.data?.definition && (
          <div className={`rounded-xl border p-5 ${
            isTheorem ? 'border-blue-900/40 bg-blue-950/10' : 'border-violet-900/40 bg-violet-950/10'
          }`}>
            <div className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-3 ${
              isTheorem ? 'text-blue-500' : 'text-violet-500'
            }`}>
              {t.formalDef}
            </div>
            <MathRenderer content={visualConfig.data.definition} />
          </div>
        )}

        {/* Proof / Solution steps */}
        {steps.length > 0 && (
          <div>
            <StepByStep steps={steps} mode={appMode} />
          </div>
        )}

        {/* Example */}
        {visualConfig?.data?.example && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-600 mb-3">
              {t.example}
            </div>
            <MathRenderer content={visualConfig.data.example} />
          </div>
        )}

      </div>
    </div>
  );
}

// ── Canvas layout: visualization + definition + steps ──
function CanvasResult() {
  const { visualConfig, steps, language, appMode } = useMathStore();
  const t = language === 'zh' ? ZH : EN;
  const isTheorem = appMode === 'theorem';
  if (!visualConfig) return null;

  const canvas = renderCanvas(visualConfig.type, visualConfig.data);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">

        {/* Label row */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-[0.25em] text-blue-500/80 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-md uppercase">
            {visualConfig.subdomainLabel}
          </span>
          {visualConfig.data?.title && (
            <span className="text-sm font-semibold text-zinc-300 truncate flex-1">
              {visualConfig.data.title}
            </span>
          )}
        </div>

        {/* Canvas — taller for 3D types */}
        {canvas && (
          <div className={`rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/20 ${
            visualConfig.type === 'topology-3d' || visualConfig.type === 'surface-3d'
              ? 'h-[400px]'
              : 'h-[290px]'
          }`}>
            {canvas}
          </div>
        )}

        {/* Definition */}
        {visualConfig.data?.definition && (
          <div className={`rounded-xl border p-4 ${
            isTheorem ? 'border-blue-900/40 bg-blue-950/10' : 'border-violet-900/40 bg-violet-950/10'
          }`}>
            <div className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-2.5 ${
              isTheorem ? 'text-blue-500' : 'text-violet-500'
            }`}>
              {t.formalDef}
            </div>
            <MathRenderer content={visualConfig.data.definition} />
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="rounded-xl border border-zinc-900/60 bg-zinc-950/30 p-4">
            <StepByStep steps={steps} mode={appMode} />
          </div>
        )}

        {/* Example */}
        {visualConfig.data?.example && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-600 mb-2.5">
              {t.example}
            </div>
            <MathRenderer content={visualConfig.data.example} />
          </div>
        )}

      </div>
    </div>
  );
}

export default function DynamicVisualizer() {
  const { visualConfig, steps, errorMessage } = useMathStore();

  if (errorMessage && !visualConfig && steps.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-full max-w-md bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6">
          <div className="text-[10px] font-mono tracking-widest text-rose-500 uppercase mb-2">Error</div>
          <p className="text-sm text-rose-300 font-mono leading-relaxed">{errorMessage}</p>
          <p className="text-[10px] text-zinc-600 mt-3 font-mono">
            Check your API key in <code className="text-zinc-500">.env.local</code> at project root.
          </p>
        </div>
      </div>
    );
  }

  // No result yet (or currently solving) → hero input
  if (!visualConfig && steps.length === 0) return <EmptyHero />;

  // Has result but no canvas needed → full-width text layout
  if (!visualConfig) return <TextOnlyResult />;

  // Has result with canvas → canvas + text layout
  return <CanvasResult />;
}

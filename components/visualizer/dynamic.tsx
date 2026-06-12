"use client";
import { useMathStore } from '@/store/useMathStore';
import MathRenderer from './mathrenderer';
import StepByStep from './steps';
import BasicsVisualizer from './basics';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import AnalysisVisualizer from './analysis';
import DiscreteVisualizer from './discrete';

function EmptyHero() {
  const appMode      = useMathStore(s => s.appMode);
  const currentQuery = useMathStore(s => s.currentQuery);
  const isSolving    = useMathStore(s => s.isSolving);
  const executeSolver = useMathStore(s => s.executeSolver);

  const isTheorem = appMode === 'theorem';

  const examples = isTheorem
    ? ['Bolzano-Weierstrass theorem', 'uniform convergence', 'Heine-Borel theorem', 'Cauchy sequence', 'intermediate value theorem']
    : ['prove √2 is irrational', 'compute ∫₀¹ x² dx', 'eigenvalues of [[1,2],[3,4]]', "Taylor series of sin(x)", 'show ℝ is uncountable'];

  const placeholder = isTheorem
    ? 'Enter a theorem, concept, or definition...'
    : 'Enter a problem or exercise to solve...';

  const heroSymbol  = isTheorem ? '∀ε > 0, ∃δ > 0 ...' : '∫ f(x) dx = F(b) − F(a)';
  const heroTitle   = isTheorem ? 'What theorem shall we explore?' : 'What problem shall we solve?';
  const heroSub     = isTheorem ? 'Formal definition · Proof steps · Visual structure' : 'Step-by-step · Calculations · Interactive visual';

  if (isSolving) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-5">
        <div className={`w-10 h-10 rounded-full border-2 border-t-transparent animate-spin ${isTheorem ? 'border-blue-500' : 'border-violet-500'}`} />
        <div className="text-center space-y-1">
          <p className="text-sm font-mono text-zinc-400">Reasoning with Claude…</p>
          <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider">Constructing visualization blueprint</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 gap-8 relative">
      {/* Ambient glow */}
      <div className={`absolute w-[500px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-[0.04] ${isTheorem ? 'bg-blue-500' : 'bg-violet-500'}`} />

      {/* Hero text */}
      <div className="text-center space-y-2 relative">
        <div className={`text-2xl font-serif mb-3 opacity-30 tracking-wide ${isTheorem ? 'text-blue-400' : 'text-violet-400'}`}>
          {heroSymbol}
        </div>
        <h2 className="text-2xl font-bold text-zinc-200 tracking-tight">{heroTitle}</h2>
        <p className="text-xs text-zinc-600 font-mono tracking-wide">{heroSub}</p>
      </div>

      {/* Input */}
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
          >
            →
          </button>
        </div>

        {/* Example chips */}
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

function renderVisualCanvas(type: string, data: any) {
  switch (type) {
    case 'basics-plot':     return <BasicsVisualizer data={data} />;
    case 'topology-3d':     return <TopologyVisualizer data={data} />;
    case 'algebra-sequence': return <AlgebraVisualizer data={data} />;
    case 'analysis-space':  return <AnalysisVisualizer data={data} />;
    case 'discrete-graph':  return <DiscreteVisualizer data={data} />;
    default: return <div className="p-4 text-[10px] font-mono text-zinc-600">Unknown type: {type}</div>;
  }
}

export default function DynamicVisualizer() {
  const { visualConfig, steps, errorMessage } = useMathStore();

  if (errorMessage && !visualConfig) {
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

  if (!visualConfig) return <EmptyHero />;

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Domain label */}
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[9px] font-mono tracking-[0.25em] text-blue-500/80 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-md uppercase">
          {visualConfig.subdomainLabel}
        </span>
      </div>

      {/* Interactive visualization */}
      <div className="shrink-0 h-[280px] bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden">
        {renderVisualCanvas(visualConfig.type, visualConfig.data)}
      </div>

      {/* Formal Definition */}
      {visualConfig.data?.definition && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">Formal Definition</div>
          <MathRenderer content={visualConfig.data.definition} />
        </div>
      )}

      {/* Step-by-step */}
      {steps.length > 0 && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <StepByStep steps={steps} />
        </div>
      )}

      {/* Example */}
      {visualConfig.data?.example && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">Example / Counterexample</div>
          <MathRenderer content={visualConfig.data.example} />
        </div>
      )}
    </div>
  );
}

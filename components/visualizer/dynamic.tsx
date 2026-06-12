"use client";
import { useMathStore } from '@/store/useMathStore';
import MathRenderer from './mathrenderer';
import StepByStep from './steps';
import BasicsVisualizer from './basics';
import TopologyVisualizer from './topology';
import AlgebraVisualizer from './algebra';
import AnalysisVisualizer from './analysis';
import DiscreteVisualizer from './discrete';

export default function DynamicVisualizer() {
  const { visualConfig, steps, errorMessage } = useMathStore();

  if (errorMessage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-full max-w-md bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6">
          <div className="text-[10px] font-mono tracking-widest text-rose-500 uppercase mb-2">
            Error
          </div>
          <p className="text-sm text-rose-300 font-mono leading-relaxed">{errorMessage}</p>
          <p className="text-[10px] text-zinc-600 mt-3 font-mono">
            Check your API key in <code className="text-zinc-500">.env.local</code> at project root.
          </p>
        </div>
      </div>
    );
  }

  if (!visualConfig || !visualConfig.type) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center mb-3 opacity-60">
          <span className="text-zinc-600 font-mono text-xs">∅</span>
        </div>
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          Telemetry Pending
        </p>
        <p className="text-[11px] text-zinc-600 font-serif max-w-[220px] mt-1 leading-relaxed">
          Enter a theorem, concept, or problem above and press Execute.
        </p>
      </div>
    );
  }

  const renderVisualCanvas = () => {
    switch (visualConfig.type) {
      case 'basics-plot':
        return <BasicsVisualizer data={visualConfig.data as any} />;
      case 'topology-3d':
        return <TopologyVisualizer data={visualConfig.data as any} />;
      case 'algebra-sequence':
        return <AlgebraVisualizer data={visualConfig.data as any} />;
      case 'analysis-space':
        return <AnalysisVisualizer data={visualConfig.data as any} />;
      case 'discrete-graph':
        return <DiscreteVisualizer data={visualConfig.data as any} />;
      default:
        return (
          <div className="p-4 text-[10px] font-mono text-zinc-600">
            Unknown type: {visualConfig.type}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Interactive visualization canvas */}
      <div className="flex-shrink-0 h-[280px] bg-zinc-950/20 border border-zinc-900 rounded-2xl relative overflow-hidden">
        {renderVisualCanvas()}
      </div>

      {/* Formal Definition */}
      {visualConfig.data?.definition && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">
            Formal Definition
          </div>
          <MathRenderer content={visualConfig.data.definition} />
        </div>
      )}

      {/* Step-by-step proof / solution */}
      {steps.length > 0 && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <StepByStep steps={steps} />
        </div>
      )}

      {/* Example */}
      {visualConfig.data?.example && (
        <div className="bg-zinc-950/40 border border-zinc-900/50 p-4 rounded-xl shrink-0">
          <div className="text-[10px] font-mono tracking-widest text-zinc-600 mb-2 uppercase">
            Example / Counterexample
          </div>
          <MathRenderer content={visualConfig.data.example} />
        </div>
      )}
    </div>
  );
}

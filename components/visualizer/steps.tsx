"use client";
import { useState } from 'react';
import MathRenderer from './mathrenderer';
import { SolveStep } from '@/store/useMathStore';

const STEP_META: Record<SolveStep['type'], {
  label: string; shortLabel: string;
  accent: string; bg: string; border: string; numColor: string;
}> = {
  setup:       { label: 'Setup',       shortLabel: 'SETUP', accent: 'text-zinc-400',   bg: 'bg-zinc-900/40',      border: 'border-zinc-800',      numColor: 'text-zinc-500' },
  definition:  { label: 'Definition',  shortLabel: 'DEF',   accent: 'text-sky-400',    bg: 'bg-sky-950/20',       border: 'border-sky-900/40',    numColor: 'text-sky-600' },
  'key-step':  { label: 'Key Step',    shortLabel: 'KEY',   accent: 'text-amber-400',  bg: 'bg-amber-950/20',     border: 'border-amber-900/40',  numColor: 'text-amber-600' },
  calculation: { label: 'Calculation', shortLabel: 'CALC',  accent: 'text-emerald-400',bg: 'bg-emerald-950/20',   border: 'border-emerald-900/40',numColor: 'text-emerald-600' },
  conclusion:  { label: 'Conclusion',  shortLabel: '∎',     accent: 'text-purple-400', bg: 'bg-purple-950/20',    border: 'border-purple-900/40', numColor: 'text-purple-500' },
  insight:     { label: 'Insight',     shortLabel: '✦',     accent: 'text-rose-400',   bg: 'bg-rose-950/15',      border: 'border-rose-900/30',   numColor: 'text-rose-500' },
};

// Theorem mode: all steps fully expanded, continuous-reading proof style
function TheoremSteps({ steps }: { steps: SolveStep[] }) {
  return (
    <div className="space-y-5">
      {steps.map((step) => {
        const m = STEP_META[step.type] ?? STEP_META['key-step'];
        return (
          <div key={step.id} className={`rounded-xl border ${m.border} overflow-hidden`}>
            {/* Step header */}
            <div className={`flex items-center gap-3 px-4 py-2.5 ${m.bg}`}>
              <span className={`text-[10px] font-mono tracking-[0.18em] uppercase font-bold shrink-0 ${m.accent}`}>
                {m.shortLabel}
              </span>
              <div className="w-px h-3 bg-zinc-700/60 shrink-0" />
              <span className={`text-[10px] font-mono shrink-0 ${m.numColor}`}>{step.stepNumber}.</span>
              <span className="text-[12px] font-medium text-zinc-200 leading-snug">{step.title}</span>
            </div>
            {/* Step body — always visible */}
            <div className="px-5 py-4 bg-zinc-950/50 border-t border-zinc-900/40">
              <MathRenderer content={step.body} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Problem mode: collapsible accordion, focused on solution flow
function ProblemSteps({ steps }: { steps: SolveStep[] }) {
  const [openId, setOpenId] = useState<string>(steps[0]?.id || '');

  return (
    <div className="space-y-1.5">
      {steps.map((step) => {
        const m = STEP_META[step.type] ?? STEP_META['key-step'];
        const isOpen = openId === step.id;
        return (
          <div key={step.id}
            className={`rounded-xl border overflow-hidden transition-all ${isOpen ? m.border : 'border-zinc-900'}`}
          >
            <button
              onClick={() => setOpenId(isOpen ? '' : step.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-900/40 transition-colors"
            >
              <span className={`text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${m.accent} ${m.bg} ${m.border}`}>
                {m.shortLabel}
              </span>
              <span className={`text-[10px] font-mono shrink-0 w-4 ${m.numColor}`}>{step.stepNumber}.</span>
              <span className="text-[11px] font-mono text-zinc-300 flex-1 truncate">{step.title}</span>
              <span className={`text-zinc-700 text-[10px] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-zinc-950/60 border-t border-zinc-900/60">
                <MathRenderer content={step.body} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StepByStepProps {
  steps: SolveStep[];
  mode?: 'theorem' | 'problem' | 'latex' | null;
  label?: string; // "Proof" or "Solution"
}

export default function StepByStep({ steps, mode, label }: StepByStepProps) {
  if (!steps || steps.length === 0) return null;

  const isTheoremMode = mode === 'theorem';
  const sectionLabel = label ?? (isTheoremMode ? 'Proof' : 'Solution');

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
          {sectionLabel}
        </span>
        <div className="flex-1 h-px bg-zinc-800/60" />
        <span className="text-[9px] font-mono text-zinc-700">{steps.length} steps</span>
      </div>
      {isTheoremMode
        ? <TheoremSteps steps={steps} />
        : <ProblemSteps steps={steps} />
      }
    </div>
  );
}

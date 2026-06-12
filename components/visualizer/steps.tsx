"use client";
import React, { useState } from 'react';
import MathRenderer from './mathrenderer';
import { SolveStep } from '@/store/useMathStore';

const STEP_STYLES: Record<SolveStep['type'], { badge: string; border: string; dot: string }> = {
  setup:       { badge: 'text-zinc-400 border-zinc-700 bg-zinc-900',       border: 'border-zinc-800',  dot: 'bg-zinc-600' },
  definition:  { badge: 'text-blue-400 border-blue-900 bg-blue-950/40',    border: 'border-zinc-800',  dot: 'bg-blue-500' },
  'key-step':  { badge: 'text-amber-400 border-amber-900 bg-amber-950/30', border: 'border-amber-900/40', dot: 'bg-amber-500' },
  calculation: { badge: 'text-emerald-400 border-emerald-900 bg-emerald-950/30', border: 'border-zinc-800', dot: 'bg-emerald-500' },
  conclusion:  { badge: 'text-purple-400 border-purple-900 bg-purple-950/30', border: 'border-purple-900/40', dot: 'bg-purple-500' },
  insight:     { badge: 'text-rose-400 border-rose-900 bg-rose-950/30',    border: 'border-rose-900/40', dot: 'bg-rose-400' },
};

const STEP_LABELS: Record<SolveStep['type'], string> = {
  setup: 'SETUP',
  definition: 'DEF',
  'key-step': 'KEY',
  calculation: 'CALC',
  conclusion: 'QED',
  insight: 'WHY',
};

export default function StepByStep({ steps }: { steps: SolveStep[] }) {
  const [openId, setOpenId] = useState<string>(steps[0]?.id || '');

  if (!steps || steps.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
          Proof / Solution
        </div>
        <div className="flex-1 h-px bg-zinc-900" />
        <div className="text-[9px] font-mono text-zinc-700">{steps.length} steps</div>
      </div>

      <div className="space-y-1.5">
        {steps.map((step) => {
          const s = STEP_STYLES[step.type] || STEP_STYLES['key-step'];
          const isOpen = openId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-xl border overflow-hidden transition-colors ${isOpen ? s.border : 'border-zinc-900'}`}
            >
              <button
                onClick={() => setOpenId(isOpen ? '' : step.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-900/40 transition-colors"
              >
                <span className={`text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${s.badge}`}>
                  {STEP_LABELS[step.type]}
                </span>
                <span className="text-[10px] font-mono text-zinc-600 shrink-0 w-4">{step.stepNumber}.</span>
                <span className="text-[11px] font-mono text-zinc-300 flex-1 truncate">{step.title}</span>
                <span className={`text-zinc-700 text-[10px] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0.5 bg-zinc-950/60 border-t border-zinc-900/60">
                  <MathRenderer content={step.body} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

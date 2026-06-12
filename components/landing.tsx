"use client";
import { useMathStore, AppMode } from '@/store/useMathStore';

const T = {
  en: {
    tag: 'Axiom Studio Lab v1.5.0',
    title: ['Math', 'Workspace'],
    subtitle: 'Visualize theorems · Construct proofs · Solve problems interactively',
    footer: 'Powered by Claude · Interactive · Mathematical',
    modes: [
      {
        mode: 'theorem' as AppMode,
        icon: '∀',
        title: 'Theorem Prover',
        subtitle: 'Definitions & Proofs',
        desc: 'Explore theorems, formal definitions, and proof structures. Visualize abstract mathematical concepts interactively.',
        examples: ['Bolzano-Weierstrass', 'Heine-Borel theorem', 'uniform convergence', 'compactness'],
        color: 'blue' as const,
      },
      {
        mode: 'problem' as AppMode,
        icon: '∫',
        title: 'Problem Solver',
        subtitle: 'Step-by-Step Solutions',
        desc: 'Solve exercises with full worked solutions, explicit calculations, and visual explanations.',
        examples: ['∫ x² sin x dx', 'eigenvalue decomp.', 'prove √2 ∉ ℚ', 'Taylor expansion'],
        color: 'violet' as const,
      },
      {
        mode: 'latex' as AppMode,
        icon: 'Σ',
        title: 'LaTeX Studio',
        subtitle: 'Formula Editor & AI',
        desc: 'Write and render LaTeX formulas in real time. Use AI to generate complex expressions, proofs, and notation.',
        examples: ['\\int_0^1 x^n\\,dx', 'Stokes theorem', '\\lim_{n\\to\\infty}', 'matrix notation'],
        color: 'emerald' as const,
      },
    ],
  },
  zh: {
    tag: 'Axiom Studio Lab v1.5.0',
    title: ['Math', 'Workspace'],
    subtitle: '可视化定理 · 构建证明 · 交互式解题',
    footer: '由 Claude 驱动 · 可交互 · 数学专用',
    modes: [
      {
        mode: 'theorem' as AppMode,
        icon: '∀',
        title: '定理证明器',
        subtitle: '定义与证明',
        desc: '探索定理、形式定义和证明结构，将抽象数学概念以可视化方式呈现。',
        examples: ['Bolzano-Weierstrass定理', 'Heine-Borel定理', '一致收敛', '紧致性'],
        color: 'blue' as const,
      },
      {
        mode: 'problem' as AppMode,
        icon: '∫',
        title: '解题器',
        subtitle: '分步解答',
        desc: '完整解题过程，包含详细计算步骤和直观的可视化辅助说明。',
        examples: ['∫ x² sin x dx', '求特征值分解', '证明√2∉ℚ', 'Taylor展开'],
        color: 'violet' as const,
      },
      {
        mode: 'latex' as AppMode,
        icon: 'Σ',
        title: 'LaTeX 工作室',
        subtitle: '公式编辑器 & AI助手',
        desc: '实时编写和渲染LaTeX数学公式，用AI助手生成复杂表达式、定理和符号记号。',
        examples: ['\\int_0^1 x^n\\,dx', 'Stokes定理', '\\lim_{n\\to\\infty}', '矩阵记号'],
        color: 'emerald' as const,
      },
    ],
  },
};

const COLORS = {
  blue:    { border: 'hover:border-blue-500/40',    bg: 'hover:bg-blue-950/20',    glow: 'hover:shadow-[0_0_50px_rgba(59,130,246,0.07)]',    icon: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',    label: 'text-blue-700', chip: 'border-blue-900/40 text-blue-800 bg-blue-950/20 hover:text-blue-400',    arrow: 'text-blue-500',    title: 'text-blue-100' },
  violet:  { border: 'hover:border-violet-500/40',  bg: 'hover:bg-violet-950/20',  glow: 'hover:shadow-[0_0_50px_rgba(139,92,246,0.07)]',  icon: 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20',  label: 'text-violet-700', chip: 'border-violet-900/40 text-violet-800 bg-violet-950/20 hover:text-violet-400', arrow: 'text-violet-500', title: 'text-violet-100' },
  emerald: { border: 'hover:border-emerald-500/40', bg: 'hover:bg-emerald-950/20', glow: 'hover:shadow-[0_0_50px_rgba(16,185,129,0.07)]', icon: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20', label: 'text-emerald-700', chip: 'border-emerald-900/40 text-emerald-800 bg-emerald-950/20 hover:text-emerald-400', arrow: 'text-emerald-500', title: 'text-emerald-100' },
};

function ModeCard({ icon, title, subtitle, description, examples, color, onClick }: {
  icon: string; title: string; subtitle: string; description: string;
  examples: string[]; color: 'blue' | 'violet' | 'emerald'; onClick: () => void;
}) {
  const c = COLORS[color];
  return (
    <button
      onClick={onClick}
      className={`group relative w-64 p-6 rounded-2xl border border-zinc-800 text-left transition-all duration-300 bg-zinc-950/80 backdrop-blur-xl ${c.border} ${c.bg} ${c.glow}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-serif mb-4 transition-colors duration-300 ${c.icon}`}>
        {icon}
      </div>
      <div className="mb-3">
        <h2 className={`text-[15px] font-bold tracking-tight group-hover:text-white transition-colors ${c.title}`}>{title}</h2>
        <p className={`text-[10px] font-mono tracking-widest uppercase mt-0.5 ${c.label}`}>{subtitle}</p>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {examples.map(ex => (
          <span key={ex} className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-default ${c.chip}`}>
            {ex}
          </span>
        ))}
      </div>
      <div className={`absolute bottom-5 right-5 text-[10px] font-mono opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 ${c.arrow}`}>
        ENTER →
      </div>
    </button>
  );
}

export default function Landing() {
  const setAppMode = useMathStore(s => s.setAppMode);
  const language   = useMathStore(s => s.language);
  const setLanguage = useMathStore(s => s.setLanguage);

  const t = T[language];

  return (
    <div className="w-screen h-screen bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '36px 36px' }} />

      {/* Ambient glow */}
      <div className="absolute w-[800px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Scattered math symbols */}
      {['∑', '∂', '∇', '∞', 'ℝ', 'π', 'λ', 'φ'].map((sym, i) => (
        <span key={sym} className="absolute text-zinc-800 font-serif pointer-events-none"
          style={{ fontSize: `${1.1 + (i % 3) * 0.5}rem`, top: `${10 + (i * 11) % 78}%`, left: `${4 + (i * 13) % 92}%`, opacity: 0.35 }}>
          {sym}
        </span>
      ))}

      {/* Language toggle — top right */}
      <div className="absolute top-6 right-8 flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-widest uppercase transition-all ${language === 'en' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}
        >EN</button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-widest transition-all ${language === 'zh' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'}`}
        >中文</button>
      </div>

      {/* Header */}
      <div className="relative text-center mb-12 space-y-3">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">{t.tag}</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-zinc-100 uppercase italic">
          {t.title[0]} <span className="text-blue-500 not-italic font-sans">{t.title[1]}</span>
        </h1>
        <p className="text-sm text-zinc-600 font-mono max-w-sm mx-auto leading-relaxed">{t.subtitle}</p>
      </div>

      {/* Mode cards */}
      <div className="relative flex gap-4 flex-wrap justify-center px-4">
        {t.modes.map(m => (
          <ModeCard
            key={String(m.mode)}
            icon={m.icon}
            title={m.title}
            subtitle={m.subtitle}
            description={m.desc}
            examples={m.examples}
            color={m.color}
            onClick={() => setAppMode(m.mode)}
          />
        ))}
      </div>

      <div className="absolute bottom-8 text-[9px] font-mono text-zinc-800 tracking-[0.2em] uppercase">{t.footer}</div>
    </div>
  );
}

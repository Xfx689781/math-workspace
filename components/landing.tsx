"use client";
import { useMathStore } from '@/store/useMathStore';

function ModeCard({
  icon, title, subtitle, description, examples, color, onClick,
}: {
  icon: string; title: string; subtitle: string; description: string;
  examples: string[]; color: 'blue' | 'violet'; onClick: () => void;
}) {
  const isBlue = color === 'blue';
  const accent = isBlue
    ? { border: 'border-zinc-800 hover:border-blue-500/40', bg: 'hover:bg-blue-950/20', glow: 'hover:shadow-[0_0_50px_rgba(59,130,246,0.07)]', icon: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20', label: 'text-blue-700', chip: 'border-blue-900/40 text-blue-800 bg-blue-950/20 hover:text-blue-400 hover:border-blue-700/50', arrow: 'text-blue-500', title: 'text-blue-100' }
    : { border: 'border-zinc-800 hover:border-violet-500/40', bg: 'hover:bg-violet-950/20', glow: 'hover:shadow-[0_0_50px_rgba(139,92,246,0.07)]', icon: 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20', label: 'text-violet-700', chip: 'border-violet-900/40 text-violet-800 bg-violet-950/20 hover:text-violet-400 hover:border-violet-700/50', arrow: 'text-violet-500', title: 'text-violet-100' };

  return (
    <button
      onClick={onClick}
      className={`group relative w-72 p-7 rounded-2xl border text-left transition-all duration-300 bg-zinc-950/80 backdrop-blur-xl ${accent.border} ${accent.bg} ${accent.glow}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-serif mb-5 transition-colors duration-300 ${accent.icon}`}>
        {icon}
      </div>

      <div className="mb-3">
        <h2 className={`text-base font-bold tracking-tight group-hover:text-white transition-colors ${accent.title}`}>
          {title}
        </h2>
        <p className={`text-[10px] font-mono tracking-widest uppercase mt-0.5 ${accent.label}`}>
          {subtitle}
        </p>
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed mb-5">{description}</p>

      <div className="flex flex-wrap gap-1.5">
        {examples.map(ex => (
          <span key={ex} className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-default ${accent.chip}`}>
            {ex}
          </span>
        ))}
      </div>

      <div className={`absolute bottom-6 right-6 text-[10px] font-mono opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 ${accent.arrow}`}>
        ENTER →
      </div>
    </button>
  );
}

export default function Landing() {
  const setAppMode = useMathStore(s => s.setAppMode);

  return (
    <div className="w-screen h-screen bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '36px 36px' }}
      />

      {/* Blue ambient glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-blue-600/5 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Decorative math symbols */}
      {['∑', '∂', '∇', '∞', 'ℝ', 'ℂ', 'π', 'λ'].map((sym, i) => (
        <span
          key={sym}
          className="absolute text-zinc-800 font-serif pointer-events-none"
          style={{
            fontSize: `${1.2 + (i % 3) * 0.6}rem`,
            top: `${10 + (i * 11) % 75}%`,
            left: `${5 + (i * 13) % 90}%`,
            opacity: 0.4,
          }}
        >
          {sym}
        </span>
      ))}

      {/* Header */}
      <div className="relative text-center mb-14 space-y-3">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">
            Axiom Studio Lab v1.5.0
          </span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-zinc-100 uppercase italic">
          Math <span className="text-blue-500 not-italic font-sans">Workspace</span>
        </h1>
        <p className="text-sm text-zinc-600 font-mono max-w-sm mx-auto leading-relaxed">
          Visualize theorems · Construct proofs · Solve problems interactively
        </p>
      </div>

      {/* Mode cards */}
      <div className="relative flex gap-5">
        <ModeCard
          icon="∀"
          title="Theorem Prover"
          subtitle="Definitions & Proofs"
          description="Explore theorems, formal definitions, and proof structures. Visualize abstract mathematical concepts."
          examples={['Bolzano-Weierstrass', 'uniform convergence', 'Heine-Borel', 'compactness']}
          color="blue"
          onClick={() => setAppMode('theorem')}
        />
        <ModeCard
          icon="∫"
          title="Problem Solver"
          subtitle="Step-by-Step Solutions"
          description="Solve exercises with full worked solutions, explicit calculations, and visual explanations."
          examples={['∫ x² sin x dx', 'eigenvalue decomp.', 'prove √2 ∉ ℚ', 'Taylor expansion']}
          color="violet"
          onClick={() => setAppMode('problem')}
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-[9px] font-mono text-zinc-800 tracking-[0.2em] uppercase">
        Powered by Claude · Interactive · Mathematical
      </div>
    </div>
  );
}

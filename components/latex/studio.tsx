"use client";
import { useState } from 'react';
import MathRenderer from '@/components/visualizer/mathrenderer';
import { useMathStore } from '@/store/useMathStore';

const TEMPLATES_EN = [
  { label: 'Fund. Theorem of Calc.', code: '**Fundamental Theorem of Calculus**\n\nIf $f$ is continuous on $[a,b]$ and $F\'= f$, then:\n\n$$ \\int_a^b f(x)\\,dx = F(b) - F(a) $$' },
  { label: "Stokes' Theorem", code: "$$ \\oint_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega $$" },
  { label: 'Cauchy Criterion', code: '**Cauchy Criterion for Convergence**\n\nA sequence $\\{x_n\\}$ converges $\\iff$ it is Cauchy:\n\n$$ \\forall \\varepsilon > 0,\\ \\exists N \\in \\mathbb{N} : m,n > N \\implies |x_m - x_n| < \\varepsilon $$' },
  { label: 'Taylor Series', code: '**Taylor Series** of $f$ around $a$:\n\n$$ f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n $$' },
  { label: 'Spectral Theorem', code: 'For a real symmetric matrix $A \\in \\mathbb{R}^{n \\times n}$:\n\n$$ A = Q \\Lambda Q^\\top $$\n\nwhere $Q$ is orthogonal and $\\Lambda = \\mathrm{diag}(\\lambda_1, \\ldots, \\lambda_n)$.' },
  { label: "Green's Theorem", code: "$$ \\oint_C (P\\,dx + Q\\,dy) = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\!dA $$" },
  { label: 'Euler Identity', code: "$$ e^{i\\pi} + 1 = 0 $$" },
  { label: 'Heine-Borel', code: '**Heine-Borel Theorem**\n\nA subset $K \\subseteq \\mathbb{R}^n$ is compact $\\iff$ $K$ is closed and bounded.' },
];

const TEMPLATES_ZH = [
  { label: '微积分基本定理', code: '**微积分基本定理**\n\n若 $f$ 在 $[a,b]$ 上连续，$F\'= f$，则：\n\n$$ \\int_a^b f(x)\\,dx = F(b) - F(a) $$' },
  { label: 'Stokes 定理', code: "$$ \\oint_{\\partial \\Omega} \\omega = \\int_{\\Omega} d\\omega $$" },
  { label: 'Cauchy 收敛准则', code: '**Cauchy 收敛准则**\n\n数列 $\\{x_n\\}$ 收敛 $\\iff$ 它是 Cauchy 列：\n\n$$ \\forall \\varepsilon > 0,\\ \\exists N : m,n > N \\implies |x_m - x_n| < \\varepsilon $$' },
  { label: 'Taylor 展开', code: '**Taylor 级数**（$f$ 在 $a$ 处展开）：\n\n$$ f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n $$' },
  { label: '谱定理', code: '实对称矩阵 $A \\in \\mathbb{R}^{n \\times n}$ 的谱分解：\n\n$$ A = Q \\Lambda Q^\\top $$' },
  { label: 'Heine-Borel 定理', code: '**Heine-Borel 定理**\n\n$K \\subseteq \\mathbb{R}^n$ 是紧集 $\\iff$ $K$ 是闭集且有界。' },
  { label: 'Green 公式', code: "$$ \\oint_C (P\\,dx + Q\\,dy) = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\!dA $$" },
  { label: 'Euler 恒等式', code: "$$ e^{i\\pi} + 1 = 0 $$" },
];

export default function LaTeXStudio() {
  const language = useMathStore(s => s.language);
  const [code, setCode] = useState('');
  const [aiDesc, setAiDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [copyLabel, setCopyLabel] = useState('');

  const isZh = language === 'zh';
  const TEMPLATES = isZh ? TEMPLATES_ZH : TEMPLATES_EN;

  const handleGenerate = async () => {
    if (!aiDesc.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiDesc, language }),
      });
      const data = await res.json();
      if (data.latex) setCode(c => c ? c + '\n\n' + data.latex : data.latex);
      setAiDesc('');
    } catch { /* silent */ }
    finally { setIsGenerating(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopyLabel(isZh ? '已复制!' : 'Copied!');
    setTimeout(() => setCopyLabel(''), 1500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#020203] font-mono overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 px-4 border-b border-zinc-900 flex items-center gap-2 shrink-0 bg-[#070708]">
        <span className="text-[9px] text-zinc-600 uppercase tracking-widest mr-2">
          {isZh ? 'LaTeX 工作室' : 'LaTeX Studio'}
        </span>

        {/* Templates dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="text-[9px] font-mono px-2.5 py-1 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
          >
            {isZh ? '模板 ▾' : 'Templates ▾'}
          </button>
          {showTemplates && (
            <div className="absolute top-9 left-0 z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-56 overflow-hidden">
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => { setCode(c => c ? c + '\n\n' + t.code : t.code); setShowTemplates(false); }}
                  className="w-full text-left px-3 py-2 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAI(v => !v)}
          className={`text-[9px] font-mono px-2.5 py-1 rounded border transition-all ${
            showAI
              ? 'border-blue-500/50 text-blue-400 bg-blue-950/20'
              : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          }`}
        >
          {isZh ? 'AI 生成' : 'AI Generate'}
        </button>

        <div className="flex-1" />

        <button
          onClick={handleCopy}
          disabled={!code}
          className="text-[9px] font-mono px-2.5 py-1 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all disabled:opacity-30"
        >
          {copyLabel || (isZh ? '复制' : 'Copy')}
        </button>
        <button
          onClick={() => setCode('')}
          disabled={!code}
          className="text-[9px] font-mono px-2.5 py-1 rounded border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-900 transition-all disabled:opacity-30"
        >
          {isZh ? '清空' : 'Clear'}
        </button>
      </div>

      {/* AI generation panel */}
      {showAI && (
        <div className="px-4 py-2.5 border-b border-zinc-900 bg-zinc-950/70 flex items-center gap-3 shrink-0">
          <span className="text-[9px] text-blue-600 font-mono uppercase tracking-widest shrink-0">AI →</span>
          <input
            type="text"
            value={aiDesc}
            onChange={e => setAiDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
            placeholder={isZh ? '描述你需要的公式或定理，按 Enter 生成…' : 'Describe the formula or theorem you need, press Enter…'}
            className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-blue-500/40 transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !aiDesc.trim()}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase bg-blue-600/10 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating
              ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 border border-t-transparent border-blue-400 rounded-full animate-spin inline-block" />{isZh ? '生成中' : 'Generating'}</span>
              : (isZh ? '生成 →' : 'Generate →')}
          </button>
        </div>
      )}

      {/* Split pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: editor */}
        <div className="w-1/2 flex flex-col border-r border-zinc-900 overflow-hidden">
          <div className="px-4 py-1.5 border-b border-zinc-900/60 text-[9px] text-zinc-700 uppercase tracking-widest shrink-0 bg-zinc-950/40">
            {isZh ? 'LaTeX 源码' : 'LaTeX Source'}
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={isZh
              ? '在此输入 LaTeX 数学内容…\n\n使用 $…$ 行内公式\n使用 $$…$$ 独立公式块\n\n例：\n$$  \\int_a^b f(x)\\,dx = F(b) - F(a)  $$'
              : 'Type LaTeX math here…\n\nInline: $\\varepsilon > 0$\nDisplay block:\n$$  \\int_a^b f(x)\\,dx = F(b) - F(a)  $$'
            }
            spellCheck={false}
            className="flex-1 bg-transparent px-4 py-3 text-xs font-mono text-zinc-300 placeholder-zinc-800 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Right: preview */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-4 py-1.5 border-b border-zinc-900/60 text-[9px] text-zinc-700 uppercase tracking-widest shrink-0 bg-zinc-950/40">
            {isZh ? '渲染预览' : 'Rendered Preview'}
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {code.trim()
              ? <MathRenderer content={code} />
              : (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-30 select-none">
                  <div className="text-4xl font-serif text-zinc-600">∫</div>
                  <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider text-center">
                    {isZh ? '左侧输入公式，这里实时渲染' : 'Preview appears here as you type'}
                  </p>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Bottom hint bar */}
      <div className="px-4 py-1.5 border-t border-zinc-900 bg-[#070708] shrink-0 flex items-center gap-4">
        <span className="text-[9px] font-mono text-zinc-800">$…$ inline · $$…$$ display · **bold** · *italic*</span>
        <div className="flex-1" />
        <span className="text-[9px] font-mono text-zinc-800">{isZh ? '由 KaTeX 渲染' : 'Rendered by KaTeX'}</span>
      </div>
    </div>
  );
}

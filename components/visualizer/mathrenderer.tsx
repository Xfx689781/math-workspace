"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathRendererProps {
  content: string;
}

export default function MathRenderer({ content }: MathRendererProps) {
  if (!content) return null;

  // 🛡️ 强力清洗函数：将可能被损坏、转义的 LaTeX 文本纠正为标准格式
  const formatLaTeX = (text: string) => {
    let clean = text;

    // 1. 将 AI 有可能返回的物理双反斜杠 \\ 统一降维成单反斜杠 \
    clean = clean.replace(/\\\\/g, '\\');

    // 2. 如果字符串里本来就包含类似 \forall 的特征，但没有被 $$ 包裹，
    // 我们需要通过一个启发式判断，帮它套上标准的 LaTeX 块级边界，让 remark-math 能够精准捕获
    if (
      (clean.includes('\\forall') || clean.includes('\\exists') || clean.includes('\\varepsilon') || clean.includes('\\{f_n\\}')) &&
      !clean.includes('$')
    ) {
      // 自动给裸奔的公式两端垫上标准数学块记号
      return `$$ ${clean} $$`;
    }

    return clean;
  };

  const processedContent = formatLaTeX(content);

  return (
    <div className="prose prose-invert max-w-none text-xs font-mono tracking-wide text-zinc-300 leading-relaxed antialiased">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 彻底阻断任何潜在的布局换行冲突
          p: ({ children }) => <p className="my-1 break-words leading-relaxed">{children}</p>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
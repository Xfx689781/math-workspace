"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathRendererProps {
  content: string;
}

export default function MathRenderer({ content }: MathRendererProps) {
  // 🛡️ 终极清洗：修复 AI 生成的 JSON 字符串中，可能把反斜杠 \ 变成转义双斜杠 \\ 的情况
  const sanitizedContent = content
    ? content.replace(/\\\\/g, '\\') 
    : '';

  return (
    <div className="prose prose-invert max-w-none text-xs font-mono tracking-wide text-zinc-400 leading-relaxed antialiased">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 优化公式块的上下间距与字体微调
          p: ({ children }) => <p className="my-1 break-words">{children}</p>,
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
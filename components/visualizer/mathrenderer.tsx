"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function MathRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="math-prose max-w-none text-[13px] text-zinc-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, {
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\Z': '\\mathbb{Z}',
            '\\N': '\\mathbb{N}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}',
          },
        }]]}
        components={{
          p: ({ children }) => (
            <p className="my-2 leading-[1.85] text-zinc-300">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-400">{children}</em>
          ),
          code: ({ children }) => (
            <code className="font-mono text-[11px] text-blue-300 bg-zinc-900/60 px-1.5 py-0.5 rounded">
              {children}
            </code>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-4 space-y-1 list-disc list-outside text-zinc-400">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 space-y-1 list-decimal list-outside text-zinc-400">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

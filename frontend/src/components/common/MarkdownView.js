'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownView({ content, className = '', isDark = false }) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className={`text-2xl sm:text-3xl font-black mt-6 mb-3 leading-tight pb-2 border-b ${
                isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
              }`}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={`text-xl sm:text-2xl font-bold mt-5 mb-2.5 leading-snug ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={`text-lg sm:text-xl font-bold mt-4 mb-2 leading-snug ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className={`text-base font-semibold mt-3 mb-1.5 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className={`leading-relaxed mb-4 text-sm sm:text-base whitespace-pre-line ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className={`list-disc list-outside pl-6 mb-4 space-y-1.5 text-sm sm:text-base ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className={`list-decimal list-outside pl-6 mb-4 space-y-1.5 text-sm sm:text-base ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`border-l-4 pl-4 py-2 my-4 italic rounded-r-lg ${
                isDark
                  ? 'border-red-500 bg-slate-800/70 text-slate-300'
                  : 'border-red-600 bg-red-50/50 text-slate-600'
              }`}
              {...props}
            />
          ),
          a: ({ node, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 underline font-medium"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong
              className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em className={`italic ${isDark ? 'text-slate-200' : 'text-slate-800'}`} {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-slate-800 text-amber-300 border-slate-700'
                    : 'bg-slate-100 text-red-600 border-slate-200'
                }`}
                {...props}
              />
            ) : (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs my-4 border border-slate-800">
                <code {...props} />
              </pre>
            ),
          hr: ({ node, ...props }) => (
            <hr className={`my-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


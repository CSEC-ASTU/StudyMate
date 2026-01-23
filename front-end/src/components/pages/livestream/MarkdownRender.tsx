"use client";

import { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  streaming?: boolean;
}

function sanitize(html: string) {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

/* ---------- MATH ---------- */
function renderMath(text: string) {
  // block math
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) =>
    katex.renderToString(expr.trim(), {
      displayMode: true,
      throwOnError: false,
    }),
  );

  // inline math
  text = text.replace(/\\\((.*?)\\\)/g, (_, expr) =>
    katex.renderToString(expr.trim(), {
      displayMode: false,
      throwOnError: false,
    }),
  );

  return text;
}

/* ---------- MARKDOWN ---------- */
function renderMarkdown(text: string) {
  return text
    .replace(
      /^### (.+)$/gm,
      `<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>`,
    )
    .replace(/^## (.+)$/gm, `<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em>$1</em>`)
    .replace(
      /`([^`]+)`/g,
      `<code class="px-1 py-0.5 bg-gray-800 rounded text-amber-300">$1</code>`,
    )
    .replace(/^---$/gm, '<hr class="my-8 border-t border-gray-600" />')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const html = useMemo(() => {
    let text = sanitize(content);

    // 1️⃣ Extract code blocks
    const codeBlocks: { code: string; lang: string }[] = [];
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      codeBlocks.push({ code, lang });
      return `__CODE_${codeBlocks.length - 1}__`;
    });

    // 2️⃣ Render math
    text = renderMath(text);

    // 3️⃣ Render markdown
    text = renderMarkdown(text);

    return { text, codeBlocks };
  }, [content]);

  return (
    <div className={`markdown prose prose-invert max-w-none ${className}`}>
      {html.text.split(/(__CODE_\d+__)/).map((part, i) => {
        const match = part.match(/__CODE_(\d+)__/);
        if (match) {
          const block = html.codeBlocks[Number(match[1])];
          return (
            <div key={i} className="relative my-4">
              <div className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-t-lg border-b border-gray-700">
                <span className="text-xs font-mono text-emerald-400">
                  {block.lang || "text"}
                </span>
                <CopyButton text={block.code} />
              </div>
              <pre className="bg-[#0d1117] p-4 rounded-b-lg overflow-x-auto m-0">
                <code className="text-sm font-mono">
                  {block.code.split("\n").map((line, idx) => {
                    // Simple syntax highlighting for TypeScript/JavaScript
                    const highlightedLine =
                      block.lang === "tsx" ||
                      block.lang === "jsx" ||
                      block.lang === "typescript" ||
                      block.lang === "javascript"
                        ? line
                            .replace(
                              /(import|export|from|function|const|let|var|return|if|else|for|while|switch|case|default|break|continue)\b/g,
                              '<span class="text-purple-400">$1</span>',
                            )
                            .replace(
                              /(interface|type|class|extends|implements)\b/g,
                              '<span class="text-blue-400">$1</span>',
                            )
                            .replace(
                              /(true|false|null|undefined)\b/g,
                              '<span class="text-amber-300">$1</span>',
                            )
                            .replace(
                              /(["'].*?["'])/g,
                              '<span class="text-emerald-400">$1</span>',
                            )
                            .replace(
                              /(\/\/.*)/g,
                              '<span class="text-gray-500">$1</span>',
                            )
                            .replace(
                              /(\d+)/g,
                              '<span class="text-cyan-400">$1</span>',
                            )
                        : line;

                    return (
                      <div key={idx} className="hover:bg-gray-900/30 px-1">
                        <span className="text-gray-500 select-none mr-4 text-right inline-block w-8">
                          {idx + 1}
                        </span>
                        <span
                          dangerouslySetInnerHTML={{ __html: highlightedLine }}
                          className="text-gray-200"
                        />
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          );
        }

        return <div key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
}

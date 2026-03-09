"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 增加表格支持
import { Send, Loader2, Download, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';
import mermaid from 'mermaid';

// 初始化脑图引擎
if (typeof window !== 'undefined') {
  mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
}

export default function Home() {
  const [input, setInput] = useState('');
  const [prd, setPrd] = useState('');
  const [loading, setLoading] = useState(false);

  // 监听 PRD 变化，自动渲染脑图
  useEffect(() => {
    if (prd && !loading) {
      mermaid.contentLoaded();
    }
  }, [prd, loading]);

  const generatePRD = async () => {
    if (!input) return;
    setLoading(true);
    setPrd('');
    try {
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }) 
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        setPrd((prev) => prev + decoder.decode(value));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const downloadWord = () => {
    const blob = new Blob([prd], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `PRD-${new Date().getTime()}.txt`);
  };

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-600" /> 需求脑雾清除器 2.0
          </h1>
          {prd && <button onClick={downloadWord} className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">导出文档</button>}
        </div>
        
        <div className="flex gap-2 mb-8">
          <input 
            className="flex-1 border p-4 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="输入产品想法..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePRD()}
          />
          <button 
            onClick={generatePRD}
            className="bg-blue-600 text-white px-8 rounded-xl disabled:bg-gray-300 transition-all"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "生成"}
          </button>
        </div>

        {prd && (
          <div className="prose prose-blue max-w-none border p-6 md:p-10 rounded-2xl bg-gray-50">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} // 开启表格渲染
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-mermaid/.exec(className || '');
                  // 如果是 mermaid 代码块，渲染为脑图
                  return !inline && match ? (
                    <div className="mermaid bg-white p-4 rounded-lg my-4 border">{String(children).replace(/\n$/, '')}</div>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
                // 让表格更漂亮
                table: ({node, ...props}) => <table className="border-collapse border border-gray-300 w-full" {...props} />,
                th: ({node, ...props}) => <th className="border border-gray-300 p-2 bg-gray-100" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 p-2" {...props} />,
              }}
            >
              {prd}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
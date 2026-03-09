"use client";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Download, Sparkles } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function Home() {
  const [input, setInput] = useState('');
  const [prd, setPrd] = useState('');
  const [loading, setLoading] = useState(false);

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
    // 简化版导出：直接导出为文本，确保不会报错
    const blob = new Blob([prd], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "prd-export.txt");
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-600" /> 需求脑雾清除器 2.0
          </h1>
          {prd && <button onClick={downloadWord} className="text-sm border p-2 rounded">导出文档</button>}
        </div>
        
        <div className="flex gap-2 mb-8">
          <input 
            className="flex-1 border p-4 rounded-xl shadow-sm"
            placeholder="输入产品想法..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={generatePRD}
            className="bg-blue-600 text-white px-6 rounded-xl disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "生成"}
          </button>
        </div>

        {prd && (
          <div className="prose max-w-none border p-8 rounded-2xl bg-gray-50">
            <ReactMarkdown>{prd}</ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
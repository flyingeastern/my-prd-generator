"use client";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Sparkles } from 'lucide-react';

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
        body: JSON.stringify({ prompt: input }),
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

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">PRD 快速生成器</h1>
        </div>
        
        <div className="flex gap-3 mb-10">
          <input 
            className="flex-1 p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            placeholder="输入产品想法，如：一个宠物医生的预约小程序"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={generatePRD}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            生成
          </button>
        </div>

        {prd && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-blue max-w-none text-gray-800 leading-relaxed">
            <ReactMarkdown>{prd}</ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
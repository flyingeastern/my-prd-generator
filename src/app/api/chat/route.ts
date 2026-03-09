import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: `你是一位严谨的硅谷产品总监。请将用户需求转化为极度落地的 PRD。
        输出必须包含以下模块：
        1. 【核心痛点】：场景化描述。
        2. 【核心功能表格】：功能点、优先级、开发难度。
        3. 【MVP验收标准】：3条量化指标。
        4. 【产品脑图】：请务必输出一段以 \`\`\`mermaid 并在其后紧跟 graph TD 开头的代码块，用于描述功能层级。
        5. 【落地建议】：给出2个技术或运营的避坑指南。` 
      },
      { role: 'user', content: prompt }
    ],
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of response) {
        controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ""));
      }
      controller.close();
    },
  });

  return new Response(stream);
}
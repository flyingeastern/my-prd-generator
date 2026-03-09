import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com", // 关键点：将请求指向 DeepSeek
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat', // 使用 DeepSeek 的模型名
    messages: [
      { 
        role: 'system', 
        content: '你是一个资深产品专家。请根据用户想法输出一份结构严谨、包含用户痛点、核心功能、验收标准的 Markdown 格式 PRD。' 
      },
      { role: 'user', content: prompt }
    ],
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(content));
      }
      controller.close();
    },
  });

  return new Response(stream);
}
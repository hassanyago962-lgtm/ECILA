import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // 1. Fire off requests to all models in parallel
    const [openaiRes, anthropicRes, geminiRes] = await Promise.allSettled([
      fetchOpenAI(prompt),
      fetchAnthropic(prompt),
      fetchGemini(prompt)
    ]);

    const answers = {
      openai: openaiRes.status === 'fulfilled' ? openaiRes.value : 'Failed to retrieve response.',
      anthropic: anthropicRes.status === 'fulfilled' ? anthropicRes.value : 'Failed to retrieve response.',
      gemini: geminiRes.status === 'fulfilled' ? geminiRes.value : 'Failed to retrieve response.',
    };

    // 2. Pass all answers to the orchestrator to synthesize the single best response
    const perfectAnswer = await synthesizeBestAnswer(prompt, answers);

    return NextResponse.json({ answers, perfectAnswer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper fetch mechanics for individual APIs using your Render Environment variables
async function fetchOpenAI(prompt: string) {
  const res = await fetch('https://openai.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchAnthropic(prompt: string) {
  const res = await fetch('https://anthropic.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  return data.content[0].text;
}

async function fetchGemini(prompt: string) {
  const res = await fetch(`https://googleapis.com{process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash'}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// The Agent synthesis function
async function synthesizeBestAnswer(originalPrompt: string, responses: any) {
  const synthesisPrompt = `You are an expert AI orchestrator. A user asked: "${originalPrompt}". 
  Here are answers from different models:\n
  OpenAI: ${responses.openai}\n
  Anthropic: ${responses.anthropic}\n
  Gemini: ${responses.gemini}\n
  Compare these responses, extract the best points from each, filter out inaccuracies, and write one definitive, perfect master answer.`;

  return await fetchOpenAI(synthesisPrompt); // Use OpenAI to judge and synthesize
}

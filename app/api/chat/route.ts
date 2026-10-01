import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Fire off requests to all models in parallel
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

    // Pass all answers to the orchestrator to synthesize the single best response
    const perfectAnswer = await synthesizeBestAnswer(prompt, answers);

    return NextResponse.json({ answers, perfectAnswer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchOpenAI(prompt: string) {
  if (!process.env.OPENAI_API_KEY) return 'OpenAI Key is missing in Render environment variables.';
  try {
    const res = await fetch('https://openai.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Invalid OpenAI response format.';
  } catch {
    return 'Failed to reach OpenAI servers.';
  }
}

async function fetchAnthropic(prompt: string) {
  if (!process.env.ANTHROPIC_API_KEY) return 'Anthropic Key is missing in Render environment variables.';
  try {
    const res = await fetch('https://anthropic.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'Invalid Anthropic response format.';
  } catch {
    return 'Failed to reach Anthropic servers.';
  }
}

async function fetchGemini(prompt: string) {
  if (!process.env.GOOGLE_AI_API_KEY) return 'Gemini Key is missing in Render environment variables.';
  try {
    const res = await fetch(`https://googleapis.com{process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Invalid Gemini response format.';
  } catch {
    return 'Failed to reach Gemini servers.';
  }
}

async function synthesizeBestAnswer(originalPrompt: string, responses: any) {
  const synthesisPrompt = `You are an expert AI orchestrator. A user asked: "${originalPrompt}". 
  Here are answers from different models:\n
  OpenAI: ${responses.openai}\n
  Anthropic: ${responses.anthropic}\n
  Gemini: ${responses.gemini}\n
  Compare these responses carefully. Extract the best points from each, filter out any clear inaccuracies, resolve inconsistencies, and write one definitive, perfectly comprehensive master answer.`;

  return await fetchOpenAI(synthesisPrompt);
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is missing in Render environment variables.' }, { status: 400 });
    }

    // Fire off requests to 3 different open-source models on Groq in parallel
    const [llamaRes, llama70bRes, miasRes] = await Promise.allSettled([
      fetchGroqModel(prompt, 'llama3-8b-8192'),
      fetchGroqModel(prompt, 'llama3-70b-8192'),
      fetchGroqModel(prompt, 'mixtral-8x7b-32768')
    ]);

    const answers = {
      openai: llamaRes.status === 'fulfilled' ? llamaRes.value : 'Failed to retrieve response.',
      anthropic: llama70bRes.status === 'fulfilled' ? llama70bRes.value : 'Failed to retrieve response.',
      gemini: miasRes.status === 'fulfilled' ? miasRes.value : 'Failed to retrieve response.',
    };

    // Use the largest model to evaluate and synthesize the single best response
    const perfectAnswer = await synthesizeBestAnswer(prompt, answers);

    return NextResponse.json({ answers, perfectAnswer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchGroqModel(prompt: string, modelName: string) {
  try {
    const res = await fetch('https://groq.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Invalid response format from Groq.';
  } catch (err) {
    return `Failed to reach model ${modelName}.`;
  }
}

async function synthesizeBestAnswer(originalPrompt: string, responses: any) {
  const synthesisPrompt = `You are an expert AI orchestrator. A user asked: "${originalPrompt}". 
  Here are answers from different models:\n
  Model 1 (Llama 8B): ${responses.openai}\n
  Model 2 (Llama 70B): ${responses.anthropic}\n
  Model 3 (Mixtral): ${responses.gemini}\n
  Compare these responses carefully. Extract the best points from each, filter out any clear inaccuracies, and write one definitive, perfectly comprehensive master answer.`;

  return await fetchGroqModel(synthesisPrompt, 'llama3-70b-8192');
}

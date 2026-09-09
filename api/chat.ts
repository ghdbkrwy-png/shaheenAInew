/**
 * Vercel Edge Function - API Proxy
 * 
 * هذا الملف بيشتغل كـ proxy بين التطبيق و OpenRouter API
 * المفتاح محفوظ بـ environment variable على Vercel (مش ظاهر للـ client)
 * 
 * Environment Variables المطلوبة على Vercel:
 * - OPENROUTER_API_KEY: مفتاح OpenRouter API
 */

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPTS = {
  instant: `You are NovaMind AI — a hyper-efficient, lightning-fast assistant operating in "Instant Mode" (⚡ الرد السريع).

CRITICAL LANGUAGE RULE:
- ALWAYS detect and respond in the SAME language as the user's message.
- If the user writes in Arabic, respond ENTIRELY in Arabic.
- If the user writes in English, respond ENTIRELY in English.
- If mixed, respond in the dominant language of the message.
- NEVER mix languages in your response.

CORE BEHAVIOR:
- Deliver immediate, direct, high-precision answers.
- NEVER ask clarifying questions.
- Get straight to the point with actionable, structured responses.
- Use bullet points, numbered lists, and clear headers when appropriate.
- If the question is ambiguous, provide the most likely interpretation and answer it directly.
- Be concise but comprehensive — no filler words, no hedging.

RESPONSE FORMAT:
- Start with a direct answer or solution.
- Use markdown formatting for structure (##, ###, **, •, 1., >).
- Include relevant examples when helpful.
- End with a brief actionable takeaway if applicable.

TONE: Confident, precise, efficient. Like a senior expert giving a quick consultation.
Remember: Match the user's language exactly. عربي = عربي. English = English.`,

  planning: `You are NovaMind AI — a strategic planning consultant operating in "Strategic Planning Mode" (🎯 تخطيط للرد - Interactive Discovery).

CRITICAL LANGUAGE RULE:
- ALWAYS detect and respond in the SAME language as the user's message.
- If the user writes in Arabic, respond ENTIRELY in Arabic (including questions, chips, and plan).
- If the user writes in English, respond ENTIRELY in English.
- NEVER mix languages in your response.

CORE BEHAVIOR:
- You are an interactive consultant. You NEVER give a full immediate answer.
- Instead, you guide the user through a structured discovery process.
- Ask 1-2 short diagnostic questions per turn.
- Provide interactive option chips/suggestions as [Option A], [Option B], etc.
- Track and display your planning progress percentage.

PLANNING PHASES:
1. Discovery / الاستكشاف (0-30%): Understand the user's goal, constraints, and context.
2. Analysis / التحليل (30-60%): Explore options, trade-offs, and requirements.
3. Blueprint / المخطط (60-90%): Draft the structured plan with milestones.
4. Master Plan / الخطة الشاملة (90-100%): Deliver the comprehensive final plan.

RESPONSE FORMAT:
- Always start with: [📊 مرحلة التخطيط: X%] (Arabic) or [📊 Planning Phase: X%] (English)
- Ask 1-2 focused questions IN THE USER'S LANGUAGE.
- Provide 2-4 option chips IN THE USER'S LANGUAGE.
- Format chips as: [Option Name]
- In the final phase, output the Master Plan with full structured details.

TONE: Thoughtful, methodical, encouraging. Like a senior strategist building a roadmap together.
Remember: Match the user's language exactly. If they write Arabic, everything must be Arabic.`
};

export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, mode } = await req.json();

    // Validate API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'API key not configured. Please set OPENROUTER_API_KEY in Vercel environment variables.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Select system prompt based on mode
    const systemPrompt = mode === 'planning' ? SYSTEM_PROMPTS.planning : SYSTEM_PROMPTS.instant;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || req.headers.get('origin') || 'https://novamind.vercel.app',
        'X-Title': 'NovaMind AI',
      },
      body: JSON.stringify({
        model: 'liquid/lfm-2.5-2.6b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: mode === 'planning' ? 0.7 : 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `AI service error: ${response.status}`,
        details: errorText 
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Stream the response back to the client
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response stream' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('API handler error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

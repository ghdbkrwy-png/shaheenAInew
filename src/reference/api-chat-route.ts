/**
 * Vercel Edge API Route - /api/chat/route.ts
 * 
 * This file is the REFERENCE implementation for the Vercel Edge API.
 * In production, deploy this to your Vercel project as an App Router route handler.
 * 
 * Required environment variable:
 * - OPENROUTER_API_KEY: Your OpenRouter API key (stored securely in Vercel)
 * 
 * The client app calls this endpoint with:
 * - POST /api/chat
 * - Body: { messages: Message[], mode: 'instant' | 'planning' }
 * - Returns: Server-Sent Events (SSE) stream
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';

const INSTANT_SYSTEM_PROMPT = `You are NovaMind AI — a hyper-efficient, lightning-fast assistant operating in "Instant Mode" (⚡ الرد السريع).

CORE BEHAVIOR:
- Deliver immediate, direct, high-precision answers.
- NEVER ask clarifying questions. NEVER say "let me think about that."
- Get straight to the point with actionable, structured responses.
- Use bullet points, numbered lists, and clear headers when appropriate.
- If the question is ambiguous, provide the most likely interpretation and answer it directly.
- Support Arabic and English seamlessly. Detect the user's language and respond in the same language.
- Be concise but comprehensive — no filler words, no hedging.

RESPONSE FORMAT:
- Start with a direct answer or solution.
- Use markdown formatting for structure.
- Include relevant examples when helpful.
- End with a brief actionable takeaway if applicable.

TONE: Confident, precise, efficient. Like a senior expert giving a quick consultation.`;

const PLANNING_SYSTEM_PROMPT = `You are NovaMind AI — a strategic planning consultant operating in "Strategic Planning Mode" (🎯 تخطيط للرد - Interactive Discovery).

CORE BEHAVIOR:
- You are an interactive consultant. You NEVER give a full immediate answer.
- Instead, you guide the user through a structured discovery process.
- Ask 1-2 short diagnostic questions per turn.
- Provide interactive option chips/suggestions as [Option A], [Option B], etc.
- Track and display your planning progress percentage.

PLANNING PHASES:
1. Discovery (0-30%): Understand the user's goal, constraints, and context.
2. Analysis (30-60%): Explore options, trade-offs, and requirements.
3. Blueprint (60-90%): Draft the structured plan with milestones.
4. Master Plan (90-100%): Deliver the comprehensive final plan (الخطة الشاملة).

RESPONSE FORMAT:
- Always start with: [📊 مرحلة التخطيط: X%]
- Ask 1-2 focused questions.
- Provide 2-4 option chips for the user to choose from.
- Format chips as: [Option Name]
- In the final phase, output "🏆 الخطة الشاملة / Master Plan" with full structured details.

TONE: Thoughtful, methodical, encouraging. Like a senior strategist building a roadmap together.
Support Arabic and English seamlessly.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();

    const systemPrompt = mode === 'planning' ? PLANNING_SYSTEM_PROMPT : INSTANT_SYSTEM_PROMPT;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://novamind.ai',
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
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    // Stream the response back to the client
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Forward the SSE chunks
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
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

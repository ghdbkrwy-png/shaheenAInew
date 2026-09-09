# NovaMind AI — Dual-Engine Chat Application

## 🏗️ Architecture Overview

### Local-First Design
- **Zero Cloud Database**: All data stored locally via `localStorage` (production: `react-native-mmkv` / `Hive`)
- **Privacy First**: API key secured on Vercel server; client only receives streams
- **Offline Capable**: Chat history persists across sessions

### Dual-Engine Response System
Two distinct AI modes accessible via the header toggle:

#### ⚡ Instant Mode (الرد السريع)
- Direct, high-precision answers
- No clarifying questions
- Markdown-formatted output
- Temperature: 0.3 (deterministic)

#### 🎯 Strategic Planning Mode (تخطيط للرد)
- Interactive discovery process
- 1-2 diagnostic questions per turn
- Option chips for quick selection
- Live progress indicator: `[📊 مرحلة التخطيط: X%]`
- Temperature: 0.7 (creative)
- Phases: Discovery → Analysis → Blueprint → Master Plan

---

## 📋 System Prompts

### Instant Mode System Prompt
```
You are NovaMind AI — a hyper-efficient, lightning-fast assistant operating in "Instant Mode" (⚡ الرد السريع).

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

TONE: Confident, precise, efficient. Like a senior expert giving a quick consultation.
```

### Strategic Planning Mode System Prompt
```
You are NovaMind AI — a strategic planning consultant operating in "Strategic Planning Mode" (🎯 تخطيط للرد - Interactive Discovery).

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
Support Arabic and English seamlessly.
```

---

## 🔌 Vercel API Route

### Endpoint: `POST /api/chat`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi!" }
  ],
  "mode": "instant" | "planning"
}
```

**Response:** Server-Sent Events (SSE) stream

**Environment Variables:**
- `OPENROUTER_API_KEY` — OpenRouter API key
- `APP_URL` — Application URL for Referer header

**Model:** `liquid/lfm-2.5-2.6b:free`

See `src/reference/api-chat-route.ts` for the complete implementation.

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Cyber Slate | `#0F172A` | Background base |
| Cyber Dark | `#070D1A` | Deep background |
| Electric Indigo | `#6366F1` | Primary accent |
| Violet Glow | `#8B5CF6` | Secondary accent |
| Emerald Neon | `#10B981` | Planning mode accent |

### Glassmorphism
- Blur: 20px
- Border: `rgba(255, 255, 255, 0.08)`
- Radius: 24px
- Background: `rgba(15, 23, 42, 0.6)`

### Animations
- Spring physics for message bubbles
- Streaming text cursor effect
- Pulse glow on active input
- Floating background orbs
- Shimmer progress bars

---

## 📱 Mobile Adaptation (React Native / Expo)

To port this to React Native:
1. Replace `localStorage` with `react-native-mmkv`
2. Replace CSS with `StyleSheet` / NativeWind
3. Use `expo-file-system` for attachments
4. Use `expo-av` for audio recording
5. Replace Framer Motion with `react-native-reanimated`
6. Use `EventSource` or `fetch` with `ReadableStream` for SSE

---

## 🚀 Quick Start

```bash
npm install
npm run dev     # Development
npm run build   # Production build
```

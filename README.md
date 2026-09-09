# NovaMind AI — Dual-Engine Chat Application

## 🏗️ Architecture Overview

### Local-First Design
- **Zero Cloud Database**: All data stored locally via `localStorage` (production: `react-native-mmkv` / `Hive`)
- **Privacy First**: API key stored locally; direct connection to OpenRouter
- **Offline Capable**: Chat history persists across sessions

### 🌐 Multilingual Support
- **Default Language**: Arabic (RTL support)
- **Switchable**: English / Arabic from Settings
- **Smart Detection**: AI responds in the same language as the user's message
- **Full RTL**: Complete right-to-left layout support for Arabic

### 🌓 Theme System
- **Dark Mode** (default): Cyber Slate aesthetic with glowing accents
- **Light Mode**: Clean, modern light interface
- **Toggle**: Switch from Settings panel

### 🔑 API Integration
- **OpenRouter API**: Direct streaming connection
- **Model**: `liquid/lfm-2.5-2.6b:free`
- **Key Storage**: Securely stored in localStorage
- **Fallback**: Mock responses when no API key is set

---

## 🌟 Dual-Engine Response System

### ⚡ Instant Mode (الرد السريع)
- Direct, high-precision answers
- No clarifying questions
- Markdown-formatted output
- Temperature: 0.3 (deterministic)
- **Language**: Responds in user's language

### 🎯 Strategic Planning Mode (تخطيط للرد)
- Interactive discovery process
- 1-2 diagnostic questions per turn
- Option chips for quick selection
- Live progress indicator: `[📊 مرحلة التخطيط: X%]`
- Temperature: 0.7 (creative)
- **Phases**: Discovery → Analysis → Blueprint → Master Plan
- **Language**: Responds in user's language

---

## ⚙️ Settings Panel

### Language / اللغة
- العربية (Arabic) - Default, RTL
- English - LTR

### Theme / المظهر
- الوضع الليلي (Dark Mode) - Default
- الوضع النهاري (Light Mode)

### API Key / مفتاح API
- Enter your OpenRouter API key
- Get from: https://openrouter.ai/keys
- Stored locally, never sent to third parties
- Without key: Uses intelligent mock responses

---

## 📋 System Prompts

### Instant Mode System Prompt
```
You are NovaMind AI — a hyper-efficient, lightning-fast assistant operating in "Instant Mode" (⚡ الرد السريع).

CRITICAL LANGUAGE RULE:
- ALWAYS detect and respond in the SAME language as the user's message.
- If the user writes in Arabic, respond ENTIRELY in Arabic.
- If the user writes in English, respond ENTIRELY in English.
- If mixed, respond in the dominant language of the message.
- NEVER mix languages in your response.

CORE BEHAVIOR:
- Deliver immediate, direct, high-precision answers.
- NEVER ask clarifying questions. NEVER say "let me think about that."
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
Remember: Match the user's language exactly. عربي = عربي. English = English.
```

### Strategic Planning Mode System Prompt
```
You are NovaMind AI — a strategic planning consultant operating in "Strategic Planning Mode" (🎯 تخطيط للرد - Interactive Discovery).

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
Remember: Match the user's language exactly. If they write Arabic, everything must be Arabic.
```

---

## 🔌 API Integration

### Direct OpenRouter Connection
The app connects directly to OpenRouter API with streaming:

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Request:**
```json
{
  "model": "liquid/lfm-2.5-2.6b:free",
  "messages": [
    { "role": "system", "content": "<system_prompt>" },
    { "role": "user", "content": "..." }
  ],
  "stream": true,
  "temperature": 0.3 | 0.7
}
```

**Response:** Server-Sent Events (SSE) stream

**Authentication:** Bearer token (API key from settings)

---

## 🎨 Design System

### Color Palette
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Background | `#070D1A` | `#F8FAFC` | Base background |
| Surface | `#0F172A` | `#FFFFFF` | Cards, panels |
| Primary | `#6366F1` | `#6366F1` | Electric Indigo |
| Secondary | `#8B5CF6` | `#8B5CF6` | Violet Glow |
| Accent | `#10B981` | `#10B981` | Emerald Neon |

### Glassmorphism
- Blur: 20px
- Border: `rgba(255, 255, 255, 0.08)` (dark) / `rgba(226, 232, 240, 0.6)` (light)
- Radius: 24px
- Background: `rgba(15, 23, 42, 0.6)` (dark) / `rgba(255, 255, 255, 0.8)` (light)

### Animations
- Spring physics for message bubbles
- Streaming text cursor effect
- Pulse glow on active input
- Floating background orbs (dark mode)
- Shimmer progress bars
- Smooth theme transitions

---

## 📱 Features

### Chat Management
- Create new conversations
- Switch between chats
- Delete individual chats
- Clear all history
- Auto-titled conversations

### Input Features
- Text input with Enter to send
- Shift+Enter for new line
- File attachments (UI ready)
- Voice notes (UI ready)
- Streaming responses
- Interactive chips

### UI/UX
- Mobile-first responsive design
- RTL support for Arabic
- Smooth animations (Framer Motion)
- Glassmorphic cards
- Gradient accents
- Status indicators
- Auto-scroll to latest message

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
```

### Getting an API Key
1. Visit https://openrouter.ai/keys
2. Sign up / Sign in
3. Create a new API key
4. Copy the key
5. Open Settings in the app
6. Paste the key and save

### Without API Key
The app includes intelligent mock responses that:
- Detect user's language
- Provide realistic streaming simulation
- Support both Instant and Planning modes
- Demonstrate full UI functionality

---

## 📂 Project Structure

```
src/
├── components/
│   ├── InputDock.tsx          # Floating input with attachments
│   ├── MessageBubble.tsx      # Chat message display
│   ├── ModeToggle.tsx         # Instant/Planning toggle
│   ├── SettingsPanel.tsx      # Settings sidebar
│   └── Sidebar.tsx            # Chat history sidebar
├── hooks/
│   ├── useChat.ts             # Chat logic + API integration
│   ├── useLocalStorage.ts     # Local storage hook
│   └── useSettings.ts         # Settings management
├── App.tsx                    # Main app component
├── i18n.ts                    # Translations (AR/EN)
├── prompts.ts                 # System prompts
├── types.ts                   # TypeScript types
└── index.css                  # Global styles + themes
```

---

## 🔒 Privacy & Security

- **Local Storage**: All data stays on your device
- **API Key**: Stored in localStorage, never sent to third parties
- **Direct Connection**: App connects directly to OpenRouter
- **No Backend**: No server-side data collection
- **No Analytics**: Zero tracking or telemetry

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **OpenRouter API** - AI model access

---

## 📄 License

MIT License - Feel free to use and modify.

# NovaMind AI — Dual-Engine Chat Application

<div dir="rtl">

## 🌟 نظرة عامة

تطبيق محادثة ذكاء اصطناعي متقدم مع معالج مزدوج (Dual-Engine) وبنية محلية أولاً (Local-First).

### المميزات الرئيسية:
- ⚡ **وضع الرد السريع**: إجابات مباشرة ودقيقة
- 🎯 **وضع التخطيط الاستراتيجي**: اكتشاف تفاعلي خطوة بخطوة
- 🌐 **دعم كامل للعربية**: RTL + ردود بنفس لغة السؤال
- 🌓 **وضع ليلي/نهاري**: تبديل سلس بين المظهرين
- 🔒 **خصوصية كاملة**: البيانات محفوظة محلياً
- 🚀 **نشر سهل على Vercel**: Edge Function + API محمي

</div>

---

## 🚀 النشر السريع على Vercel

### الخطوات:

1. **ارفع المشروع على GitHub**
```bash
git init
git add .
git commit -m "NovaMind AI"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. **استورد على Vercel**
- اذهب إلى: https://vercel.com/new
- اختر المستودع

3. **أضف Environment Variable** ⚠️
| المتغير | القيمة | المصدر |
|---------|--------|--------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | https://openrouter.ai/keys |

4. **اضغط Deploy** 🎉

📖 **دليل مفصل**: انظر [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🏗️ البنية التقنية

```
novamind-ai/
├── api/
│   └── chat.ts              # Vercel Edge Function (Proxy)
├── src/
│   ├── components/          # React Components
│   ├── hooks/               # Custom Hooks
│   ├── App.tsx              # Main App
│   ├── i18n.ts              # Translations (AR/EN)
│   ├── prompts.ts           # System Prompts
│   └── types.ts             # TypeScript Types
├── vercel.json              # Vercel Configuration
└── package.json
```

### 🔒 الأمان:
- ✅ المفتاح محفوظ على Vercel (Environment Variables)
- ✅ غير ظاهر في الكود المصدري
- ✅ Edge Function كـ proxy آمن
- ✅ لا CORS issues

---

## 🌟 Dual-Engine Response System

### ⚡ Instant Mode (الرد السريع)
- إجابات مباشرة ودقيقة
- بدون أسئلة استيضاحية
- تنسيق Markdown
- Temperature: 0.3

### 🎯 Strategic Planning Mode (تخطيط للرد)
- عملية اكتشاف تفاعلية
- أسئلة تشخيصية لكل مرحلة
- خيارات سريعة للاختيار
- تتبع التقدم: `[📊 مرحلة التخطيط: X%]`
- Temperature: 0.7

---

## 🌐 Multilingual Support

<div dir="rtl">

- **اللغة الأساسية**: العربية (RTL)
- **تبديل اللغة**: من الإعدادات
- **رد بنفس اللغة**: AI يكتشف لغة السؤال ويرد بنفس اللغة
- **دعم كامل RTL**: تخطيط يمين-يسار كامل

</div>

---

## 🎨 Design System

### Color Palette
| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| Background | `#070D1A` | `#F8FAFC` |
| Primary | `#6366F1` | `#6366F1` |
| Secondary | `#8B5CF6` | `#8B5CF6` |
| Accent | `#10B981` | `#10B981` |

### Features
- Glassmorphism cards (blur 20px)
- Spring animations (Framer Motion)
- Streaming cursor effect
- Pulse glow on active input
- Floating background orbs
- Smooth theme transitions

---

## 📋 System Prompts

### Instant Mode
```
You are NovaMind AI — hyper-efficient assistant in "Instant Mode" (⚡ الرد السريع).

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME language as the user's message.
- Arabic input → Arabic response
- English input → English response
- NEVER mix languages.

CORE BEHAVIOR:
- Direct, high-precision answers
- No clarifying questions
- Actionable, structured responses
- Markdown formatting
- Concise but comprehensive
```

### Planning Mode
```
You are NovaMind AI — strategic consultant in "Strategic Planning Mode" (🎯 تخطيط للرد).

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME language as the user's message.

CORE BEHAVIOR:
- Interactive discovery process
- 1-2 diagnostic questions per turn
- Option chips: [Option A], [Option B]
- Progress tracking: [📊 مرحلة التخطيط: X%]

PHASES:
1. Discovery (0-30%)
2. Analysis (30-60%)
3. Blueprint (60-90%)
4. Master Plan (90-100%)
```

---

## 🔌 API Integration

### Vercel Edge Function (`api/chat.ts`)

**Endpoint**: `POST /api/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "..." }
  ],
  "mode": "instant" | "planning"
}
```

**Response**: Server-Sent Events (SSE) stream

**Model**: `liquid/lfm-2.5-2.6b:free` (Free, Fast, Arabic+English)

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vercel Edge Functions** - API proxy
- **OpenRouter API** - AI model

---

## 🚀 Quick Start

```bash
# Install
npm install

# Development (needs vercel CLI for API)
npm run dev
vercel dev

# Build
npm run build
```

---

## 🔒 Privacy & Security

- ✅ All data stored locally (localStorage)
- ✅ API key on Vercel (Environment Variables)
- ✅ No cloud database
- ✅ No tracking or analytics
- ✅ Direct connection to OpenRouter
- ✅ Edge Function as secure proxy

---

## 📖 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [API Documentation](./api/chat.ts) - Edge Function code
- [System Prompts](./src/prompts.ts) - AI prompts

---

## 🆘 Troubleshooting

### ❌ "Failed to fetch"
**Solution**: Deploy on Vercel with `OPENROUTER_API_KEY` set

### ❌ "API key not configured"
**Solution**: Add `OPENROUTER_API_KEY` in Vercel Environment Variables

### ❌ Model not responding
**Solution**: Check https://openrouter.ai/models for availability

---

## 📄 License

MIT License - Free to use and modify.

---

<div dir="rtl">

## 🎉 مبروك!

تطبيقك جاهز للاستخدام. اتبع دليل النشر في [DEPLOYMENT.md](./DEPLOYMENT.md) للخطوات التفصيلية.

</div>

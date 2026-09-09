# 🚀 دليل النشر على Vercel - NovaMind AI

## 📋 الخطوات الكاملة للنشر

### 1️⃣ إنشاء حساب Vercel
- اذهب إلى: https://vercel.com
- سجل دخول بحساب GitHub

### 2️⃣ رفع المشروع على GitHub
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit - NovaMind AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/novamind-ai.git
git push -u origin main
```

### 3️⃣ استيراد المشروع على Vercel
- اذهب إلى: https://vercel.com/new
- اختر المستودع من GitHub
- Vercel سيكتشف تلقائياً أنه مشروع Vite

### 4️⃣ إضافة Environment Variables ⚠️ **مهم جداً**

قبل الضغط على Deploy، أضف المتغيرات التالية:

#### المتغيرات المطلوبة:

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxx...` | مفتاح OpenRouter API |
| `APP_URL` | `https://your-app.vercel.app` | رابط التطبيق (اختياري) |

#### كيفية الحصول على مفتاح OpenRouter:
1. اذهب إلى: https://openrouter.ai/keys
2. سجل دخول / أنشئ حساب
3. اضغط "Create Key"
4. انسخ المفتاح (يبدأ بـ `sk-or-v1-`)
5. الصقه في خانة `OPENROUTER_API_KEY`

### 5️⃣ الضغط على Deploy
- انتظر حتى ينتهي النشر (عادة 1-2 دقيقة)
- ستحصل على رابط مثل: `https://novamind-ai.vercel.app`

---

## 🔧 هيكل المشروع على Vercel

```
novamind-ai/
├── api/
│   └── chat.ts              # Vercel Edge Function (Proxy)
├── src/
│   ├── components/          # React Components
│   ├── hooks/               # Custom Hooks
│   ├── App.tsx              # Main App
│   └── ...
├── dist/                    # Built frontend (يُنشأ تلقائياً)
├── vercel.json              # Vercel Configuration
└── package.json
```

---

## 🔒 الأمان والخصوصية

### ✅ المفتاح محمي:
- `OPENROUTER_API_KEY` موجود فقط على Vercel (Environment Variables)
- غير ظاهر في الكود المصدري
- غير ظاهر في المتصفح (Network Tab)
- الـ Edge Function تعمل كـ proxy آمن

### ✅ لا يوجد CORS Issues:
- الـ Edge Function على نفس النطاق (`/api/chat`)
- لا حاجة لإعدادات CORS خاصة
- الاتصال آمن ومباشر

---

## 🧪 الاختبار المحلي

### للتطوير المحلي (بدون Vercel):

#### الخيار 1: استخدام Vercel CLI
```bash
npm i -g vercel
vercel dev
```
هذا سيشغل الـ Edge Function محلياً.

#### الخيار 2: استخدام Proxy
أضف في `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://openrouter.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/api/v1/chat/completions'),
        headers: {
          'Authorization': `Bearer YOUR_API_KEY`,
        }
      }
    }
  }
})
```

---

## 📊 Environment Variables التفصيلي

### OPENROUTER_API_KEY
- **النوع**: String
- **مطلوب**: ✅ نعم
- **المصدر**: https://openrouter.ai/keys
- **الصيغة**: `sk-or-v1-xxxxxxxxxxxx...`
- **الاستخدام**: في `api/chat.ts` للاتصال بـ OpenRouter

### APP_URL (اختياري)
- **النوع**: String
- **مطلوب**: ❌ لا (لكن مستحسن)
- **المثال**: `https://novamind-ai.vercel.app`
- **الاستخدام**: كـ HTTP-Referer في طلبات OpenRouter

---

## 🎯 النموذج المستخدم

```
Model: liquid/lfm-2.5-2.6b:free
Provider: Liquid AI
Cost: Free (مجاني)
Context: 32K tokens
Speed: Fast
```

### مميزات النموذج:
- ✅ مجاني 100%
- ✅ سريع جداً
- ✅ يدعم العربية والإنجليزية
- ✅ مناسب للمحادثات

---

## 🐛 حل المشاكل الشائعة

### ❌ خطأ "Failed to fetch"
**السبب**: لم يتم نشر Edge Function أو المفتاح غير موجود

**الحل**:
1. تأكد من وجود `api/chat.ts` في المستودع
2. تأكد من إضافة `OPENROUTER_API_KEY` في Vercel
3. أعد Deploy المشروع

### ❌ خطأ "API key not configured"
**السبب**: المتغير `OPENROUTER_API_KEY` غير موجود

**الحل**:
1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف `OPENROUTER_API_KEY`
5. أعد Deploy

### ❌ خطأ "Model not found"
**السبب**: النموذج غير متاح أو تم تغيير اسمه

**الحل**:
- تحقق من https://openrouter.ai/models
- تأكد من أن `liquid/lfm-2.5-2.6b:free` لا يزال متاحاً

### ❌ خطأ "Rate limit exceeded"
**السبب**: تجاوزت الحد المجاني

**الحل**:
- انتظر دقيقة وحاول مرة أخرى
- أو اشترك في خطة مدفوعة على OpenRouter

---

## 📱 النشر على Netlify (بديل)

إذا كنت تفضل Netlify بدلاً من Vercel:

### الخطوات:
1. ارفع المشروع على GitHub
2. اذهب إلى: https://app.netlify.com
3. Import من GitHub
4. أضف Environment Variables نفسها
5. **مهم**: Netlify لا يدعم Edge Functions بنفس الطريقة
6. استخدم Netlify Functions بدلاً من ذلك

### تحويل Edge Function لـ Netlify Function:
```javascript
// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages, mode } = JSON.parse(event.body);
  
  // ... نفس الكود من api/chat.ts
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/event-stream',
    },
    body: response.body,
  };
};
```

---

## 🔐 الأمان المتقدم

### إضافة Rate Limiting (اختياري):
```typescript
// في api/chat.ts
const RATE_LIMIT = 10; // طلبات لكل دقيقة
const rateLimitMap = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < 60000);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}
```

### إضافة Authentication (اختياري):
```typescript
// في api/chat.ts
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (req.headers.get('Authorization') !== `Bearer ${AUTH_TOKEN}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## 📈 المراقبة والتحليلات

### Vercel Analytics:
- اذهب إلى Vercel Dashboard → Analytics
- شاهد عدد الطلبات والأخطاء
- مجاني حتى 100K طلب/شهر

### OpenRouter Dashboard:
- اذهب إلى: https://openrouter.ai/activity
- شاهد استخدام الـ API
- تتبع التكلفة (مجاني في حالتنا)

---

## 🎓 نصائح مهمة

### ✅ أفضل الممارسات:
1. **لا تشارك المفتاح**: لا تضعه في الكود أو GitHub
2. **استخدم Environment Variables**: دائماً على Vercel
3. **راقب الاستخدام**: تحقق من OpenRouter Dashboard
4. **اختبر محلياً**: استخدم `vercel dev` قبل النشر
5. **حافظ على الخصوصية**: لا ترسل بيانات حساسة للـ API

### ❌ أخطاء شائعة:
1. ❌ وضع المفتاح في `.env` ورفعها على GitHub
2. ❌ نسيان إضافة Environment Variables على Vercel
3. ❌ استخدام نموذج مدفوع بدون رصيد كافٍ
4. ❌ عدم اختبار Edge Function محلياً

---

## 🆘 الدعم والمساعدة

### روابط مفيدة:
- Vercel Docs: https://vercel.com/docs
- OpenRouter Docs: https://openrouter.ai/docs
- Edge Functions: https://vercel.com/docs/functions/edge-functions

### مجتمع:
- Vercel Discord: https://vercel.com/discord
- OpenRouter Discord: https://discord.gg/openrouter

---

## 📝 ملخص سريع

```bash
# 1. ارفع على GitHub
git push origin main

# 2. استورد على Vercel
# https://vercel.com/new

# 3. أضف Environment Variables
OPENROUTER_API_KEY=sk-or-v1-xxxx...

# 4. اضغط Deploy
# انتظر 1-2 دقيقة

# 5. افتح الرابط
# https://your-app.vercel.app
```

---

**🎉 مبروك! تطبيقك جاهز للاستخدام**

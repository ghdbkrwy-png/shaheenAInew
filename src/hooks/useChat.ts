import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat, ChatMode } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { INSTANT_SYSTEM_PROMPT, PLANNING_SYSTEM_PROMPT } from '../prompts';

export function useChat(apiKey: string) {
  const [chats, setChats] = useLocalStorage<Chat[]>('novamind-chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('novamind-active-chat', null);
  const [mode, setMode] = useLocalStorage<ChatMode>('novamind-mode', 'instant');
  const [isStreaming, setIsStreaming] = useState(false);
  const planningProgressRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'محادثة جديدة',
      messages: [],
      mode,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    planningProgressRef.current = 0;
    return newChat.id;
  }, [mode, setChats, setActiveChatId]);

  const sendMessage = useCallback(async (content: string) => {
    let chatId = activeChatId;
    
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      mode
    };

    // Add user message
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, userMessage];
        return {
          ...chat,
          messages: updatedMessages,
          title: chat.messages.length === 0 ? content.slice(0, 40) + '...' : chat.title,
          updatedAt: Date.now()
        };
      }
      return chat;
    }));

    // Create assistant message placeholder
    const assistantId = uuidv4();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode,
      isStreaming: true,
      planningProgress: mode === 'planning' ? planningProgressRef.current : undefined
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, assistantMessage],
          updatedAt: Date.now()
        };
      }
      return chat;
    }));

    setIsStreaming(true);

    // If no API key, use mock responses
    if (!apiKey) {
      await simulateStreaming(chatId!, assistantId, content, mode);
      setIsStreaming(false);
      return;
    }

    // Real API call to OpenRouter
    try {
      abortControllerRef.current = new AbortController();
      
      const systemPrompt = mode === 'instant' ? INSTANT_SYSTEM_PROMPT : PLANNING_SYSTEM_PROMPT;
      
      // Get previous messages for context
      const currentChat = chats.find(c => c.id === chatId);
      const previousMessages = currentChat?.messages.filter(m => m.role !== 'system').slice(-10) || [];
      
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...previousMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NovaMind AI',
        },
        body: JSON.stringify({
          model: 'liquid/lfm-2.5-2.6b:free',
          messages: apiMessages,
          stream: true,
          temperature: mode === 'planning' ? 0.7 : 0.3,
          max_tokens: 2048,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                
                // Update planning progress
                let progress = planningProgressRef.current;
                if (mode === 'planning') {
                  const progressMatch = fullContent.match(/(\d+)%/);
                  if (progressMatch) {
                    progress = parseInt(progressMatch[1]);
                    planningProgressRef.current = progress;
                  }
                }

                // Extract chips from response
                const chips: string[] = [];
                const chipMatches = fullContent.matchAll(/\[([^\]]+)\]/g);
                for (const match of chipMatches) {
                  const chip = match[1];
                  if (chip.length < 40 && !chip.includes('📊') && !chip.includes('%')) {
                    chips.push(chip);
                  }
                }

                setChats(prev => prev.map(chat => {
                  if (chat.id === chatId) {
                    const msgs = chat.messages.map(m => {
                      if (m.id === assistantId) {
                        return {
                          ...m,
                          content: fullContent,
                          planningProgress: mode === 'planning' ? progress : undefined,
                          chips: chips.length > 0 ? chips.slice(0, 4) : undefined
                        };
                      }
                      return m;
                    });
                    return { ...chat, messages: msgs, updatedAt: Date.now() };
                  }
                  return chat;
                }));
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      // Final update - mark as not streaming
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const msgs = chat.messages.map(m => {
            if (m.id === assistantId) {
              return { ...m, isStreaming: false };
            }
            return m;
          });
          return { ...chat, messages: msgs, updatedAt: Date.now() };
        }
        return chat;
      }));

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      // Show error in chat
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const msgs = chat.messages.map(m => {
            if (m.id === assistantId) {
              return { 
                ...m, 
                content: `⚠️ خطأ: ${error.message || 'فشل الاتصال بالخادم'}`,
                isStreaming: false 
              };
            }
            return m;
          });
          return { ...chat, messages: msgs, updatedAt: Date.now() };
        }
        return chat;
      }));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeChatId, mode, apiKey, createNewChat, setChats, chats]);

  // Simulated streaming for when no API key is set
  const simulateStreaming = async (chatId: string, assistantId: string, userContent: string, currentMode: ChatMode) => {
    let fullContent = '';
    let chips: string[] = [];
    let progress = 0;

    if (currentMode === 'instant') {
      // Detect language from user input
      const isArabic = /[\u0600-\u06FF]/.test(userContent);
      
      if (isArabic) {
        fullContent = `## إجابة مباشرة\n\nبناءً على سؤالك حول "${userContent.slice(0, 40)}..."، إليك الحل الدقيق:\n\n**النقاط الأساسية:**\n• النهج الأمثل هو البدء بتحديد الهدف بوضوح\n• قسّم المهمة إلى 3-5 خطوات قابلة للتنفيذ\n• تحقق من كل خطوة قبل المتابعة\n\n**التنفيذ:**\n1. حدد متطلباتك الأساسية\n2. اختر الأداة/الإطار المناسب\n3. ابنِ النموذج الأولي بأقل التبعيات\n4. اختبر وكرر بسرعة\n\n> 💡 **الخلاصة:** ركّز على التنفيذ لا الكمال. أطلق بسرعة، وتعلم أسرع.`;
      } else {
        fullContent = `## Direct Answer\n\nBased on your query about "${userContent.slice(0, 40)}...", here's the precise solution:\n\n**Key Points:**\n• The optimal approach is to start with a clear objective\n• Break down into 3-5 actionable steps\n• Validate each step before proceeding\n\n**Implementation:**\n1. Define your core requirements\n2. Select the appropriate tool/framework\n3. Build the MVP with minimal dependencies\n4. Test and iterate rapidly\n\n> 💡 **Takeaway:** Focus on execution over perfection. Ship fast, learn faster.`;
      }
    } else {
      planningProgressRef.current = Math.min(planningProgressRef.current + 25 + Math.random() * 10, 100);
      progress = Math.round(planningProgressRef.current);
      
      const isArabic = /[\u0600-\u06FF]/.test(userContent);
      
      if (isArabic) {
        if (progress <= 30) {
          fullContent = `[📊 مرحلة التخطيط: ${progress}%]\n\n## 🔍 المرحلة: الاستكشاف\n\nأود فهم وضعك بشكل أفضل قبل المتابعة.\n\n**أسئلة تشخيصية:**\n1. ما الهدف الأساسي الذي تسعى لتحقيقه؟\n2. ما القيود أو المحددات التي يجب مراعاتها؟\n\nاختر الخيار الأنسب لوضعك:`;
          chips = ['استراتيجية أعمال', 'بنية تقنية', 'تطوير شخصي', 'مشروع إبداعي'];
        } else if (progress <= 60) {
          fullContent = `[📊 مرحلة التخطيط: ${progress}%]\n\n## 📋 المرحلة: التحليل\n\nتقدم ممتاز! الآن لنستكشف الخيارات والمقايضات.\n\n**اعتبارات رئيسية:**\n• تخصيص الموارد والجدول الزمني\n• تقييم المخاطر والتخفيف منها\n• توافق أصحاب المصلحة\n\n**أي نهج يناسبك أكثر؟**`;
          chips = ['جدول زمني مكثف', 'نهج متوازن', 'محافظ وآمن', 'مسار تجريبي'];
        } else if (progress <= 90) {
          fullContent = `[📊 مرحلة التخطيط: ${progress}%]\n\n## 🏗️ المرحلة: المخطط\n\nنحن قريبون من الخطة النهائية. إليك الهيكل:\n\n**المعلمة 1:** التأسيس والبحث (الأسبوع 1-2)\n**المعلمة 2:** التنفيذ الأساسي (الأسبوع 3-4)\n**المعلمة 3:** الاختبار والتحسين (الأسبوع 5-6)\n**المعلمة 4:** الإطلاق والتكرار (الأسبوع 7-8)\n\n**هل أنت جاهز للإتمام؟ أي تعديلات مطلوبة؟**`;
          chips = ['يبدو جيد — إتمام', 'إضافة تفاصيل', 'تعديل الجدول', 'إضافة تخفيف المخاطر'];
        } else {
          fullContent = `[📊 مرحلة التخطيط: 100%]\n\n## 🏆 الخطة الشاملة\n\nبناءً على الاستكشاف والتحليل، إليك خطتك الاستراتيجية الشاملة:\n\n### 📌 الملخص التنفيذي\nخريطة طريق منظمة لتحقيق أهدافك مع معالم قابلة للقياس.\n\n### 🎯 الأهداف\n1. تأسيس قاعدة واضحة\n2. بناء القدرات الأساسية\n3. التحقق والتحسين\n4. التوسع والاستدامة\n\n### 📅 الجدول الزمني\n| المرحلة | المدة | المخرج |\n|---------|-------|--------|\n| الاستكشاف | أسبوع 1-2 | وثيقة المتطلبات |\n| البناء | أسبوع 3-4 | نموذج أولي |\n| الاختبار | أسبوع 5-6 | منتج مُتحقق |\n| الإطلاق | أسبوع 7-8 | النشر المباشر |\n\n### ⚠️ تخفيف المخاطر\n- اجتماعات أسبوعية لتصحيح المسار\n- وقت احتياطي في كل معلمة\n- خيارات بديلة محددة\n\n### 🚀 الخطوات التالية\n1. راجع هذه الخطة وأكد التوافق\n2. حدد المسؤوليات\n3. أنشئ لوحة متابعة\n4. ابدأ أنشطة الأسبوع الأول\n\n> ✅ **الخطة مكتملة.** جاهزة للتنفيذ!`;
          chips = ['بدء التنفيذ', 'مراجعة الخطة', 'تصدير PDF', 'مشاركة مع الفريق'];
        }
      } else {
        if (progress <= 30) {
          fullContent = `[📊 Planning Phase: ${progress}%]\n\n## 🔍 Phase: Discovery\n\nI'd like to understand your situation better.\n\n**Diagnostic Questions:**\n1. What is the primary goal you're trying to achieve?\n2. What constraints should we consider?\n\nChoose the best option:`;
          chips = ['Business Strategy', 'Technical Architecture', 'Personal Development', 'Creative Project'];
        } else if (progress <= 60) {
          fullContent = `[📊 Planning Phase: ${progress}%]\n\n## 📋 Phase: Analysis\n\nGreat progress! Let's explore options and trade-offs.\n\n**Key Considerations:**\n• Resource allocation and timeline\n• Risk assessment and mitigation\n• Stakeholder alignment\n\n**Which approach resonates most?**`;
          chips = ['Aggressive Timeline', 'Balanced Approach', 'Conservative & Safe', 'Experimental Path'];
        } else if (progress <= 90) {
          fullContent = `[📊 Planning Phase: ${progress}%]\n\n## 🏗️ Phase: Blueprint\n\nClose to the final plan. Here's the draft:\n\n**Milestone 1:** Foundation & Research (Week 1-2)\n**Milestone 2:** Core Implementation (Week 3-4)\n**Milestone 3:** Testing & Refinement (Week 5-6)\n**Milestone 4:** Launch & Iterate (Week 7-8)\n\n**Ready to finalize?**`;
          chips = ['Looks Good — Finalize', 'Add More Detail', 'Adjust Timeline', 'Add Risk Mitigation'];
        } else {
          fullContent = `[📊 Planning Phase: 100%]\n\n## 🏆 Master Plan\n\nHere is your comprehensive strategic plan:\n\n### 📌 Executive Summary\nA structured roadmap to achieve your goals.\n\n### 🎯 Objectives\n1. Establish clear foundation\n2. Build core capabilities\n3. Validate and optimize\n4. Scale and sustain\n\n### 📅 Timeline\n| Phase | Duration | Deliverable |\n|-------|----------|-------------|\n| Discovery | Week 1-2 | Requirements Doc |\n| Build | Week 3-4 | MVP |\n| Test | Week 5-6 | Validated Product |\n| Launch | Week 7-8 | Live Deployment |\n\n> ✅ **Plan complete.** Ready for execution!`;
          chips = ['Start Execution', 'Revise Plan', 'Export as PDF', 'Share with Team'];
        }
      }
    }

    // Simulate streaming effect
    const steps = 25;
    const stepDuration = 60;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const partialContent = fullContent.slice(0, Math.floor((fullContent.length * i) / steps));
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const msgs = chat.messages.map(m => {
            if (m.id === assistantId) {
              return {
                ...m,
                content: partialContent,
                isStreaming: i < steps,
                planningProgress: currentMode === 'planning' ? progress : undefined,
                chips: i === steps ? chips : undefined
              };
            }
            return m;
          });
          return { ...chat, messages: msgs, updatedAt: Date.now() };
        }
        return chat;
      }));
    }
  };

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  }, [activeChatId, setChats, setActiveChatId]);

  const clearAllChats = useCallback(() => {
    setChats([]);
    setActiveChatId(null);
    planningProgressRef.current = 0;
  }, [setChats, setActiveChatId]);

  return {
    chats,
    activeChat,
    activeChatId,
    mode,
    isStreaming,
    setMode,
    setActiveChatId,
    sendMessage,
    createNewChat,
    deleteChat,
    clearAllChats
  };
}

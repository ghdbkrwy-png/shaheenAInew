import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat, ChatMode } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { INSTANT_SYSTEM_PROMPT, PLANNING_SYSTEM_PROMPT } from '../prompts';

// Simulated AI responses for demo (in production, this would stream from the API)
const generateInstantResponse = (userMessage: string): string => {
  const responses = [
    `## Direct Answer\n\nBased on your query about "${userMessage.slice(0, 40)}...", here's the precise solution:\n\n**Key Points:**\n• The optimal approach is to start with a clear objective definition\n• Break down into 3-5 actionable steps\n• Validate each step before proceeding\n\n**Implementation:**\n1. Define your core requirements\n2. Select the appropriate tool/framework\n3. Build the MVP with minimal dependencies\n4. Test and iterate rapidly\n\n> 💡 **Takeaway:** Focus on execution over perfection. Ship fast, learn faster.`,
    `## Solution Overview\n\nHere's a structured response to your question:\n\n**Analysis:**\nYour situation requires a multi-layered approach. Let me break it down:\n\n• **Layer 1:** Foundation — establish the base architecture\n• **Layer 2:** Integration — connect components seamlessly\n• **Layer 3:** Optimization — fine-tune for performance\n\n**Recommended Stack:**\n- Frontend: React + TypeScript\n- State: Zustand or Jotai\n- Styling: Tailwind CSS\n- Backend: Edge functions\n\n**Next Steps:** Start with the foundation layer and validate assumptions early.`,
    `## Expert Recommendation\n\nFor "${userMessage.slice(0, 30)}...", I recommend the following approach:\n\n### Quick Wins (Today)\n✅ Identify the bottleneck\n✅ Apply the 80/20 rule\n✅ Implement the simplest solution first\n\n### Medium-term (This Week)\n📋 Set up monitoring\n📋 Create feedback loops\n📋 Document decisions\n\n### Long-term (This Month)\n🎯 Scale what works\n🎯 Eliminate what doesn't\n🎯 Build systems, not just solutions\n\n**Bottom line:** The fastest path forward is through clarity and decisive action.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generatePlanningResponse = (userMessage: string, progress: number): { content: string; chips: string[] } => {
  if (progress <= 30) {
    return {
      content: `[📊 مرحلة التخطيط: ${progress}%]\n\n## 🔍 Phase: Discovery\n\nI'd like to understand your situation better before we proceed.\n\n**Diagnostic Questions:**\n1. What is the primary goal you're trying to achieve?\n2. What constraints or limitations should we consider?\n\nChoose the option that best describes your situation:`,
      chips: ['Business Strategy', 'Technical Architecture', 'Personal Development', 'Creative Project']
    };
  } else if (progress <= 60) {
    return {
      content: `[📊 مرحلة التخطيط: ${progress}%]\n\n## 📋 Phase: Analysis\n\nGood progress! Now let's explore the options and trade-offs.\n\n**Key Considerations:**\n• Resource allocation and timeline\n• Risk assessment and mitigation\n• Stakeholder alignment\n\n**Which approach resonates most with you?**`,
      chips: ['Aggressive Timeline', 'Balanced Approach', 'Conservative & Safe', 'Experimental Path']
    };
  } else if (progress <= 90) {
    return {
      content: `[📊 مرحلة التخطيط: ${progress}%]\n\n## 🏗️ Phase: Blueprint\n\nWe're close to the final plan. Here's the draft structure:\n\n**Milestone 1:** Foundation & Research (Week 1-2)\n**Milestone 2:** Core Implementation (Week 3-4)\n**Milestone 3:** Testing & Refinement (Week 5-6)\n**Milestone 4:** Launch & Iterate (Week 7-8)\n\n**Ready to finalize? Any adjustments needed?**`,
      chips: ['Looks Good — Finalize', 'Add More Detail', 'Adjust Timeline', 'Add Risk Mitigation']
    };
  } else {
    return {
      content: `[📊 مرحلة التخطيط: 100%]\n\n## 🏆 الخطة الشاملة / Master Plan\n\nBased on our discovery and analysis, here is your comprehensive strategic plan:\n\n### 📌 Executive Summary\nA structured roadmap to achieve your goals with measurable milestones.\n\n### 🎯 Objectives\n1. Establish clear foundation\n2. Build core capabilities\n3. Validate and optimize\n4. Scale and sustain\n\n### 📅 Timeline\n| Phase | Duration | Deliverable |\n|-------|----------|-------------|\n| Discovery | Week 1-2 | Requirements Doc |\n| Build | Week 3-4 | MVP |\n| Test | Week 5-6 | Validated Product |\n| Launch | Week 7-8 | Live Deployment |\n\n### ⚠️ Risk Mitigation\n- Weekly check-ins for course correction\n- Buffer time built into each milestone\n- Fallback options identified\n\n### 🚀 Next Actions\n1. Review this plan and confirm alignment\n2. Assign responsibilities\n3. Set up tracking dashboard\n4. Begin Week 1 activities\n\n> ✅ **Plan complete.** Ready for execution!`,
      chips: ['Start Execution', 'Revise Plan', 'Export as PDF', 'Share with Team']
    };
  }
};

export function useChat() {
  const [chats, setChats] = useLocalStorage<Chat[]>('novamind-chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('novamind-active-chat', null);
  const [mode, setMode] = useLocalStorage<ChatMode>('novamind-mode', 'instant');
  const [isStreaming, setIsStreaming] = useState(false);
  const planningProgressRef = useRef(0);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Conversation',
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

    // Simulate streaming
    setIsStreaming(true);
    
    const assistantId = uuidv4();
    let fullContent = '';
    let chips: string[] = [];
    let progress = 0;

    if (mode === 'instant') {
      fullContent = generateInstantResponse(content);
    } else {
      planningProgressRef.current = Math.min(planningProgressRef.current + 25 + Math.random() * 10, 100);
      progress = Math.round(planningProgressRef.current);
      const planning = generatePlanningResponse(content, progress);
      fullContent = planning.content;
      chips = planning.chips;
    }

    // Simulate streaming effect
    const streamDuration = mode === 'instant' ? 1500 : 800;
    const steps = 30;
    const stepDuration = streamDuration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const partialContent = fullContent.slice(0, Math.floor((fullContent.length * i) / steps));
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const existingMessages = chat.messages.filter(m => m.id !== assistantId);
          return {
            ...chat,
            messages: [...existingMessages, {
              id: assistantId,
              role: 'assistant',
              content: partialContent,
              timestamp: Date.now(),
              mode,
              isStreaming: i < steps,
              planningProgress: mode === 'planning' ? progress : undefined,
              chips: i === steps ? chips : undefined
            }],
            updatedAt: Date.now()
          };
        }
        return chat;
      }));
    }

    setIsStreaming(false);
  }, [activeChatId, mode, createNewChat, setChats]);

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

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat, ChatMode } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useChat() {
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

    // Get current chat messages for context
    const currentChat = chats.find(c => c.id === chatId);
    const previousMessages = currentChat?.messages.slice(-10) || [];
    const apiMessages = [
      ...previousMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content }
    ];

    // Try API call through Vercel Edge Function
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

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
                const chipMatches = fullContent.matchAll(/\[([^\]]{2,40})\]/g);
                for (const match of chipMatches) {
                  const chip = match[1];
                  if (!chip.includes('📊') && !chip.includes('%') && !chip.match(/^\d/)) {
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
      if (error.name === 'AbortError') {
        setIsStreaming(false);
        return;
      }
      
      // Show error in chat
      const isArabic = /[\u0600-\u06FF]/.test(content);
      const errorMsg = isArabic 
        ? `⚠️ تعذر الاتصال بالخدمة. تأكد من نشر التطبيق على Vercel مع إعداد متغير OPENROUTER_API_KEY.`
        : `⚠️ Failed to connect. Make sure the app is deployed on Vercel with OPENROUTER_API_KEY set.`;
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const msgs = chat.messages.map(m => {
            if (m.id === assistantId) {
              return { 
                ...m, 
                content: errorMsg,
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
  }, [activeChatId, mode, createNewChat, setChats, chats]);

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

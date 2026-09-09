import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sparkles, Zap, Target, Trash2, Plus } from 'lucide-react';
import { ModeToggle } from './components/ModeToggle';
import { MessageBubble } from './components/MessageBubble';
import { InputDock } from './components/InputDock';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';

function WelcomeScreen({ mode }: { mode: 'instant' | 'planning' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      {/* Logo / Brand */}
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
          <Sparkles size={36} className="text-white" />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 blur-xl -z-10" />
      </motion.div>

      <h1 className="text-2xl font-bold gradient-text mb-2">NovaMind AI</h1>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        {mode === 'instant' 
          ? 'Lightning-fast, precise answers. No fluff, just results.'
          : 'Strategic planning through interactive discovery. Build your roadmap step by step.'
        }
      </p>

      {/* Mode info card */}
      <div className={`glass-card-light p-5 max-w-sm w-full ${mode === 'planning' ? 'glow-emerald' : 'glow-indigo'}`}>
        <div className="flex items-center gap-2 mb-3">
          {mode === 'instant' ? (
            <>
              <Zap size={18} className="text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Instant Mode</span>
            </>
          ) : (
            <>
              <Target size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Strategic Planning</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          {mode === 'instant'
            ? '⚡ Direct, high-precision responses\n• No unnecessary questions\n• Immediate actionable answers\n• Markdown-formatted output'
            : '🎯 Interactive discovery process\n• Diagnostic questions per turn\n• Option chips for quick selection\n• Progress tracking to Master Plan'
          }
        </p>
      </div>

      {/* Quick prompts */}
      <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm w-full">
        {(mode === 'instant' 
          ? ['Explain quantum computing', 'Write a Python script', 'Compare React vs Vue', 'Best practices for APIs']
          : ['Launch a startup', 'Learn a new skill', 'Plan a project', 'Career transition']
        ).map((prompt, i) => (
          <motion.button
            key={i}
            className="px-3 py-2.5 rounded-xl text-xs text-gray-400 bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:text-indigo-300 transition-all text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function App() {
  const { chats, activeChat, activeChatId, mode, isStreaming, setMode, setActiveChatId, sendMessage, createNewChat, deleteChat, clearAllChats } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  const handleChipClick = (chip: string) => {
    sendMessage(chip);
  };

  return (
    <div className="h-full w-full bg-cyber-dark flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-3xl" />
        <div className="orb-2 absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-3xl" />
        <div className="orb-1 absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-600/3 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-cyber-dark/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={20} />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">NovaMind</h1>
              <p className="text-[10px] text-gray-500">Dual-Engine AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onModeChange={setMode} />
          <motion.button
            onClick={createNewChat}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </header>

      {/* Chat area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10 px-4 py-4">
        {!activeChat || activeChat.messages.length === 0 ? (
          <WelcomeScreen mode={mode} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <AnimatePresence>
              {activeChat.messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onChipClick={handleChipClick}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input dock */}
      <div className="relative z-10">
        <InputDock onSend={handleSend} isStreaming={isStreaming} mode={mode} />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllChats}
      />

      {/* Status bar indicator */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
        >
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
            mode === 'planning'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
          }`}>
            <motion.div
              className="w-2 h-2 rounded-full bg-current"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {mode === 'instant' ? 'Generating response...' : 'Planning in progress...'}
          </div>
        </motion.div>
      )}
    </div>
  );
}

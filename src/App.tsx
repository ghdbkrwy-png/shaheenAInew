import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sparkles, Zap, Target, Trash2, Plus, Settings, ArrowRight, Moon, Sun, Globe, Key, ChevronLeft } from 'lucide-react';
import { ModeToggle } from './components/ModeToggle';
import { MessageBubble } from './components/MessageBubble';
import { InputDock } from './components/InputDock';
import { Sidebar } from './components/Sidebar';
import { SettingsPanel } from './components/SettingsPanel';
import { useChat } from './hooks/useChat';
import { useSettings } from './hooks/useSettings';
import { translations, Lang } from './i18n';

function WelcomeScreen({ mode, lang }: { mode: 'instant' | 'planning'; lang: Lang }) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
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

      <h1 className="text-2xl font-bold gradient-text mb-2">{t.appName}</h1>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        {mode === 'instant' ? t.instantDesc : t.planningDesc}
      </p>

      {/* Mode info card */}
      <div className={`glass-card-light p-5 max-w-sm w-full ${mode === 'planning' ? 'glow-emerald' : 'glow-indigo'}`}>
        <div className="flex items-center gap-2 mb-3">
          {mode === 'instant' ? (
            <>
              <Zap size={18} className="text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">{t.instantMode}</span>
            </>
          ) : (
            <>
              <Target size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{t.planningMode}</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
          {mode === 'instant' ? t.instantFeatures : t.planningFeatures}
        </p>
      </div>

      {/* Quick prompts */}
      <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm w-full">
        {(mode === 'instant' ? t.quickPrompts.instant : t.quickPrompts.planning).map((prompt, i) => (
          <motion.button
            key={i}
            className="px-3 py-2.5 rounded-xl text-xs text-gray-400 bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:text-indigo-300 transition-all text-start"
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
  const { settings, setLang, setTheme, updateSettings } = useSettings();
  const { chats, activeChat, activeChatId, mode, isStreaming, setMode, setActiveChatId, sendMessage, createNewChat, deleteChat, clearAllChats } = useChat(settings.apiKey);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[settings.lang];
  const isRtl = settings.lang === 'ar';

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.classList.toggle('light', settings.theme === 'light');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.lang;
  }, [settings.theme, isRtl, settings.lang]);

  // Auto-scroll
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

  // Theme classes
  const isDark = settings.theme === 'dark';
  const bgClass = isDark ? 'bg-cyber-dark' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const headerBg = isDark ? 'bg-cyber-dark/80' : 'bg-white/80';
  const headerBorder = isDark ? 'border-white/5' : 'border-gray-200';

  return (
    <div className={`h-full w-full ${bgClass} flex flex-col relative overflow-hidden transition-colors duration-300`}>
      {/* Background orbs */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb-1 absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-3xl" />
          <div className="orb-2 absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-3xl" />
          <div className="orb-1 absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-600/3 blur-3xl" />
        </div>
      )}

      {/* Header */}
      <header className={`relative z-10 flex items-center justify-between px-4 py-3 border-b ${headerBorder} ${headerBg} backdrop-blur-xl transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-white/5 transition-colors`}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={20} />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h1 className={`text-sm font-bold ${textClass} leading-none`}>{t.appName}</h1>
              <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.appSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onModeChange={setMode} />
          <motion.button
            onClick={() => setSettingsOpen(true)}
            className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'} hover:bg-indigo-500/10 transition-colors`}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={20} />
          </motion.button>
          <motion.button
            onClick={createNewChat}
            className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'} hover:bg-indigo-500/10 transition-colors`}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {!activeChat || activeChat.messages.length === 0 ? (
          <WelcomeScreen mode={mode} lang={settings.lang} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <AnimatePresence>
              {activeChat.messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onChipClick={handleChipClick}
                  isDark={isDark}
                  isRtl={isRtl}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input dock */}
      <div className="relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <InputDock 
          onSend={handleSend} 
          isStreaming={isStreaming} 
          mode={mode}
          isDark={isDark}
          placeholder={mode === 'instant' ? t.askAnything : t.describeGoal}
        />
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
        isDark={isDark}
        lang={settings.lang}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setLang={setLang}
        setTheme={setTheme}
        updateSettings={updateSettings}
        isDark={isDark}
      />

      {/* Streaming indicator */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
        >
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
            mode === 'planning'
              ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
          }`}>
            <motion.div
              className="w-2 h-2 rounded-full bg-current"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {mode === 'instant' ? t.generating : t.planningProgress}
          </div>
        </motion.div>
      )}
    </div>
  );
}

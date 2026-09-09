import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X, Clock } from 'lucide-react';
import { Chat } from '../types';
import { Lang, translations } from '../i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClearAll: () => void;
  isDark?: boolean;
  lang?: Lang;
}

export function Sidebar({ isOpen, onClose, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onClearAll, isDark = true, lang = 'ar' }: SidebarProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed ${isRtl ? 'left-0' : 'right-0'} top-0 bottom-0 w-72 z-50 flex flex-col ${
              isDark ? 'bg-cyber-dark/95 border-r border-white/5' : 'bg-white border-l border-gray-200'
            } backdrop-blur-xl`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'gradient-text' : 'text-indigo-600'}`}>{t.conversations}</h2>
              <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-white/5`}>
                <X size={20} />
              </button>
            </div>

            {/* New chat button */}
            <div className="p-3">
              <motion.button
                onClick={() => { onNewChat(); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  isDark 
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span className="text-sm font-medium">{t.newConversation}</span>
              </motion.button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {chats.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p>{t.noConversations}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map(chat => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        chat.id === activeChatId
                          ? isDark ? 'bg-indigo-500/15 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'
                          : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => { onSelectChat(chat.id); onClose(); }}
                    >
                      <MessageSquare size={16} className={chat.id === activeChatId ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-gray-500' : 'text-gray-400')} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${chat.id === activeChatId ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {new Date(chat.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {chats.length > 0 && (
              <div className={`p-3 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <button
                  onClick={onClearAll}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm ${isDark ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:text-red-600 hover:bg-red-50'} transition-colors`}
                >
                  <Trash2 size={14} />
                  {t.clearAll}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

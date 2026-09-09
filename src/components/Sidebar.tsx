import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X, Clock } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClearAll: () => void;
}

export function Sidebar({ isOpen, onClose, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onClearAll }: SidebarProps) {
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-cyber-dark/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-bold gradient-text">Conversations</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* New chat button */}
            <div className="p-3">
              <motion.button
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span className="text-sm font-medium">New Conversation</span>
              </motion.button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {chats.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map(chat => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        chat.id === activeChatId
                          ? 'bg-indigo-500/15 border border-indigo-500/20'
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => { onSelectChat(chat.id); onClose(); }}
                    >
                      <MessageSquare size={16} className={chat.id === activeChatId ? 'text-indigo-400' : 'text-gray-500'} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${chat.id === activeChatId ? 'text-white' : 'text-gray-300'}`}>
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-gray-600" />
                          <span className="text-[10px] text-gray-600">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
              <div className="p-3 border-t border-white/5">
                <button
                  onClick={onClearAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Image, FileText, X } from 'lucide-react';
import { Attachment } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface InputDockProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  mode: 'instant' | 'planning';
  isDark?: boolean;
  placeholder?: string;
}

export function InputDock({ onSend, isStreaming, mode, isDark = true, placeholder }: InputDockProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    if (isStreaming) return;
    
    onSend(text.trim());
    setText('');
    setAttachments([]);
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addAttachment = (type: Attachment['type']) => {
    const newAttachment: Attachment = {
      id: uuidv4(),
      type,
      name: type === 'image' ? 'photo.png' : type === 'document' ? 'document.pdf' : 'voice-note.mp3',
      size: Math.floor(Math.random() * 5000) + 500
    };
    setAttachments(prev => [...prev, newAttachment]);
    setShowAttachMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 pb-4">
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-2 mb-2 px-2 overflow-x-auto"
          >
            {attachments.map(att => (
              <div key={att.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap ${
                isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
              }`}>
                {att.type === 'image' && <Image size={12} />}
                {att.type === 'document' && <FileText size={12} />}
                {att.type === 'audio' && <Mic size={12} />}
                <span>{att.name}</span>
                <button onClick={() => removeAttachment(att.id)} className={`${isDark ? 'text-gray-500' : 'text-gray-400'} hover:text-red-400`}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input dock */}
      <div className={`input-dock flex items-end gap-2 px-4 py-3 ${
        isStreaming ? 'pulse-glow' : ''
      } ${mode === 'planning' ? 'border-emerald-500/20' : ''} ${
        !isDark ? 'bg-white/90 border-gray-200' : ''
      }`}>
        {/* Attach button */}
        <div className="relative">
          <motion.button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'} transition-colors`}
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip size={20} />
          </motion.button>

          {/* Attachment menu */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className={`absolute bottom-full left-0 mb-2 glass-card p-2 flex flex-col gap-1 min-w-[140px] ${
                  !isDark ? 'bg-white border-gray-200 shadow-xl' : ''
                }`}
              >
                <button
                  onClick={() => addAttachment('image')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  <Image size={16} className="text-indigo-400" /> Image
                </button>
                <button
                  onClick={() => addAttachment('document')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  <FileText size={16} className="text-violet-400" /> Document
                </button>
                <button
                  onClick={() => addAttachment('audio')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  <Mic size={16} className="text-emerald-400" /> Audio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (mode === 'instant' ? 'Ask anything... ⚡' : 'Describe your goal... 🎯')}
          className={`flex-1 bg-transparent text-sm resize-none outline-none min-h-[36px] max-h-[120px] py-1.5 ${
            isDark ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
          }`}
          rows={1}
          disabled={isStreaming}
        />

        {/* Send / Mic button */}
        {text.trim() || attachments.length > 0 ? (
          <motion.button
            onClick={handleSend}
            disabled={isStreaming}
            className={`p-2.5 rounded-xl transition-all ${
              isStreaming
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : mode === 'planning'
                  ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Send size={18} />
          </motion.button>
        ) : (
          <motion.button
            className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10' : 'bg-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'} transition-colors`}
            whileTap={{ scale: 0.9 }}
          >
            <Mic size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
}

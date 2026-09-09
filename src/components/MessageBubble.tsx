import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onChipClick?: (chip: string) => void;
}

function formatContent(content: string) {
  // Simple markdown-like formatting
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];

  lines.forEach((line, i) => {
    let processedLine = line;
    
    // Headers
    if (processedLine.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-white mt-3 mb-1">
          {processedLine.replace('### ', '')}
        </h3>
      );
      return;
    }
    if (processedLine.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-white mt-3 mb-1.5">
          {processedLine.replace('## ', '')}
        </h2>
      );
      return;
    }

    // Bold
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    
    // Blockquote
    if (processedLine.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-indigo-500/50 pl-3 my-2 text-gray-300 italic text-sm">
          <span dangerouslySetInnerHTML={{ __html: processedLine.replace('> ', '') }} />
        </blockquote>
      );
      return;
    }

    // Bullet points
    if (processedLine.startsWith('• ') || processedLine.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 text-sm">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: processedLine.replace(/^[•\-] /, '') }} />
        </div>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(processedLine)) {
      const match = processedLine.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2 my-0.5 text-sm">
            <span className="text-violet-400 font-mono text-xs mt-0.5">{match[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: match[2] }} />
          </div>
        );
        return;
      }
    }

    // Table rows
    if (processedLine.startsWith('|') && processedLine.endsWith('|')) {
      if (processedLine.includes('---')) return; // Skip separator
      const cells = processedLine.split('|').filter(c => c.trim());
      elements.push(
        <div key={i} className="flex gap-2 text-xs my-0.5 font-mono">
          {cells.map((cell, j) => (
            <span key={j} className="flex-1 text-gray-300 px-1">{cell.trim()}</span>
          ))}
        </div>
      );
      return;
    }

    // Planning progress indicator
    if (processedLine.includes('[📊')) {
      elements.push(
        <div key={i} className="flex items-center gap-2 my-2">
          <span className="text-sm font-medium text-emerald-400">{processedLine}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (processedLine.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Regular text
    elements.push(
      <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });

  return elements;
}

export function MessageBubble({ message, onChipClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
          : 'bg-gradient-to-br from-emerald-500 to-indigo-600'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Message content */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`${isUser ? 'bubble-user' : 'bubble-ai'} px-4 py-3`}>
          {isUser ? (
            <p className="text-sm text-gray-100 leading-relaxed">{message.content}</p>
          ) : (
            <div className={`${message.isStreaming ? 'streaming-cursor' : ''} text-gray-200`}>
              {formatContent(message.content)}
            </div>
          )}
        </div>

        {/* Planning Progress Bar */}
        {message.planningProgress !== undefined && message.planningProgress < 100 && (
          <div className="mt-2 w-full">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full progress-shimmer rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${message.planningProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Chips */}
        {message.chips && message.chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-3"
          >
            {message.chips.map((chip, i) => (
              <motion.button
                key={i}
                onClick={() => onChipClick?.(chip)}
                className="chip-option px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-600 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

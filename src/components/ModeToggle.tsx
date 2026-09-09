import { motion } from 'framer-motion';
import { Zap, Target } from 'lucide-react';
import { ChatMode } from '../types';

interface ModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle flex items-center gap-1 p-1">
      <motion.button
        onClick={() => onModeChange('instant')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          mode === 'instant'
            ? 'mode-toggle-active text-white shadow-lg'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <Zap size={16} className={mode === 'instant' ? 'text-yellow-400' : ''} />
        <span className="hidden sm:inline">Instant</span>
        <span className="sm:hidden">⚡</span>
      </motion.button>

      <motion.button
        onClick={() => onModeChange('planning')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          mode === 'planning'
            ? 'mode-toggle-planning text-white shadow-lg'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <Target size={16} className={mode === 'planning' ? 'text-emerald-400' : ''} />
        <span className="hidden sm:inline">Planning</span>
        <span className="sm:hidden">🎯</span>
      </motion.button>
    </div>
  );
}

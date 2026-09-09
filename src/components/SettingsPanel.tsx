import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Moon, Sun, Key, Shield, Cpu, Check } from 'lucide-react';
import { AppSettings } from '../hooks/useSettings';
import { Lang, translations } from '../i18n';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setLang: (lang: Lang) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  isDark: boolean;
}

export function SettingsPanel({ isOpen, onClose, settings, setLang, setTheme, updateSettings, isDark }: SettingsPanelProps) {
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey);
  const [saved, setSaved] = useState(false);
  const t = translations[settings.lang];
  const isRtl = settings.lang === 'ar';

  const handleSaveApiKey = () => {
    updateSettings({ apiKey: apiKeyInput });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

          {/* Panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed ${isRtl ? 'left-0' : 'right-0'} top-0 bottom-0 w-80 max-w-[85vw] z-50 flex flex-col ${
              isDark ? 'bg-cyber-dark/95 border-l border-white/5' : 'bg-white border-l border-gray-200'
            } backdrop-blur-xl`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'gradient-text' : 'text-indigo-600'}`}>{t.settings}</h2>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-white/5`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.language}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLang('ar')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.lang === 'ar'
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                        : isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.lang === 'en'
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                        : isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isDark ? <Moon size={16} className="text-violet-400" /> : <Sun size={16} className="text-amber-500" />}
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.theme}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                        : isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Moon size={16} />
                    {t.darkMode}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.theme === 'light'
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Sun size={16} />
                    {t.lightMode}
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key size={16} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.apiKey}</h3>
                </div>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
                    }`}
                  />
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t.apiKeyHelp}
                  </p>
                  <motion.button
                    onClick={handleSaveApiKey}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      saved
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saved ? <Check size={16} /> : null}
                    {saved ? t.saved : t.save}
                  </motion.button>
                </div>
              </div>

              {/* Model Info */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.model}</span>
                </div>
                <p className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.modelDesc}</p>
              </div>

              {/* Privacy */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.privacy}</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.privacyDesc}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

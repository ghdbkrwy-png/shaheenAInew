import { useLocalStorage } from './useLocalStorage';
import { Lang } from '../i18n';

export interface AppSettings {
  lang: Lang;
  theme: 'dark' | 'light';
  apiKey: string;
}

const defaultSettings: AppSettings = {
  lang: 'ar',
  theme: 'dark',
  apiKey: ''
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('novamind-settings', defaultSettings);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const setLang = (lang: Lang) => updateSettings({ lang });
  const setTheme = (theme: 'dark' | 'light') => updateSettings({ theme });
  const setApiKey = (apiKey: string) => updateSettings({ apiKey });

  return { settings, updateSettings, setLang, setTheme, setApiKey };
}

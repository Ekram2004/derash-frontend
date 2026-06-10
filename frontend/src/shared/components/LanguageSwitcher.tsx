import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Oromo', flag: '🇪🇹' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeLanguage = async (langCode: string) => {
    if (langCode === i18n.language) {
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Change locally immediately so the UI changes instantly
      await i18n.changeLanguage(langCode);
      setIsOpen(false);
      
      // 2. Sync to backend settings database
      await api.patch('/user/settings', { language: langCode });
    } catch (error) {
      console.error('Failed to sync language selection to server:', error);
      // Optional: alert user or handle fallback silently
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLang.flag} {currentLang.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                i18n.language === lang.code ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''
              }`}
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

export default function LanguageLoader() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const res = await api.get('/user/settings');
        if (res.data?.status === 'SUCCESS') {
          const savedLang = res.data.data.language;
          if (savedLang && savedLang !== i18n.language) {
            await i18n.changeLanguage(savedLang);
          }
        }
      } catch (error) {
        console.error('Failed to load language', error);
      }
    };
    loadLanguage();
  }, [i18n]);

  return null;
}
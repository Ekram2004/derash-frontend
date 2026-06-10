import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

export default function LanguageLoader() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // FIX 1: If we are already on the login page, STOP running the check
    if (window.location.pathname === '/login') {
      return;
    }

    const loadLanguage = async () => {
      try {
        const res = await api.get('/user/settings');
        if (res.data?.status === 'SUCCESS') {
          const savedLang = res.data.data.language;
          if (savedLang && savedLang !== i18n.language) {
            await i18n.changeLanguage(savedLang);
          }
        }
      } catch (error: any) {
        console.error('Failed to load language', error);

        // FIX 2: Only redirect if we are not already going to /login
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    };
    
    loadLanguage();
  }, [i18n]);

  return null;
}
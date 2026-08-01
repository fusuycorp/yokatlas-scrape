import React, { createContext, useContext, useState } from 'react';
import { tr } from '../locales/tr';
import { en } from '../locales/en';

const translations = { tr, en };
const STORAGE_KEY = 'uniatlas_language';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && (saved === 'tr' || saved === 'en') ? saved : 'tr';
  });

  const setLanguage = (lang) => {
    if (lang === 'tr' || lang === 'en') {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'tr' ? 'en' : 'tr';
    setLanguage(nextLang);
  };

  const t = (key, params = {}) => {
    const currentDict = translations[language] || translations.tr;
    const fallbackDict = translations.tr;

    const resolve = (obj, path) =>
      path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);

    let val = resolve(currentDict, key);
    if (val === undefined) {
      val = resolve(fallbackDict, key);
    }
    if (val === undefined) {
      val = key;
    }

    if (typeof val === 'string' && params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        val = val.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      });
    }

    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

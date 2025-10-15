import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { translations } from '../utils/translations.ts';
import { type LocalizedString } from '../types.ts';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string>) => string;
  lt: (text: LocalizedString | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('he');
  const [direction, setDirection] = useState<Direction>('rtl');

  useEffect(() => {
    const storedLang = localStorage.getItem('gem_share_lang') as Language;
    if (storedLang && ['en', 'he'].includes(storedLang)) {
        setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    const newDirection = language === 'he' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.lang = language;
    document.documentElement.dir = newDirection;
    localStorage.setItem('gem_share_lang', language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'he' ? 'en' : 'he'));
  }, []);

  const t = useCallback((key: string, params: Record<string, string> = {}): string => {
    const langDict = translations[language as keyof typeof translations];
    let translation = langDict[key as keyof typeof langDict] || key;

    Object.keys(params).forEach(paramKey => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
    });
    return translation;
  }, [language]);

  const lt = useCallback((text: LocalizedString | string): string => {
    if (typeof text === 'string') return text;
    if (!text) return '';
    return text[language] || text.en || ''; // Fallback to english if current lang is not available
  }, [language]);

  const value = { language, direction, toggleLanguage, t, lt };

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
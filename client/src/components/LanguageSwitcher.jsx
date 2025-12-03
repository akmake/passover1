import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="font-mono tracking-widest">
      {currentLanguage === 'he' ? 'EN' : 'עב'}
    </Button>
  );
};

export default LanguageSwitcher;
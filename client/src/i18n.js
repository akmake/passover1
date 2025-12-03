import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // טוען תרגומים מהשרת
  .use(LanguageDetector) // מזהה את שפת המשתמש
  .use(initReactI18next) // מחבר את i18next ל-React
  .init({
    supportedLngs: ['he', 'en'], // השפות הנתמכות
    fallbackLng: 'he', // שפת ברירת מחדל אם הזיהוי נכשל
    detection: {
      order: ['cookie', 'localStorage', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // הנתיב לקבצי התרגום
    },
    interpolation: {
      escapeValue: false, // נדרש עבור React
    },
    react: {
      useSuspense: true, // מאפשר טעינה אסינכרונית של תרגומים
    },
  });

export default i18n;
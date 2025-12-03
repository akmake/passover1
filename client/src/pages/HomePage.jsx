import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next'; // <-- השורה הזו נוספה


const HeroSection = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (content.mode === 'slideshow' && content.slides?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % content.slides.length);
      }, (content.slideshowInterval || 5) * 1000);
      return () => clearInterval(interval);
    }
  }, [content]);

  const currentSlide = content.slides?.[currentIndex] || {};
  const heroUrl = currentSlide.image;
  const heroHeight = content.height || 75;

  return (
    <div className="relative w-full bg-center bg-cover flex items-center justify-center text-center text-white"
      style={{
          backgroundImage: heroUrl ? `url("${heroUrl}")` : 'none',
          backgroundColor: '#333',
          minHeight: `${heroHeight}vh`
      }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentSlide.headline) }} />
        <div className="mt-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentSlide.subheadline) }} />
        <Button asChild size="lg" className="mt-8"><Link to="/menu">לתפריט המלא</Link></Button>
      </div>
    </div>
  );
};

const RichTextSection = ({ content }) => (
    <div className="max-w-4xl mx-auto px-4 text-center">
        {/* תיקון: הוספת חיטוי אבטחה */}
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.title) }} />
        <div className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.text) }} />
    </div>
);

const ImageWithTextSection = ({ content }) => {
    const imageUrl = content.image;
    return (
        <div className="relative bg-cover bg-center text-white flex items-center justify-center w-full"
             style={{ backgroundImage: `url(${imageUrl})`, minHeight: `${content.height || 500}px` }}>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 container mx-auto px-6 text-center">
                 {/* תיקון: הוספת חיטוי אבטחה */}
                 <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.title) }} />
                 <div className="mt-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.text) }} />
                 {content.buttonText && content.buttonLink && (
                    <Button asChild size="lg" className="mt-8">
                        <Link to={content.buttonLink}>{content.buttonLink.startsWith('http') ? '_blank' : '_self'}{content.buttonText}</Link>
                    </Button>
                 )}
            </div>
        </div>
    );
};

const CategoryGridSection = ({ content }) => {
    // 2. הפעלת ה-hook כדי לקבל את השפה הנוכחית
    const { i18n } = useTranslation();
    const currentLang = i18n.language; // 'he' or 'en'

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['publicCategories'],
        queryFn: async () => (await api.get('/api/categories')).data
    });

    if (isLoading) return <LoaderCircle className="mx-auto animate-spin" />;
    if (isError || !categories) return <p className="text-center text-red-500">שגיאה בטעינת הקטגוריות.</p>;
    
    return (
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                 <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.title || '<h2>הקטגוריות שלנו</h2>') }} />
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {categories.map(cat => {
                    // 3. בחירה דינמית של שם הקטגוריה להצגה
                    const displayName = cat.name?.[currentLang] || cat.name?.he;

                    return (
                        <Link
                            key={cat.key}
                            to={`/menu#${cat.key}`}
                            className="group relative block aspect-[4/3] w-full rounded-lg overflow-hidden shadow-lg"
                        >
                            <img
                                src={cat.image || 'https://via.placeholder.com/400x300'}
                                alt={displayName} // שימוש בשם המתורגם עבור alt
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white text-xl md:text-2xl font-bold text-center drop-shadow-md">
                                    {displayName} {/* <-- הצגת השם הנכון במקום האובייקט */}
                                </h3>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
const FeaturesSection = ({ content }) => null;

const sectionComponents = {
    hero: HeroSection,
    richText: RichTextSection,
    categoryGrid: CategoryGridSection,
    features: FeaturesSection,
    imageWithText: ImageWithTextSection
};

export default function HomePage() {
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['homepageSettings'],
    queryFn: async () => (await api.get('/api/homepage-settings')).data
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoaderCircle className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (isError || !settings?.sections) return <div className="text-center text-red-600 p-10">שגיאה בטעינת מבנה דף הבית.</div>;

  return (
    <div className="w-full">
      {settings.sections.map((section) => {
        const Component = sectionComponents[section.type];
        if (!Component) return null;

        const backgroundColor = section.content?.backgroundColor;

        if (section.type === 'hero' || section.type === 'imageWithText') {
             return <Component key={section._id} content={section.content} />;
        }

        const minHeight = section.content?.height;

        return (
            <section
                key={section._id}
                className="flex items-center justify-center"
                style={{
                    backgroundColor: backgroundColor,
                    minHeight: minHeight ? `${minHeight}px` : undefined,
                }}
            >
                <div className="w-full py-12 px-4">
                    <Component content={section.content} />
                </div>
            </section>
        );
      })}
    </div>
  );
}
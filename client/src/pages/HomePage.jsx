// client/src/pages/HomePage.jsx
// Aesop-inspired design with Alei Zahav colors

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// API calls
const fetchHomeConfig = async () => {
  const { data } = await api.get('/api/homepage');
  return data;
};

const fetchProducts = async () => {
  const { data } = await api.get('/api/products');
  return data;
};

const fetchCategories = async () => {
  const { data } = await api.get('/api/categories');
  return data;
};

const HomePage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const lang = i18n.language;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Fetch data
  const { data: homeConfig } = useQuery({
    queryKey: ['homeConfig'],
    queryFn: fetchHomeConfig,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Helper to get localized text
  const getText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return lang === 'he' ? (obj.he || obj.en || '') : (obj.en || obj.he || '');
  };

  // Hero slides
  const slides = homeConfig?.hero?.slides || [];
  const heroInterval = homeConfig?.hero?.interval || 5;

  // Auto-rotate hero
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, heroInterval * 1000);
    return () => clearInterval(timer);
  }, [slides.length, heroInterval]);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 100);
  }, []);

  // Featured products
  const featuredProducts = homeConfig?.featured?.productIds || [];
  const popularProducts = products?.filter(p => p.isPopular) || [];
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : popularProducts.slice(0, 4);

  // Navigation
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div 
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: '#F6F5F0' }}
    >
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative" style={{ height: `${homeConfig?.hero?.height || 90}vh`, minHeight: '500px' }}>
        {/* Slides */}
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {slide.type === 'video' ? (
                <video
                  src={slide.url}
                  poster={slide.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.url}
                  alt={slide.title || ''}
                  className="w-full h-full object-cover"
                  onLoad={() => index === 0 && setHeroLoaded(true)}
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))
        ) : (
          // Default hero if no slides configured
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop"
              alt="Alei Zahav"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Hero Content */}
        <div 
          className={`absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6 transition-all duration-1000 ${
            heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl text-white mb-6 max-w-4xl leading-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400 }}
          >
            {slides[currentSlide]?.title || (isRTL ? 'עלי זהב' : 'Alei Zahav')}
          </h1>
          
          {(slides[currentSlide]?.subtitle || !slides.length) && (
            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl" style={{ fontFamily: 'Georgia, serif' }}>
              {slides[currentSlide]?.subtitle || (isRTL ? 'מארזי מתנות יוקרתיים' : 'Luxury Gift Collections')}
            </p>
          )}

          {(slides[currentSlide]?.buttonText || !slides.length) && (
            <Link
              to={slides[currentSlide]?.link || '/menu'}
              className="inline-block border border-white text-white px-10 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-neutral-900 transition-all duration-300"
              style={{ letterSpacing: '0.2em' }}
            >
              {slides[currentSlide]?.buttonText || (isRTL ? 'לקולקציה' : 'Explore')}
            </Link>
          )}
        </div>

        {/* Slide Navigation */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Next"
            >
              <ArrowRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===================== INTRO TEXT ===================== */}
      <section className="py-24 px-6" style={{ backgroundColor: '#F6F5F0' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p 
            className="text-2xl md:text-3xl leading-relaxed"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: '#333',
              fontWeight: 400
            }}
          >
            {isRTL 
              ? 'אנו מאמינים שכל מתנה היא הזדמנות ליצור רגע בלתי נשכח. מהבחירה הראשונה ועד הפתיחה — כל פרט מעוצב בקפידה.'
              : 'We believe every gift is an opportunity to create an unforgettable moment. From the first choice to the unwrapping — every detail is carefully crafted.'}
          </p>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      {categories && categories.length > 0 && (
        <section className="px-6 pb-24" style={{ backgroundColor: '#F6F5F0' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {(homeConfig?.categories?.length > 0 ? homeConfig.categories : categories.slice(0, 3)).map((cat, index) => (
                <Link
                  key={cat._id || index}
                  to={cat.link || `/menu?category=${cat.key || cat._id}`}
                  className="group block relative overflow-hidden"
                  style={{ aspectRatio: '4/5' }}
                >
                  {/* Image */}
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800'}
                    alt={getText(cat.name) || cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 
                      className="text-white text-2xl md:text-3xl mb-2"
                      style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
                    >
                      {cat.hebrewTitle || getText(cat.name) || cat.title}
                    </h3>
                    {cat.subtitle && (
                      <p className="text-white/80 text-sm">{cat.subtitle}</p>
                    )}
                    
                    <span 
                      className="inline-block mt-4 text-white text-sm border-b border-white/50 pb-1 group-hover:border-white transition-colors"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {isRTL ? 'גלה עוד' : 'Discover'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FEATURED PRODUCTS ===================== */}
      {displayProducts.length > 0 && (
        <section className="py-24 px-6" style={{ backgroundColor: '#EEEDE8' }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 
                className="text-3xl md:text-4xl mb-4"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: '#333',
                  fontWeight: 400
                }}
              >
                {isRTL ? 'הקולקציה שלנו' : 'Our Collection'}
              </h2>
              <p className="text-neutral-600">
                {isRTL ? 'מארזים נבחרים בקפידה' : 'Carefully curated selections'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((product, index) => (
                <Link
                  key={product._id || index}
                  to={`/product/${product._id}`}
                  className="group block"
                >
                  {/* Image */}
                  <div 
                    className="relative overflow-hidden mb-6"
                    style={{ aspectRatio: '1/1', backgroundColor: '#E8E6DF' }}
                  >
                    <img
                      src={product.image}
                      alt={getText(product.name)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Info */}
                  <h3 
                    className="text-lg mb-2 group-hover:text-amber-800 transition-colors"
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      color: '#333',
                      fontWeight: 400
                    }}
                  >
                    {getText(product.name)}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-2">
                    {getText(product.description)?.substring(0, 60)}...
                  </p>
                  <p 
                    className="text-lg"
                    style={{ color: '#8B7355' }}
                  >
                    ₪{product.price}
                  </p>
                </Link>
              ))}
            </div>

            {/* View All */}
            <div className="text-center mt-16">
              <Link
                to="/menu"
                className="inline-block border border-neutral-800 text-neutral-800 px-10 py-4 text-sm tracking-widest uppercase hover:bg-neutral-800 hover:text-white transition-all duration-300"
                style={{ letterSpacing: '0.15em' }}
              >
                {isRTL ? 'לכל המוצרים' : 'View All Products'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== BESPOKE SECTION ===================== */}
      <section className="grid lg:grid-cols-2">
        {/* Image */}
        <div className="relative h-[60vh] lg:h-auto overflow-hidden order-2 lg:order-1">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            alt="Bespoke"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div 
          className="flex flex-col justify-center px-12 lg:px-20 py-20 order-1 lg:order-2"
          style={{ backgroundColor: '#4A4238' }}
        >
          <span 
            className="text-sm tracking-widest uppercase mb-6"
            style={{ color: '#C9A962', letterSpacing: '0.2em' }}
          >
            {isRTL ? 'שירות אישי' : 'Bespoke Service'}
          </span>
          
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl text-white mb-8 leading-tight"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            {isRTL ? 'מארז בהתאמה אישית' : 'Custom Curated Gifts'}
          </h2>
          
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
            {isRTL
              ? 'ספרו לנו את הסיפור שלכם ואנחנו ניצור מארז מתנה ייחודי — בדיוק כפי שדמיינתם.'
              : 'Tell us your story and we will create a unique gift box — exactly as you imagined.'}
          </p>

          <Link
            to="/package-builder"
            className="inline-block self-start border border-white text-white px-10 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-neutral-900 transition-all duration-300"
            style={{ letterSpacing: '0.15em' }}
          >
            {isRTL ? 'התחילו עכשיו' : 'Start Creating'}
          </Link>
        </div>
      </section>

      {/* ===================== QUOTE / PHILOSOPHY ===================== */}
      <section className="py-32 px-6" style={{ backgroundColor: '#F6F5F0' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p 
            className="text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-8"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: '#333',
              fontWeight: 400,
              fontStyle: 'italic'
            }}
          >
            {isRTL 
              ? '"הפרטים הקטנים הם לא רק פרטים. הם מה שיוצר את העיצוב."'
              : '"The details are not just details. They make the design."'}
          </p>
          <span className="text-neutral-500 text-sm tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
            Charles Eames
          </span>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section className="py-20 px-6 border-t" style={{ backgroundColor: '#EEEDE8', borderColor: '#E0DED6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              {
                title: isRTL ? 'אריזה יוקרתית' : 'Luxury Packaging',
                desc: isRTL ? 'כל מארז נארז בקפידה' : 'Every box carefully wrapped'
              },
              {
                title: isRTL ? 'משלוח לכל הארץ' : 'Nationwide Delivery',
                desc: isRTL ? 'עד הדלת בתוך 3-5 ימים' : 'To your door in 3-5 days'
              },
              {
                title: isRTL ? 'שירות אישי' : 'Personal Service',
                desc: isRTL ? 'צוות מקצועי לכל שאלה' : 'Expert team for any question'
              }
            ].map((service, i) => (
              <div key={i}>
                <h3 
                  className="text-lg mb-3"
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    color: '#333',
                    fontWeight: 400
                  }}
                >
                  {service.title}
                </h3>
                <p className="text-neutral-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== NEWSLETTER ===================== */}
      <section className="py-20 px-6" style={{ backgroundColor: '#333' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h3 
            className="text-2xl text-white mb-4"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}
          >
            {isRTL ? 'הישארו מעודכנים' : 'Stay Updated'}
          </h3>
          <p className="text-white/60 mb-8 text-sm">
            {isRTL 
              ? 'הרשמו לניוזלטר וקבלו 10% הנחה על ההזמנה הראשונה'
              : 'Subscribe to our newsletter and receive 10% off your first order'}
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={isRTL ? 'כתובת אימייל' : 'Email address'}
              className="flex-1 bg-transparent border border-white/30 px-6 py-4 text-white placeholder-white/50 focus:border-white focus:outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              className="border border-white text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-neutral-900 transition-all duration-300"
              style={{ letterSpacing: '0.1em' }}
            >
              {isRTL ? 'הרשמה' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
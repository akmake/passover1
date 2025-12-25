import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { toAbsoluteUrl } from '@/utils/url';
import { LoaderCircle } from 'lucide-react';

// --- עיצוב בסיס (כמו אצלך) ---
const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@200;300;400&display=swap');

      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
    `}
  </style>
);

const fetchHomepageSettings = async () =>
  (await api.get('/api/homepage-settings', { withCredentials: true })).data;

function HeroSection({ content }) {
  const heightVh = Number(content?.height || 75);
  const intervalSec = Math.max(1, Number(content?.slideshowInterval || 5));
  const slides = Array.isArray(content?.slides) ? content.slides : [];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), intervalSec * 1000);
    return () => clearInterval(id);
  }, [slides.length, intervalSec]);

  // אם אין slides בכלל — זה אומר שהמנהל עוד לא הגדיר, אז לא מציגים כלום
  if (slides.length === 0) return null;

  const slide = slides[Math.min(active, slides.length - 1)];
  const bgVideo = toAbsoluteUrl(slide?.video);
  const bgImage = toAbsoluteUrl(slide?.image);

  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: `${heightVh}vh` }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />

        {bgVideo ? (
          <video className="w-full h-full object-cover opacity-80" autoPlay loop muted playsInline>
            <source src={bgVideo} type="video/mp4" />
          </video>
        ) : bgImage ? (
          <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </div>

      <div className="relative z-20 text-center px-6 border-y border-[#D4AF37]/30 py-12 backdrop-blur-sm bg-black/30 max-w-4xl mx-auto">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <h2 className="font-cinzel text-[#D4AF37] tracking-[0.5em] text-sm md:text-xl mb-6">
            EST. 2024 • ISRAEL
          </h2>

          <div
            className="font-playfair text-5xl md:text-7xl lg:text-9xl text-white mb-4 leading-none"
            dangerouslySetInnerHTML={{ __html: slide?.headline || '' }}
          />

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
            <Link
              to="/menu"
              className="group relative px-10 py-4 overflow-hidden border border-[#D4AF37] text-[#D4AF37] transition-all hover:text-black"
            >
              <span className="absolute inset-0 w-full h-full bg-[#D4AF37] transform -translate-x-full transition-transform duration-500 group-hover:translate-x-0" />
              <span className="relative z-10 font-cinzel tracking-widest font-bold">Explore Collection</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#D4AF37]/60 text-xs tracking-[0.3em] flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.9 }}
      >
        <span>SCROLL TO DISCOVER</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
      </motion.div>
    </section>
  );
}

function RichTextSection({ content }) {
  return (
    <section className="bg-[#0F0F0F] py-16 border-t border-white/5 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {content?.title ? (
          <div dangerouslySetInnerHTML={{ __html: content.title }} className="font-playfair text-3xl md:text-4xl text-white" />
        ) : null}
        {content?.text ? (
          <div dangerouslySetInnerHTML={{ __html: content.text }} className="mt-6 font-montserrat text-gray-300 leading-8" />
        ) : null}
      </div>
    </section>
  );
}

function ImageWithTextSection({ content }) {
  const img = toAbsoluteUrl(content?.image);
  const minHeight = Number(content?.height || 500);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 border-t border-white/5" style={{ minHeight }}>
      <div className="relative overflow-hidden min-h-[320px]">
        {img ? (
          <>
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </div>

      <div className="bg-[#050505] flex flex-col justify-center p-12 lg:p-24 relative text-right">
        <div className="absolute top-10 bottom-10 left-10 right-10 border border-[#D4AF37]/20 pointer-events-none hidden md:block" />
        {content?.title ? <div dangerouslySetInnerHTML={{ __html: content.title }} className="font-playfair text-4xl lg:text-6xl text-white" /> : null}
        {content?.text ? <div dangerouslySetInnerHTML={{ __html: content.text }} className="mt-6 font-montserrat text-gray-400 leading-8" /> : null}

        {content?.buttonText && content?.buttonLink ? (
          <Link to={content.buttonLink} className="mt-10 inline-block border-b border-[#D4AF37] text-[#D4AF37] pb-2 text-sm tracking-[0.3em] hover:text-white hover:border-white transition-all w-max">
            {content.buttonText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['homepageSettingsPublic'],
    queryFn: fetchHomepageSettings,
  });

  const sections = useMemo(() => (Array.isArray(settings?.sections) ? settings.sections : []), [settings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <LoaderCircle className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/80 px-6 text-center">
        לא ניתן לטעון את דף הבית כרגע.
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-[#E5E5E5] overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <FontsInjection />

      {/* מציגים אך ורק מה שהמנהל הגדיר */}
      {sections.length === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center text-white/60 font-montserrat">
          אין תוכן בדף הבית. הוסף בלוקים דרך פאנל הניהול.
        </div>
      ) : (
        sections.map((section, idx) => {
          if (!section?.type) return null;

          switch (section.type) {
            case 'hero':
              return <HeroSection key={`hero-${idx}`} content={section.content} />;
            case 'richText':
              return <RichTextSection key={`rt-${idx}`} content={section.content} />;
            case 'imageWithText':
              return <ImageWithTextSection key={`iwt-${idx}`} content={section.content} />;
            default:
              return null; // בלוקים אחרים תוכל להוסיף אחר כך
          }
        })
      )}
    </div>
  );
}

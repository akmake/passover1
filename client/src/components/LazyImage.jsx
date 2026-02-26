// client/src/components/LazyImage.jsx
// רכיב תמונה עם lazy loading, placeholder, ו-fade-in אנימציה

import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholderClassName = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // מתחיל לטעון 200px לפני שנכנס ל-viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Placeholder shimmer */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${placeholderClassName}`}
        />
      )}
      
      {/* התמונה עצמה - נטענת רק כשנכנסת ל-viewport */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // מסיר shimmer גם בשגיאה
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default LazyImage;

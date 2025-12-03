import { X } from 'lucide-react';
import { useState } from 'react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-center relative z-50 text-sm md:text-base font-medium">
      <div className="container mx-auto flex items-center justify-center">
        <span>
          📞 להזמנות חייגו: <a href="tel:*3044" className="text-amber-400 hover:underline font-bold">*3044</a> | 
          משלוחים לרוב חלקי הארץ | 
          <span className="hidden sm:inline"> הזמנות לפסח יתקבלו עד יום ראשון ח' בניסן</span>
        </span>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
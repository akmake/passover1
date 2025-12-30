import React, { useState, useEffect, useMemo } from 'react';
import api from '@/api';
import { Save, Upload, Check, Loader2, Image as ImageIcon, Video, Trash2, Plus, Monitor, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// --- תיקון: שימוש בנתיב הנכון לספרייה החדשה ---
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

// --- הגדרת פונטים וכלים לעורך הטקסט ---
const Font = Quill.import('formats/font');
// אלו הפונטים שיהיו זמינים לך (חשוב שיהיו גם בקובץ CSS הראשי שלך)
Font.whitelist = ['miriam', 'rubik', 'heebo', 'assistant', 'frank-ruhl', 'cinzel', 'montserrat', 'sans-serif'];
Quill.register(Font, true);

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'font': Font.whitelist }], // רשימת הפונטים שהגדרנו
    [{ 'size': ['small', false, 'large', 'huge'] }], // גודל טקסט
    ['bold', 'italic', 'underline', 'strike'], // עיצובים
    [{ 'color': [] }, { 'background': [] }], // צבע טקסט ורקע
    [{ 'align': [] }, { 'direction': 'rtl' }], // יישור וכיוון RTL
    ['clean'] // ניקוי עיצוב
  ],
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align', 'direction'
];

// --- הזרקת CSS לפונטים בתוך העורך ---
const EditorStyles = () => (
  <style>{`
    .ql-snow .ql-picker.ql-font .ql-picker-label::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item::before { content: 'ברירת מחדל'; }
    .ql-font-rubik { font-family: 'Rubik', sans-serif; }
    .ql-font-heebo { font-family: 'Heebo', sans-serif; }
    .ql-font-assistant { font-family: 'Assistant', sans-serif; }
    .ql-font-cinzel { font-family: 'Cinzel', serif; }
    .ql-font-montserrat { font-family: 'Montserrat', sans-serif; }
    
    /* שמות לפונטים בתפריט */
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="rubik"]::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="rubik"]::before { content: 'Rubik (עברית)'; }
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="heebo"]::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="heebo"]::before { content: 'Heebo (עברית)'; }
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="assistant"]::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="assistant"]::before { content: 'Assistant (עברית)'; }
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="cinzel"]::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="cinzel"]::before { content: 'Cinzel (יוקרתי)'; }
    
    /* הגדרת גובה לעורך */
    .ql-container { min-height: 150px; font-family: 'Assistant', sans-serif; font-size: 16px; }
    .ql-editor { text-align: right; direction: rtl; }
  `}</style>
);

// --- פונקציות עזר ---
const getName = (nameObj) => {
  if (!nameObj) return 'מוצר ללא שם';
  if (typeof nameObj === 'string') return nameObj;
  return nameObj.he || nameObj.en || nameObj.name || '';
};

const getCategoryName = (catObj) => {
    if (!catObj) return 'כללי';
    if (typeof catObj === 'string') return catObj;
    return catObj.name?.he || catObj.name?.en || catObj.he || catObj.en || 'כללי';
};

// --- קומפוננטת המודל לעריכת טקסט ---
const TextEditorModal = ({ isOpen, onClose, initialValue, onSave, label }) => {
    const [value, setValue] = useState(initialValue || '');

    useEffect(() => {
        setValue(initialValue || '');
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-gray-800">עריכת טקסט: {label}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                    <EditorStyles />
                    <ReactQuill 
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="כתוב כאן את הטקסט שלך..."
                    />
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>ביטול</Button>
                    <Button onClick={() => { onSave(value); onClose(); }} className="bg-[#D4AF37] text-black font-bold">
                        <Check size={16} className="ml-2"/> אשר ועדכן
                    </Button>
                </div>
            </div>
        </div>
    );
};

const HomePageManage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null); 
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]); // רשימת קטגוריות לבחירה

  // סטייט למודל העריכה
  const [editorState, setEditorState] = useState({
      isOpen: false,
      section: null, 
      index: null,
      field: null,
      value: '',
      label: ''
  });
  
  // מבנה הנתונים
  const [formData, setFormData] = useState({
    hero: {
        height: 95,
        interval: 5,
        slides: [] 
    },
    categories: [
       { title: '', hebrewTitle: '', subtitle: '', image: '', link: '' },
       { title: '', hebrewTitle: '', subtitle: '', image: '', link: '' },
       { title: '', hebrewTitle: '', subtitle: '', image: '', link: '' },
    ],
    featured: {
      productIds: [],
      rotationSpeed: 5
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/api/homepage'),
        api.get('/api/products?limit=300'),
        api.get('/api/categories') 
      ]);

      if (configRes.data) {
          const loadedCategories = configRes.data.categories || [];
          while (loadedCategories.length < 3) {
              loadedCategories.push({ title: '', hebrewTitle: '', subtitle: '', image: '', link: '' });
          }
          
          const selectedIds = configRes.data.featured?.productIds.map(p => p._id || p) || [];
          
          const loadedHero = configRes.data.hero || {};
          if (!loadedHero.slides) loadedHero.slides = [];
          if (!loadedHero.height) loadedHero.height = 95;
          if (!loadedHero.interval) loadedHero.interval = 5;

          setFormData({
            hero: loadedHero,
            categories: loadedCategories,
            featured: {
              rotationSpeed: configRes.data.featured?.rotationSpeed || 5,
              productIds: selectedIds
            }
          });
      }
      
      setAllProducts(productsRes.data.products || productsRes.data || []);
      setCategoriesList(categoriesRes.data || []); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- פתיחת עורך הטקסט ---
  const openEditor = (section, index, field, currentValue, label) => {
      setEditorState({
          isOpen: true,
          section, // 'hero' או 'category'
          index,
          field,
          value: currentValue,
          label
      });
  };

  // --- שמירת טקסט מהעורך ---
  const handleEditorSave = (newValue) => {
      const { section, index, field } = editorState;
      
      if (section === 'hero') {
          const newSlides = [...formData.hero.slides];
          newSlides[index] = { ...newSlides[index], [field]: newValue };
          setFormData(prev => ({ ...prev, hero: { ...prev.hero, slides: newSlides } }));
      } else if (section === 'category') {
          const newCategories = [...formData.categories];
          newCategories[index] = { ...newCategories[index], [field]: newValue };
          setFormData(prev => ({ ...prev, categories: newCategories }));
      }
  };

  // --- Hero Slider Logic ---

  const handleAddSlide = () => {
      setFormData(prev => ({
          ...prev,
          hero: {
              ...prev.hero,
              slides: [...prev.hero.slides, { 
                  type: 'image', 
                  url: '', 
                  topText: 'EST. 2024', 
                  title: 'ALI ZAHAV', 
                  subtitle: 'The Art of Celebration', 
                  buttonText: 'Explore Collection', 
                  link: '/menu' 
              }]
          }
      }));
  };

  const handleRemoveSlide = (index) => {
      if(!window.confirm("למחוק את השקופית הזו?")) return;
      const newSlides = [...formData.hero.slides];
      newSlides.splice(index, 1);
      setFormData(prev => ({ ...prev, hero: { ...prev.hero, slides: newSlides } }));
  };

  const handleSlideChange = (index, field, value) => {
      const newSlides = [...formData.hero.slides];
      newSlides[index] = { ...newSlides[index], [field]: value };
      setFormData(prev => ({ ...prev, hero: { ...prev.hero, slides: newSlides } }));
  };

  const handleHeroSettingChange = (field, value) => {
      setFormData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const handleHeroUpload = async (file, index, fileType) => {
      if (!file) return;
      if (fileType === 'video' && file.size > 50 * 1024 * 1024) {
          alert("הקובץ גדול מדי (מקסימום 50MB לוידאו)");
          return;
      }

      const fd = new FormData();
      const serverField = fileType === 'video' ? 'video' : 'image'; 
      fd.append(serverField, file);

      try {
          setUploadingId(index);
          const { data } = await api.post('/api/upload', fd, { withCredentials: true });
          const url = fileType === 'video' ? data.videoUrl : (data.imageUrl || data.images?.[0]);
          if (!url) throw new Error("Upload failed");

          const newSlides = [...formData.hero.slides];
          newSlides[index].url = url;
          newSlides[index].type = fileType;
          
          setFormData(prev => ({ ...prev, hero: { ...prev.hero, slides: newSlides } }));
      } catch (error) {
          alert('שגיאה בהעלאה: ' + (error.response?.data?.message || error.message));
      } finally {
          setUploadingId(null);
      }
  };

  // --- Categories Logic ---
  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleCategoryImageUpload = async (file, index) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);

    try {
      const { data } = await api.post('/api/upload', fd, { withCredentials: true });
      const url = data.imageUrl || data.images?.[0];
      handleCategoryChange(index, 'image', url);
    } catch (error) {
      alert('שגיאה בהעלאת תמונה');
    }
  };

  // --- Featured Products Logic ---
  const toggleProduct = (productId) => {
    const currentIds = formData.featured.productIds;
    const newIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];

    setFormData(prev => ({
      ...prev,
      featured: { ...prev.featured, productIds: newIds }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/api/homepage', formData);
      alert('השינויים נשמרו בהצלחה!');
    } catch (error) {
      alert('שגיאה בשמירה: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const productsByCategory = allProducts.reduce((acc, product) => {
      const catName = getCategoryName(product.category);
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(product);
      return acc;
  }, {});

  if (loading) return <div className="p-10 text-center text-xl font-sans">טוען ממשק ניהול...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#FDFCFB] min-h-screen direction-rtl text-right font-sans pb-32">
      
      {/* מודל העריכה */}
      <TextEditorModal 
          isOpen={editorState.isOpen}
          onClose={() => setEditorState(prev => ({ ...prev, isOpen: false }))}
          initialValue={editorState.value}
          onSave={handleEditorSave}
          label={editorState.label}
      />

      {/* כותרת וכפתור שמירה עליון */}
      <div className="flex justify-between items-end mb-10 pb-4 border-b">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול דף הבית</h1>
            <p className="text-gray-500 mt-1">מערכת ניהול תוכן (CMS)</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#b5952f] px-8 shadow-md">
          {saving ? <Loader2 className="animate-spin ml-2 h-4 w-4" /> : <Save className="ml-2 h-4 w-4" />}
          שמור שינויים
        </Button>
      </div>

      <div className="space-y-12">

        {/* --- חלק 1: HERO SLIDER --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg"><Monitor className="text-[#D4AF37]" size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">מצגת ראשית (Hero Slider)</h2>
                        <p className="text-sm text-gray-500">לחץ על כפתורי העריכה כדי לפתוח את מעבד התמלילים המתקדם.</p>
                    </div>
                </div>
                
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">גובה (vh):</span>
                        <input 
                            type="number" min="50" max="100"
                            className="w-16 p-2 border rounded text-center focus:border-[#D4AF37] outline-none font-bold" 
                            value={formData.hero.height} 
                            onChange={(e) => handleHeroSettingChange('height', Number(e.target.value))}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">זמן (שניות):</span>
                        <input 
                            type="number" min="2" max="20"
                            className="w-16 p-2 border rounded text-center focus:border-[#D4AF37] outline-none font-bold" 
                            value={formData.hero.interval} 
                            onChange={(e) => handleHeroSettingChange('interval', Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {formData.hero.slides.map((slide, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex flex-col md:flex-row gap-6 relative group hover:border-[#D4AF37] transition-all">
                        
                        <div className="text-xs font-bold bg-white border text-gray-500 w-8 h-8 flex items-center justify-center rounded-full absolute -top-3 -right-3 shadow-sm z-10">
                            {index + 1}
                        </div>

                        <button 
                            onClick={() => handleRemoveSlide(index)}
                            className="absolute top-4 left-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors z-20"
                            title="מחק שקופית"
                        >
                            <Trash2 size={18} />
                        </button>

                        {/* מדיה */}
                        <div className="w-full md:w-1/3 space-y-3">
                            <label className="block text-xs font-bold text-gray-500">תמונה / וידאו</label>
                            <div className="aspect-video bg-white rounded-lg overflow-hidden border border-gray-300 relative shadow-inner">
                                {slide.url ? (
                                    slide.type === 'video' ? (
                                        <video src={slide.url} className="w-full h-full object-cover" muted loop />
                                    ) : (
                                        <img src={slide.url} alt="Slide" className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                        <ImageIcon size={32} />
                                        <span className="text-[10px] mt-1">ריק</span>
                                    </div>
                                )}
                                
                                {uploadingId === index && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                        <Loader2 className="animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer bg-white border border-gray-300 hover:bg-white text-gray-700 py-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow">
                                    <ImageIcon size={14} className="text-blue-500"/> תמונה
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleHeroUpload(e.target.files[0], index, 'image')} />
                                </label>
                                <label className="flex-1 cursor-pointer bg-white border border-gray-300 hover:bg-white text-gray-700 py-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow">
                                    <Video size={14} className="text-red-500"/> וידאו
                                    <input type="file" className="hidden" accept="video/mp4" onChange={(e) => handleHeroUpload(e.target.files[0], index, 'video')} />
                                </label>
                            </div>
                        </div>

                        {/* אזור הטקסטים - כפתורים לפתיחת המודל */}
                        <div className="flex-1 grid grid-cols-1 gap-4 content-start">
                             {/* טקסט עליון */}
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">טקסט עליון קטן</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-2 border bg-white rounded text-sm text-gray-400 truncate" dangerouslySetInnerHTML={{ __html: slide.topText || 'ריק' }} />
                                    <Button variant="outline" size="sm" onClick={() => openEditor('hero', index, 'topText', slide.topText, 'טקסט עליון')}>
                                        <Edit3 size={14} />
                                    </Button>
                                </div>
                             </div>

                             {/* כותרת ראשית */}
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">כותרת ראשית ענקית</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-2 border bg-white rounded text-lg font-serif text-gray-800 truncate" dangerouslySetInnerHTML={{ __html: slide.title || 'ריק' }} />
                                    <Button variant="outline" size="sm" onClick={() => openEditor('hero', index, 'title', slide.title, 'כותרת ראשית')}>
                                        <Edit3 size={14} />
                                    </Button>
                                </div>
                             </div>

                             {/* כותרת משנה */}
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">כותרת משנה / תיאור</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-2 border bg-white rounded text-sm text-gray-600 truncate" dangerouslySetInnerHTML={{ __html: slide.subtitle || 'ריק' }} />
                                    <Button variant="outline" size="sm" onClick={() => openEditor('hero', index, 'subtitle', slide.subtitle, 'כותרת משנה')}>
                                        <Edit3 size={14} />
                                    </Button>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4 mt-2 border-t pt-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">טקסט כפתור</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-2 border bg-white rounded text-sm text-gray-700 truncate" dangerouslySetInnerHTML={{ __html: slide.buttonText || 'ריק' }} />
                                        <Button variant="outline" size="sm" onClick={() => openEditor('hero', index, 'buttonText', slide.buttonText, 'טקסט כפתור')}>
                                            <Edit3 size={14} />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* בחירת קטגוריה / קישור */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">לאן הכפתור מוביל?</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-[#D4AF37] outline-none cursor-pointer"
                                        value={slide.link} 
                                        onChange={(e) => handleSlideChange(index, 'link', e.target.value)}
                                    >
                                        <option value="/menu">תפריט ראשי (ברירת מחדל)</option>
                                        <option value="/about">אודות</option>
                                        <option value="/contact">צור קשר</option>
                                        <optgroup label="קטגוריות">
                                            {categoriesList.map(cat => (
                                                <option key={cat._id} value={`/menu?category=${cat._id}`}>
                                                    {getCategoryName(cat.name)}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>
                ))}

                <Button onClick={handleAddSlide} variant="outline" className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-yellow-50 flex items-center justify-center gap-2">
                    <Plus size={30} /> 
                    <span className="text-lg font-bold">הוסף שקופית חדשה</span>
                </Button>
            </div>
        </section>

        {/* --- חלק 2: כרטיסיות (Masterpieces) --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 border-r-4 border-[#D4AF37] pr-4">
              <h2 className="text-xl font-bold text-gray-800">כרטיסיות קטגוריה (Masterpieces)</h2>
              <p className="text-gray-500 text-sm">בחר תמונה, כותרות, ואיזו קטגוריה תיפתח בלחיצה.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {formData.categories.map((cat, index) => (
              <div key={index} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/30 hover:bg-white hover:shadow-md transition-all">
                  <div className="font-bold text-[#D4AF37] border-b pb-1 mb-1 text-sm">כרטיסייה {index + 1}</div>
                  
                  {/* תמונה */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group border border-gray-300">
                    {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={30}/></div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Upload className="text-white mb-1" size={24} />
                        <span className="text-white text-xs px-2 py-1 bg-black/50 rounded">החלף תמונה</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCategoryImageUpload(e.target.files[0], index)} />
                    </label>
                  </div>

                  <div className="space-y-3 mt-2">
                    {/* עריכת טקסטים - כאן השארתי אינפוטים רגילים כי לרוב זה טקסט קצר, אבל אפשר לשנות אם תרצה */}
                    <input type="text" placeholder="כותרת ראשית (אנגלית)" className="w-full p-2 border rounded text-sm font-bold" value={cat.title} onChange={(e) => handleCategoryChange(index, 'title', e.target.value)} />
                    <input type="text" placeholder="כותרת משנית (עברית)" className="w-full p-2 border rounded text-sm" value={cat.hebrewTitle} onChange={(e) => handleCategoryChange(index, 'hebrewTitle', e.target.value)} />
                    <input type="text" placeholder="תיאור קצר" className="w-full p-2 border rounded text-xs" value={cat.subtitle} onChange={(e) => handleCategoryChange(index, 'subtitle', e.target.value)} />
                    
                    {/* בחירת קטגוריה חכמה */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">לאיזו קטגוריה זה מוביל?</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded text-xs bg-white cursor-pointer focus:border-[#D4AF37] outline-none"
                            value={cat.link} 
                            onChange={(e) => handleCategoryChange(index, 'link', e.target.value)}
                        >
                            <option value="">בחר קטגוריה מהרשימה...</option>
                            {categoriesList.map(c => (
                                <option key={c._id} value={`/menu?category=${c._id}`}>
                                    {getCategoryName(c.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- חלק 3: מוצרים נבחרים --- */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-r-4 border-[#D4AF37] pr-4">
                <h2 className="text-xl font-bold text-gray-800">מוצרים נבחרים (סליידר)</h2>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded border">
                    <span className="text-xs text-gray-500">מהירות:</span>
                    <input type="number" value={formData.featured.rotationSpeed} onChange={(e) => setFormData(prev => ({...prev, featured: {...prev.featured, rotationSpeed: Number(e.target.value)}}))} className="w-12 text-center bg-transparent font-bold outline-none"/>
                </div>
            </div>
            
            <div className="space-y-8">
                {Object.keys(productsByCategory).length === 0 && <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">טוען מוצרים...</div>}

                {Object.entries(productsByCategory).map(([categoryName, products]) => (
                    <div key={categoryName} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> {categoryName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {products.map((product) => {
                                const isSelected = formData.featured.productIds.includes(product._id);
                                return (
                                    <div key={product._id} onClick={() => toggleProduct(product._id)} className={`relative group cursor-pointer rounded-xl overflow-hidden border bg-white transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-500 shadow-md' : 'border-gray-200 hover:border-[#D4AF37]'}`}>
                                        <div className="aspect-square bg-gray-100 relative">
                                            <img src={product.image || product.imageUrl || '/placeholder.png'} alt={getName(product.name)} className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-80'}`} />
                                            {isSelected && <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full"><Check size={12} /></div>}
                                        </div>
                                        <div className="p-2 text-center">
                                            <div className="text-xs font-bold truncate">{getName(product.name)}</div>
                                            <div className="text-[10px] text-gray-500">₪{product.price}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* כפתור שמירה תחתון */}
        <div className="flex justify-end pt-6 border-t mt-8">
            <Button onClick={handleSave} disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#b5952f] px-10 py-6 text-lg shadow-xl">
                {saving ? <Loader2 className="animate-spin ml-2" /> : <Save className="ml-2" />}
                שמור את כל השינויים באתר
            </Button>
        </div>

      </div>
    </div>
  );
};

export default HomePageManage;
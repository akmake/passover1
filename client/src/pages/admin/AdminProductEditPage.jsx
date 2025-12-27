import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Loader2, Save, ArrowRight, Upload, Plus, X, AlignLeft, Trash2
} from 'lucide-react';
import api from '../../api';

// --- מודל מהיר ליצירת קטגוריה (אותו אחד מדף היצירה) ---
const QuickCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [catForm, setCatForm] = useState({ nameHe: '', nameEn: '' });
  const [loading, setLoading] = useState(false);

  const generateKey = (text) => {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.nameHe || !catForm.nameEn) return alert('חובה למלא שם בעברית ובאנגלית');
    
    setLoading(true);
    try {
      const payload = {
        name: { he: catForm.nameHe, en: catForm.nameEn },
        key: generateKey(catForm.nameEn),
        showOnHomepage: true
      };
      const res = await api.post('/api/categories', payload);
      alert('קטגוריה נוספה בהצלחה!');
      onSuccess(res.data._id);
      onClose();
      setCatForm({ nameHe: '', nameEn: '' });
    } catch (err) {
      alert('שגיאה ביצירת קטגוריה: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-red-500"><X size={24} /></button>
        <h3 className="text-xl font-bold text-center mb-6">יצירת קטגוריה</h3>
        <div className="space-y-4">
          <input value={catForm.nameHe} onChange={(e) => setCatForm({...catForm, nameHe: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="שם בעברית" />
          <input value={catForm.nameEn} onChange={(e) => setCatForm({...catForm, nameEn: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="English Name" dir="ltr" />
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-black text-[#D4AF37] py-3 rounded-lg font-bold">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'שמור קטגוריה'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- הדף הראשי לעריכה ---
const AdminProductEditPage = () => {
  const { id } = useParams(); // מזהה המוצר מה-URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nameHe: '', nameEn: '',
    descHe: '', descEn: '',
    detailsHe: '', detailsEn: '',
    price: '', sku: '', category: '',
    isActive: true // ברירת מחדל
  });

  const [existingImage, setExistingImage] = useState(''); // שומר את התמונה הקיימת
  const [file, setFile] = useState(null); // שומר קובץ חדש אם הועלה
  const [uploading, setUploading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. טעינת קטגוריות
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/api/categories')).data,
  });

  // 2. טעינת נתוני המוצר לעריכה
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        
        // מילוי הטופס בנתונים הקיימים
        setFormData({
          nameHe: data.name?.he || '',
          nameEn: data.name?.en || '',
          descHe: data.description?.he || '',
          descEn: data.description?.en || '',
          detailsHe: data.details?.he || '',
          detailsEn: data.details?.en || '',
          price: data.price || '',
          sku: data.sku || '',
          category: typeof data.category === 'object' ? data.category._id : data.category,
          isActive: data.isActive
        });
        setExistingImage(data.image || '');
        setIsLoadingData(false);

      } catch (err) {
        toast.error('שגיאה בטעינת המוצר');
        navigate('/admin/products');
      }
    };
    if (id) fetchProduct();
  }, [id, navigate]);

  // פונקציית העלאת תמונה
  const uploadImage = async (fileToUpload) => {
    const data = new FormData();
    data.append('image', fileToUpload); // התיקון שעשינו (image ביחיד)
    try {
      const res = await api.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.images[0];
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  // Mutation לעדכון (PUT) במקום יצירה (POST)
  const mutation = useMutation({
    mutationFn: (productData) => api.put(`/api/products/${id}`, productData), // שים לב ל-PUT
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('המוצר עודכן בהצלחה!');
      navigate('/admin/products');
    },
    onError: (err) => {
      console.error("Server Error Details:", err);
      alert('שגיאת שרת: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ולידציה בסיסית
    if (!formData.nameHe) return alert('חסר שדה: שם המוצר בעברית');
    if (!formData.price) return alert('חסר שדה: מחיר');
    if (!formData.category) return alert('חסר שדה: קטגוריה');
    if (!formData.sku) return alert('חסר שדה: מק"ט (SKU)');
    
    // תמונה: חובה שתהיה או תמונה חדשה או תמונה קיימת
    if (!file && !existingImage) {
      return alert('חובה שתהיה תמונה למוצר');
    }

    let finalImageUrl = existingImage;

    // אם המשתמש בחר קובץ חדש - מעלים אותו
    if (file) {
      setUploading(true);
      try {
        finalImageUrl = await uploadImage(file);
      } catch (err) {
        setUploading(false);
        return alert('נכשל בהעלאת התמונה החדשה.');
      }
      setUploading(false);
    }

    // בניית האובייקט לעדכון
    const updatedProduct = {
      name: { 
        he: formData.nameHe, 
        en: formData.nameEn || '' 
      },
      description: { 
        he: formData.descHe || formData.nameHe, 
        en: formData.descEn || '' 
      },
      details: { 
        he: formData.detailsHe || formData.descHe || formData.nameHe, 
        en: formData.detailsEn || '' 
      },
      price: parseFloat(formData.price),
      sku: formData.sku,
      category: formData.category,
      image: finalImageUrl,
      isActive: formData.isActive // סטטוס פעיל/לא פעיל
    };

    mutation.mutate(updatedProduct);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const getCatName = (cat) => cat.name?.he || cat.name?.en || cat.key || 'ללא שם';

  if (isLoadingData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-[#D4AF37]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12 font-sans text-slate-800" dir="rtl">
      
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">עריכת מוצר: {formData.nameHe}</h1>
        
        <div className="flex items-center gap-4">
             {/* כפתור מחיקה מהיר (אופציונלי) */}
             <button 
                type="button"
                onClick={async () => {
                    if(window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
                        await api.delete(`/api/products/${id}`);
                        toast.success('נמחק בהצלחה');
                        navigate('/admin/products');
                    }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                title="מחק מוצר"
             >
                <Trash2 size={20} />
             </button>

            <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white">
            <ArrowRight size={18} /> ביטול
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-slate-100">
        
        {/* שורה עליונה: סטטוס פעיל */}
        <div className="flex justify-end border-b border-slate-100 pb-4">
            <label className="flex items-center gap-3 cursor-pointer">
                <span className={`font-bold ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {formData.isActive ? 'מוצר פעיל (מוצג באתר)' : 'מוצר מוסתר (לא פעיל)'}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive} 
                        onChange={handleChange} 
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </div>
            </label>
        </div>

        {/* שורה 1: קטגוריה, מחיר, מק"ט */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="font-bold block mb-2">קטגוריה *</label>
            <div className="flex gap-2">
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl">
                <option value="">בחר...</option>
                {categories?.map(cat => <option key={cat._id} value={cat._id}>{getCatName(cat)}</option>)}
              </select>
              <button type="button" onClick={() => setShowCatModal(true)} className="p-3 bg-black text-[#D4AF37] rounded-xl"><Plus /></button>
            </div>
          </div>
          <div>
            <label className="font-bold block mb-2">מחיר (₪) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="font-bold block mb-2">מק"ט (SKU) *</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
        </div>

        {/* תמונה */}
        <div>
          <label className="font-bold block mb-2">תמונה *</label>
          <div className="flex gap-6 items-start">
              {/* תצוגה מקדימה של התמונה הקיימת או החדשה */}
              <div className="w-40 h-40 bg-slate-50 rounded-2xl border overflow-hidden flex-shrink-0">
                  {(file || existingImage) ? (
                      <img 
                        src={file ? URL.createObjectURL(file) : existingImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">אין תמונה</div>
                  )}
              </div>

              <div className="flex-grow">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50">
                    <div className="text-center">
                        <Upload className="mx-auto text-slate-400 mb-2" />
                        <span className="text-sm text-gray-500 font-bold">לחץ להחלפת תמונה</span>
                        {file && <div className="text-[#D4AF37] text-xs mt-1">{file.name}</div>}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} />
                </label>
              </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-6"></div>

        {/* תוכן */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex gap-2">🇮🇱 עברית (חובה)</h3>
            <input name="nameHe" value={formData.nameHe} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="שם המוצר *" />
            <textarea name="descHe" value={formData.descHe} onChange={handleChange} rows={3} className="w-full p-3 border rounded-xl" placeholder="תיאור שיווקי קצר *" />
            <div className="relative">
              <AlignLeft className="absolute top-3 right-3 text-gray-400" size={16} />
              <textarea name="detailsHe" value={formData.detailsHe} onChange={handleChange} rows={5} className="w-full p-3 border rounded-xl" placeholder="פירוט מעמיק (רכיבים, אלרגנים) *" />
            </div>
          </div>

          <div className="space-y-4" dir="ltr">
            <h3 className="font-bold text-lg flex gap-2">🇺🇸 English (Optional)</h3>
            <input name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Product Name" />
            <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows={3} className="w-full p-3 border rounded-xl" placeholder="Short description" />
            <textarea name="detailsEn" value={formData.detailsEn} onChange={handleChange} rows={5} className="w-full p-3 border rounded-xl" placeholder="Detailed info" />
          </div>
        </div>

        {/* כפתור שמירה */}
        <button 
          type="submit" 
          disabled={uploading || mutation.isPending} 
          className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex justify-center items-center gap-2"
        >
          {uploading ? <><Loader2 className="animate-spin" /> מעלה תמונה...</> : 
           mutation.isPending ? <><Loader2 className="animate-spin" /> מעדכן נתונים...</> : 
           'שמור שינויים'}
        </button>

      </form>

      <QuickCategoryModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} onSuccess={(id) => {
        queryClient.invalidateQueries(['categories']);
        setFormData(prev => ({ ...prev, category: id }));
      }} />
    </div>
  );
};

export default AdminProductEditPage;
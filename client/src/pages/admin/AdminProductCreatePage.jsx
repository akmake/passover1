import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Loader2, Save, ArrowRight, Upload, Plus, X, Tag, DollarSign, FileText, AlignLeft 
} from 'lucide-react';
import api from '../../api';

// --- מודל מהיר ליצירת קטגוריה ---
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

// --- הדף הראשי ---
const AdminProductCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nameHe: '', nameEn: '',
    descHe: '', descEn: '',
    detailsHe: '', detailsEn: '',
    price: '', sku: '', category: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/api/categories')).data,
  });

  const uploadImage = async (fileToUpload) => {
      const data = new FormData();
      // התיקון: שינינו מ-'images' ל-'image' כדי להתאים לשרת שלך
      data.append('image', fileToUpload); 
      
      try {
        const res = await api.post('/api/upload', data, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        // השרת שלך נחמד ומחזיר גם שדה 'images' (מערך) לתאימות לאחור, אז השורה הזו תעבוד:
        return res.data.images[0]; 
      } catch (error) {
        console.error("Upload Error:", error);
        // זריקת השגיאה כדי שה-handleSubmit יתפוס אותה ויציג את ה-Alert
        throw error; 
      }
    };

  const mutation = useMutation({
    mutationFn: (product) => api.post('/api/products', product),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      alert('המוצר נוצר בהצלחה! מעביר אותך חזרה...'); // הודעה קופצת להצלחה
      navigate('/admin/products');
    },
    onError: (err) => {
      console.error("Server Error Details:", err);
      alert('שגיאת שרת: ' + (err.response?.data?.message || err.message)); // הודעה קופצת לשגיאה
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked"); // לוג לבדיקה

    // 1. בדיקת ולידציה עם ALERT כדי שתראה אם זה נתקע פה
    if (!formData.nameHe) return alert('חסר שדה: שם המוצר בעברית');
    if (!formData.price) return alert('חסר שדה: מחיר');
    if (!formData.category) return alert('חסר שדה: קטגוריה');
    if (!formData.sku) return alert('חסר שדה: מק"ט (SKU)');
    
    if (!file) {
      return alert('חובה להעלות תמונה לפני השמירה');
    }

    let coverUrl = '';
    setUploading(true);
    try {
      // 2. העלאת תמונה
      coverUrl = await uploadImage(file);
    } catch (err) {
      setUploading(false);
      // אם יש שגיאת MIXED CONTENT (HTTP/HTTPS) זה יקפוץ כאן
      return alert('נכשל בשלב העלאת התמונה. בדוק אם השרת רץ והאם יש בעיית HTTP/HTTPS בקונסול.');
    }
    setUploading(false);

    // 3. בניית האובייקט
    const newProduct = {
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
      image: coverUrl,
      isPopular: false,
      inStock: true
    };

    console.log("Sending payload:", newProduct);
    mutation.mutate(newProduct);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getCatName = (cat) => cat.name?.he || cat.name?.en || cat.key || 'ללא שם';

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12 font-sans text-slate-800" dir="rtl">
      
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">הוספת מוצר חדש</h1>
        <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white">
          <ArrowRight size={18} /> ביטול
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-slate-100">
        
        {/* שורה 1 */}
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
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="ייחודי" />
          </div>
        </div>

        {/* תמונה */}
        <div>
          <label className="font-bold block mb-2">תמונה *</label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50">
            {file ? <span className="text-[#D4AF37] font-bold">{file.name}</span> : <Upload className="text-slate-400" />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} />
          </label>
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
           mutation.isPending ? <><Loader2 className="animate-spin" /> שומר נתונים...</> : 
           'שמור מוצר'}
        </button>

      </form>

      <QuickCategoryModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} onSuccess={(id) => {
        queryClient.invalidateQueries(['categories']);
        setFormData(prev => ({ ...prev, category: id }));
      }} />
    </div>
  );
};

export default AdminProductCreatePage;

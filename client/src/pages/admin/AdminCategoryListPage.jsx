// client/src/pages/admin/AdminCategoryListPage.jsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, Upload, ImageOff } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

// --- פונקציות API (ללא שינוי) ---
const fetchCategoryKeys = async () => {
  const { data } = await api.get('/api/admin/product-categories', { withCredentials: true });
  return data;
};

const fetchCategorySettings = async () => {
  const { data } = await api.get('/api/admin/categories', { withCredentials: true });
  return data;
};

const updateCategorySetting = async (settingData) => {
  if (settingData._id) {
    const { data } = await api.put(`/api/admin/categories/${settingData._id}`, settingData, { withCredentials: true });
    return data;
  } else {
    const { data } = await api.post('/api/admin/categories', settingData, { withCredentials: true });
    return data;
  }
};

// --- קומפוננטה ראשית ---
const AdminCategoryListPage = () => {
  const queryClient = useQueryClient();
  const [managedCategories, setManagedCategories] = useState([]);
  const [activeLang, setActiveLang] = useState('he'); // מצב עבור השפה הפעילה

  const { data: categoryKeys = [], isLoading: isLoadingKeys } = useQuery({
    queryKey: ['productCategoryKeys'],
    queryFn: fetchCategoryKeys,
  });

  const { data: categorySettings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['categorySettings'],
    queryFn: fetchCategorySettings,
  });

  // לוגיקת מיזוג מעודכנת להתמודדות עם שמות דו-לשוניים
  useEffect(() => {
    if (categoryKeys.length > 0) {
      const merged = categoryKeys.map(key => {
        const setting = categorySettings.find(s => s.key === key);
        
        // טיפול בנתונים ישנים (סטרינג) וחדשים (אובייקט)
        const nameObj = (setting?.name && typeof setting.name === 'object' && setting.name.he !== undefined)
          ? setting.name
          : { he: setting?.name || key, en: '' };

        return {
          _id: setting?._id || null,
          key: key,
          name: nameObj,
          image: setting?.image || null,
          showOnHomepage: setting?.showOnHomepage || false,
          displayOrder: setting?.displayOrder || 0
        };
      });
      setManagedCategories(merged);
    }
  }, [categoryKeys, categorySettings]);

  const mutation = useMutation({
    mutationFn: updateCategorySetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorySettings'] });
    },
    onError: (error) => {
      alert('אירעה שגיאה: ' + (error.response?.data?.message || error.message));
    },
  });

  // --- פונקציות מעודכנות לטיפול באירועים ---

  const handleUpdate = (categoryKey, field, value) => {
    const categoryToUpdate = managedCategories.find(c => c.key === categoryKey);
    if (categoryToUpdate) {
      const updatedData = { ...categoryToUpdate, [field]: value };
      mutation.mutate(updatedData);
    }
  };

  const handleNameChange = (categoryKey, newName) => {
    setManagedCategories(prev =>
      prev.map(cat =>
        cat.key === categoryKey
          ? { ...cat, name: { ...cat.name, [activeLang]: newName } }
          : cat
      )
    );
  };
  
  const handleNameBlur = (categoryKey) => {
    const categoryToUpdate = managedCategories.find(c => c.key === categoryKey);
    // שלח את אובייקט השם המלא בעת שמירה
    if (categoryToUpdate) {
        handleUpdate(categoryKey, 'name', categoryToUpdate.name);
    }
  };

  const handleImageUpload = async (e, categoryKey) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadFormData = new FormData();
    uploadFormData.append('images', file);

    try {
      const { data } = await api.post('/api/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      handleUpdate(categoryKey, 'image', data.images[0]);
    } catch (error) {
      alert('העלאת התמונה נכשלה: ' + (error.response?.data?.message || 'שגיאה לא ידועה'));
    }
  };


  if (isLoadingKeys || isLoadingSettings) {
    return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">ניהול תצוגת קטגוריות</h1>
      
      {/* לשוניות שפה */}
      <div className="flex border-b mb-6">
        <button type="button" onClick={() => setActiveLang('he')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'he' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            עברית
        </button>
        <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'en' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            English
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managedCategories.map((cat) => (
          <div key={cat.key} className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">{cat.name.he || cat.key}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">תמונה</label>
              <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name.he} className="h-full w-full object-cover rounded-md" />
                ) : (
                  <ImageOff className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label className="mt-2 text-sm text-blue-600 cursor-pointer hover:underline">
                החלף תמונה
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, cat.key)} />
              </label>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <label htmlFor={`switch-${cat.key}`} className="font-medium text-gray-700">הצג בדף הבית</label>
              <Switch
                id={`switch-${cat.key}`}
                checked={cat.showOnHomepage}
                onCheckedChange={(checked) => handleUpdate(cat.key, 'showOnHomepage', checked)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">שם תצוגה ({activeLang === 'he' ? 'עברית' : 'אנגלית'})</label>
              <input 
                  value={cat.name[activeLang] || ''}
                  onChange={(e) => handleNameChange(cat.key, e.target.value)}
                  onBlur={() => handleNameBlur(cat.key)}
                  className="w-full mt-1 p-2 border rounded-md" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoryListPage;
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Trash2, Image as ImageIcon, Upload, Video } from 'lucide-react';
import api from '@/api';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from '@/components/RichTextEditor';
import { toAbsoluteUrl } from '@/utils/url';

const HeroEditForm = ({ content, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...content,
    height: content?.height || 75,
    slideshowInterval: content?.slideshowInterval || 5,
    slides: Array.isArray(content?.slides) ? content.slides : [],
  });

  const handleSimpleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...formData.slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setFormData((prev) => ({ ...prev, slides: updatedSlides }));
  };

  const addSlide = () => {
    const newSlide = {
      id: uuidv4(),
      image: '',
      video: '',
      headline:
        '<p style="text-align: center"><span style="font-size: 48px">כותרת ראשית</span></p><p style="text-align: center"><span style="font-size: 24px">טקסט משנה</span></p>',
    };
    setFormData((prev) => ({ ...prev, slides: [...prev.slides, newSlide] }));
  };

  const removeSlide = (index) => {
    if (window.confirm('האם למחוק שקופית זו?')) {
      setFormData((prev) => ({
        ...prev,
        slides: prev.slides.filter((_, i) => i !== index),
      }));
    }
  };

  const uploadFile = async (file, fieldName) => {
    // fieldName will be 'image' or 'video'
    const fd = new FormData();
    fd.append(fieldName, file);

    try {
      // שים לב: הנתיב חייב להיות תואם לנתיב בשרת שלך
      const { data } = await api.post('/api/upload', fd, {
        withCredentials: true,
      });

      // החזרת ה-URL הנכון בהתאם לסוג הקובץ
      if (fieldName === 'image') return data?.imageUrl || data?.images?.[0] || '';
      if (fieldName === 'video') return data?.videoUrl || '';
      
      return '';
    } catch (error) {
      console.error('UPLOAD ERROR:', error?.response?.data || error);
      const msg = error?.response?.data?.message || error?.message || 'Upload failed';
      throw new Error(msg);
    }
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, 'image');
      if (!url) throw new Error('לא התקבל URL מהשרת');
      
      // עדכון הסטייט: מחיקת הוידאו אם מעלים תמונה
      const updatedSlides = [...formData.slides];
      updatedSlides[index] = { 
        ...updatedSlides[index], 
        image: url, 
        video: '' // איפוס הוידאו
      };
      setFormData(prev => ({ ...prev, slides: updatedSlides }));

    } catch (error) {
      alert('העלאת התמונה נכשלה: ' + (error?.message || 'שגיאה לא ידועה'));
    } finally {
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // בדיקת גודל בצד הלקוח (אופציונלי, כדי לתת חיווי מהיר)
    if (file.size > 200 * 1024 * 1024) {
        alert('הקובץ גדול מדי. הגודל המקסימלי הוא 200MB');
        return;
    }

    try {
      const url = await uploadFile(file, 'video');
      if (!url) throw new Error('לא התקבל URL מהשרת');

      // עדכון הסטייט: מחיקת התמונה אם מעלים וידאו
      const updatedSlides = [...formData.slides];
      updatedSlides[index] = { 
        ...updatedSlides[index], 
        video: url, 
        image: '' // איפוס התמונה
      };
      setFormData(prev => ({ ...prev, slides: updatedSlides }));

    } catch (error) {
      alert('העלאת הוידאו נכשלה: ' + (error?.message || 'שגיאה לא ידועה'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium border-b pb-2 mb-4">הגדרות הבלוק</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
          <div>
            <label className="block text-sm font-medium">גובה הבלוק באחוזים מהמסך (vh)</label>
            <input
              type="number"
              name="height"
              value={formData.height || 75}
              onChange={handleSimpleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">מהירות החלפת שקופיות (בשניות)</label>
            <input
              type="number"
              name="slideshowInterval"
              value={formData.slideshowInterval || 5}
              onChange={handleSimpleChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-medium">ניהול שקופיות</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addSlide}>
            <PlusCircle className="mr-2 h-4 w-4" /> הוסף שקופית
          </Button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-2">
          {formData.slides.map((slide, index) => {
            const imageSrc = toAbsoluteUrl(slide.image);
            const videoSrc = toAbsoluteUrl(slide.video);

            return (
              <div key={slide.id || index} className="border p-4 rounded-lg bg-white space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">שקופית {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSlide(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">מדיה (תמונה או וידאו)</label>
                  <div className="flex items-start gap-4">
                    <div className="w-44 h-28 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center relative">
                      {videoSrc ? (
                        <video src={videoSrc} className="w-full h-full object-cover" controls />
                      ) : imageSrc ? (
                        <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="text-gray-400" />
                          <span className="text-xs mt-1">אין מדיה</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" /> העלה תמונה
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, index)}
                          />
                        </label>

                        <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                          <Video className="h-4 w-4 mr-2" /> העלה וידאו
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleVideoUpload(e, index)}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL לתמונה
                          </label>
                          <input
                            value={slide.image || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleSlideChange(index, 'image', val);
                                if(val) handleSlideChange(index, 'video', '');
                            }}
                            placeholder="https://..."
                            className="w-full p-2 border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL לוידאו
                          </label>
                          <input
                            value={slide.video || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleSlideChange(index, 'video', val);
                                if(val) handleSlideChange(index, 'image', '');
                            }}
                            placeholder="https://..."
                            className="w-full p-2 border rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תוכן השקופית</label>
                  <RichTextEditor
                    content={slide.headline}
                    onChange={(html) => handleSlideChange(index, 'headline', html)}
                  />
                </div>
              </div>
            );
          })}

          {formData.slides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>לחץ על "הוסף שקופית" כדי להתחיל.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="button" onClick={() => onSave(formData)}>
          שמור שינויים בבלוק
        </Button>
      </div>
    </div>
  );
};

export default HeroEditForm;
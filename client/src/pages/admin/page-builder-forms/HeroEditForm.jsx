import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import api from '@/api';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from '@/components/RichTextEditor';

const HeroEditForm = ({ content, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...content, slides: content.slides || [] });

    const handleSimpleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSlideChange = (index, field, value) => {
        const updatedSlides = [...formData.slides];
        updatedSlides[index][field] = value;
        setFormData(prev => ({ ...prev, slides: updatedSlides }));
    };
    const addSlide = () => {
        const newSlide = { id: uuidv4(), image: '', headline: '<p>כותרת חדשה</p>', subheadline: '<p>תיאור חדש</p>' };
        setFormData(prev => ({...prev, slides: [...prev.slides, newSlide]}));
    };
    const removeSlide = (index) => {
        if (window.confirm('האם למחוק שקופית זו?')) {
            setFormData(prev => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }));
        }
    };
    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('images', file);
        try {
            const { data } = await api.post('/api/upload', uploadFormData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            handleSlideChange(index, 'image', data.images[0]);
        } catch (error) {
            alert('העלאת התמונה נכשלה: ' + (error.response?.data?.message || 'שגיאה לא ידועה'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">הגדרות הבלוק</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                    <div>
                        <label className="block text-sm font-medium">גובה הבלוק באחוזים מהמסך (vh)</label>
                        <input type="number" name="height" value={formData.height || 75} onChange={handleSimpleChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">מהירות החלפת שקופיות (בשניות)</label>
                        <input type="number" name="slideshowInterval" value={formData.slideshowInterval || 5} onChange={handleSimpleChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-medium">ניהול שקופיות</h3>
                    <Button type="button" variant="ghost" size="sm" onClick={addSlide}><PlusCircle className="mr-2 h-4 w-4" /> הוסף שקופית</Button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
                    {formData.slides.map((slide, index) => (
                        <div key={slide.id || index} className="border p-4 rounded-lg bg-white space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">שקופית {index + 1}</h4>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeSlide(index)}><Trash2 size={16} /></Button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">תמונת רקע</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {slide.image ? <img src={slide.image} alt="" className="w-24 h-16 object-cover rounded-md bg-gray-200" /> : <div className="w-24 h-16 rounded-md bg-gray-200 flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}
                                    <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" /> העלה/החלף תמונה
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index)} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">כותרת</label>
                                <RichTextEditor content={slide.headline} onChange={(html) => handleSlideChange(index, 'headline', html)} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">כותרת משנה / טקסט</label>
                                <RichTextEditor content={slide.subheadline} onChange={(html) => handleSlideChange(index, 'subheadline', html)} />
                            </div>
                        </div>
                    ))}
                     {formData.slides.length === 0 && <div className="text-center py-8 text-gray-500"><p>לחץ על "הוסף שקופית" כדי להתחיל.</p></div>}
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="button" onClick={() => onSave(formData)}>שמור שינויים בבלוק</Button>
            </div>
        </div>
    );
};
export default HeroEditForm;
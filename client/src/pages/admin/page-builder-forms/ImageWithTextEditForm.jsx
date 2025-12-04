import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import api from '@/api';
import RichTextEditor from '@/components/RichTextEditor';
import { Upload, ImageIcon } from 'lucide-react';

const ImageWithTextEditForm = ({ content, onSave, onCancel }) => {
    const [formData, setFormData] = useState(content);

    const handleContentChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    
    const handleSimpleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('images', file);

        try {
            const { data } = await api.post('/api/upload', uploadFormData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            setFormData(prev => ({ ...prev, image: data.images[0] }));
        } catch (error) {
            alert('Image upload failed: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">הגדרות הבלוק</h3>
                <div className="p-4 border rounded-md bg-gray-50">
                    <label className="block text-sm font-medium">גובה מינימלי לבלוק (בפיקסלים)</label>
                    <input type="number" name="height" value={formData.height || 500} onChange={handleSimpleChange} className="w-full mt-1 p-2 border rounded-md" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">תוכן הבלוק</h3>
                <div className="space-y-4 p-4 border rounded-md bg-white">
                    <div>
                        <label className="block text-sm font-medium mb-2">תמונת רקע</label>
                        <div className="flex items-center gap-4">
                            {formData.image ? <img src={formData.image} alt="" className="w-32 h-20 object-cover rounded-md my-2"/> : <div className="w-32 h-20 rounded-md bg-gray-200 flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}
                           <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" /> העלה/החלף תמונה
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                           </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mt-2">תוכן (כותרת וטקסט)</label>
                        <RichTextEditor content={formData.text} onChange={(html) => handleContentChange('text', html)} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">כפתור (אופציונלי)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-white">
                    <div>
                        <label className="block text-sm font-medium">טקסט הכפתור</label>
                        <input name="buttonText" value={formData.buttonText || ''} onChange={handleSimpleChange} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">קישור הכפתור</label>
                        <input name="buttonLink" value={formData.buttonLink || ''} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="button" onClick={() => onSave(formData)}>שמור שינויים בבלוק</Button>
            </div>
        </div>
    );
};

export default ImageWithTextEditForm;
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import RichTextEditor from '@/components/RichTextEditor';

const CategoryGridEditForm = ({ content, onSave, onCancel }) => {
    const [formData, setFormData] = useState(content);

    const handleSimpleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTitleChange = (html) => {
        setFormData(prev => ({ ...prev, title: html }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">הגדרות הבלוק</h3>
                <div className="p-4 border rounded-md bg-gray-50">
                    <label className="block text-sm font-medium">גובה מינימלי לבלוק (בפיקסלים)</label>
                    <input 
                        type="number" 
                        name="height" 
                        value={formData.height || 600} 
                        onChange={handleSimpleChange} 
                        className="w-full mt-1 p-2 border rounded-md" 
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">תוכן הבלוק</h3>
                 <div className="p-4 border rounded-md bg-white">
                    <label className="block text-sm font-medium mt-2">כותרת (לדוגמה: "הקטגוריות שלנו")</label>
                    <RichTextEditor content={formData.title} onChange={handleTitleChange} />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="button" onClick={() => onSave(formData)}>שמור שינויים בבלוק</Button>
            </div>
        </div>
    );
};

export default CategoryGridEditForm;
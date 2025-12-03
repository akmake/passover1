import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const FeaturesEditForm = ({ content, onSave, onCancel }) => {
    const [formData, setFormData] = useState(content.items || []);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData];
        updatedItems[index][field] = value;
        setFormData(updatedItems);
    };

    const addItem = () => {
        const newItem = { id: uuidv4(), icon: 'Star', title: 'כותרת חדשה', description: 'תיאור חדש' };
        setFormData([...formData, newItem]);
    };
    
    const removeItem = (index) => {
        if (window.confirm('האם למחוק פריט זה?')) {
            setFormData(formData.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = () => {
        onSave({ items: formData });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">עריכת רשימת תכונות</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    הוסף פריט
                </Button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
                {formData.map((item, index) => (
                    <div key={item.id || index} className="border p-4 rounded-lg bg-gray-50 relative space-y-2">
                         <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)} className="absolute top-2 left-2 !p-1 !h-auto">
                            <X size={14} />
                         </Button>
                        <div>
                            <label className="block text-sm font-medium">כותרת</label>
                            <input 
                                value={item.title} 
                                onChange={(e) => handleItemChange(index, 'title', e.target.value)} 
                                className="w-full mt-1 p-2 border rounded-md" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">תיאור</label>
                            <textarea 
                                value={item.description} 
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                                rows="2" 
                                className="w-full mt-1 p-2 border rounded-md" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">אייקון (שם מ-Lucide)</label>
                            <input 
                                value={item.icon} 
                                onChange={(e) => handleItemChange(index, 'icon', e.target.value)} 
                                placeholder="לדוגמה: Award, Truck, Star"
                                className="w-full mt-1 p-2 border rounded-md" 
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="button" onClick={handleSubmit}>שמור שינויים בבלוק</Button>
            </div>
        </div>
    );
};

export default FeaturesEditForm;
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import RichTextEditor from '@/components/RichTextEditor';

const RichTextEditForm = ({ content, onSave, onCancel }) => {
    const [formData, setFormData] = useState(content);

    const handleSimpleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                        value={formData.height || ''}
                        onChange={handleSimpleChange}
                        placeholder="השאר ריק כדי שהגובה יקבע לפי הטקסט (מומלץ)"
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        טיפ: אם אתה רוצה שהבלוק יהיה בדיוק בגודל של הטקסט ללא רווחים מיותרים, מחק את המספר בשדה זה.
                    </p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">תוכן</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">תוכן הבלוק (כולל כותרות וטקסט)</label>
                        <RichTextEditor
                            content={formData.text || ''}
                            onChange={(html) => setFormData(prev => ({ ...prev, text: html }))}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="button" onClick={() => onSave(formData)}>שמור שינויים בבלוק</Button>
            </div>
        </div>
    );
};

export default RichTextEditForm;
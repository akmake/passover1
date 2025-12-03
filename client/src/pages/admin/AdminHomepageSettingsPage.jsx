import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { LoaderCircle, GripVertical, Trash2, Settings } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import HeroEditForm from './page-builder-forms/HeroEditForm';
import RichTextEditForm from './page-builder-forms/RichTextEditForm';
import FeaturesEditForm from './page-builder-forms/FeaturesEditForm';
import ImageWithTextEditForm from './page-builder-forms/ImageWithTextEditForm';
import CategoryGridEditForm from './page-builder-forms/CategoryGridEditForm';

const fetchHomepageSettings = async () => (await api.get('/api/homepage-settings', { withCredentials: true })).data;
const updateHomepageSettings = async (settings) => (await api.put('/api/admin/homepage-settings', settings, { withCredentials: true })).data;

const editForms = { 
    hero: HeroEditForm, 
    richText: RichTextEditForm, 
    features: FeaturesEditForm, 
    imageWithText: ImageWithTextEditForm, 
    categoryGrid: CategoryGridEditForm
};

const SortableSectionBlock = ({ id, section, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="flex items-center bg-white p-4 rounded-lg border shadow-sm">
            <button {...listeners} className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-600"><GripVertical className="h-5 w-5" /></button>
            <div className="flex-grow mx-4">
                <p className="font-bold text-lg capitalize">{section.type}</p>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => onEdit(section)}>
                    <Settings className="h-4 w-4 ml-2" />
                    נהל בלוק
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(section)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};

const AdminHomepageSettingsPage = () => {
    const queryClient = useQueryClient();
    const [sections, setSections] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    const { data: settings, isLoading } = useQuery({ queryKey: ['homepageSettings'], queryFn: fetchHomepageSettings });

    useEffect(() => {
        if (settings?.sections) {
            setSections(settings.sections.map(s => ({ ...s, id: s._id || uuidv4() })));
        }
    }, [settings]);

    const mutation = useMutation({
        mutationFn: updateHomepageSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homepageSettings'] });
            alert('מבנה דף הבית נשמר בהצלחה!');
        },
        onError: (error) => alert('שגיאה בשמירת המבנה: ' + (error.response?.data?.message || 'Unknown error')),
    });

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    
    const handleAddSection = (type) => {
        let newContent;
        switch(type) {
            case 'hero':
                newContent = { mode: 'slideshow', slides: [], slideshowInterval: 5, height: 75 };
                break;
            case 'richText':
                newContent = { title: '<p>כותרת טקסט</p>', text: '<p>תוכן פסקה לדוגמה.</p>', height: 250 };
                break;
            case 'imageWithText':
                newContent = { title: '<p>כותרת חדשה</p>', text: '<p>טקסט ברירת מחדל.</p>', image: "", buttonText: "", buttonLink: "", height: 500 };
                break;
            case 'categoryGrid':
                newContent = { title: '<p>הקטגוריות שלנו</p>', height: 600 };
                break;
            default: newContent = { height: 200 };
        }
        const newSection = { id: uuidv4(), type: type, content: newContent };
        setSections(prev => [...prev, newSection]);
    };

    const handleEdit = (section) => { setEditingSection(section); setIsEditModalOpen(true); };
    const handleDelete = (sectionToDelete) => { if (window.confirm(`האם למחוק בלוק זה?`)) { setSections(prev => prev.filter(s => s.id !== sectionToDelete.id)); } };
    const handleSaveSection = (updatedContent) => { 
        setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, content: updatedContent } : s)); 
        setIsEditModalOpen(false); 
        setEditingSection(null); 
    };

    // --- התיקון הקריטי ---
    // הפונקציה הזו כעת שומרת את כל המידע כמו שצריך, כולל הגובה.
    const handleSaveChanges = () => { 
        const sectionsToSave = sections.map(({ id, ...rest }) => rest); 
        mutation.mutate({ sections: sectionsToSave }); 
    };

    if (isLoading) return <div className="flex justify-center py-20"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
    const EditFormComponent = editingSection ? editForms[editingSection.type] : null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-y-2">
                <h1 className="text-3xl font-bold">בנאי דף הבית</h1>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddSection('hero')}>+ Hero</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddSection('richText')}>+ Text</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddSection('imageWithText')}>+ Image & Text</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddSection('features')}>+ Features</Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddSection('categoryGrid')}>+ Categories</Button>
                    <Button onClick={handleSaveChanges} disabled={mutation.isPending}>{mutation.isPending ? 'שומר...' : 'שמור שינויים'}</Button>
                </div>
            </div>
            <p className="text-gray-600 mb-4">גרור בלוקים כדי לסדר מחדש. לחץ על "נהל בלוק" כדי לערוך את התוכן וההגדרות של כל בלוק.</p>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {sections.map(section => (
                            <SortableSectionBlock key={section.id} id={section.id} section={section} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`ניהול בלוק: ${editingSection?.type}`}>
                {EditFormComponent && (<EditFormComponent content={editingSection.content} onSave={handleSaveSection} onCancel={() => setIsEditModalOpen(false)} />)}
            </Modal>
        </div>
    );
};

export default AdminHomepageSettingsPage;
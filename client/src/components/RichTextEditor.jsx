import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family'; // ייבוא התוסף החדש
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Extension } from '@tiptap/core';

// הרחבה מותאמת אישית המאפשרת שימוש ב-setFontSize (נשמר מהקוד הקודם)
const FontSizeExtension = Extension.create({
    name: 'fontSize',
    addOptions() { return { types: ['textStyle'] }; },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: { fontSize: { default: null, parseHTML: e => e.style.fontSize, renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } }
        }];
    },
    addCommands() {
        return {
            setFontSize: (fontSize) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
            unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
        };
    },
});

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px', '96px'];

// רשימת גופנים פופולריים בעברית
const FONT_FAMILIES = [
    { name: 'ברירת מחדל', value: '' },
    { name: 'אריאל (Arial)', value: 'Arial, sans-serif' },
    { name: 'רוביק (Rubik)', value: "'Rubik', sans-serif" },
    { name: 'היבו (Heebo)', value: "'Heebo', sans-serif" },
    { name: 'פרנק ריהל (Frank Ruhl)', value: "'Frank Ruhl Libre', serif" },
    { name: 'קוריער (Courier)', value: "'Courier New', Courier, monospace" },
    { name: 'ורדנה (Verdana)', value: 'Verdana, sans-serif' },
];

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const ToggleButton = ({ onClick, isActive, children }) => (
    <button type="button" onClick={onClick} className={`p-2 rounded transition-colors ${isActive ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>
      {children}
    </button>
  );

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '';
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || '';

  return (
    <div className="flex flex-wrap items-center gap-2 border border-gray-300 bg-gray-50 p-2 rounded-t-md">
        
        {/* בחירת גופן */}
        <select
            value={currentFontFamily}
            onChange={(e) => {
                const value = e.target.value;
                if (value) {
                    editor.chain().focus().setFontFamily(value).run();
                } else {
                    editor.chain().focus().unsetFontFamily().run();
                }
            }}
            className="p-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 max-w-[120px]"
        >
            <option value="" disabled>גופן</option>
            {FONT_FAMILIES.map(font => <option key={font.name} value={font.value}>{font.name}</option>)}
        </select>

        {/* בחירת גודל */}
        <select
            value={currentFontSize}
            onChange={(e) => {
                const value = e.target.value;
                if (value) {
                    editor.chain().focus().setFontSize(value).run();
                } else {
                    editor.chain().focus().unsetFontSize().run();
                }
            }}
            className="p-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        >
            <option value="">גודל</option>
            {FONT_SIZES.map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
        </select>

        <div className="w-[1px] h-6 bg-gray-300 mx-1" />

        <ToggleButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToggleButton>
        
        <div className="w-[1px] h-6 bg-gray-300 mx-1" />
        
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight className="h-4 w-4" /></ToggleButton>
        
        <div className="w-[1px] h-6 bg-gray-300 mx-1" />

        <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 p-0 border-none cursor-pointer bg-transparent"/>
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      TextAlign.configure({ types: ['paragraph'] }),
      TextStyle,
      FontFamily, // הוספת התוסף לעורך
      Color,
      FontSizeExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    editorProps: {
        attributes: { class: 'prose prose-sm sm:prose-base max-w-none m-5 focus:outline-none min-h-[100px]' },
    }
  });

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
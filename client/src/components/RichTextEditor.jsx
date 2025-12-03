import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// הרחבה מותאמת אישית המאפשרת שימוש ב-setFontSize
import { Extension } from '@tiptap/core';
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

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'];

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const ToggleButton = ({ onClick, isActive, children }) => (
    <button type="button" onClick={onClick} className={`p-2 rounded transition-colors ${isActive ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>
      {children}
    </button>
  );

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '';

  return (
    <div className="flex flex-wrap items-center gap-2 border border-gray-300 bg-gray-50 p-2 rounded-t-md">
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
            <option value="">גודל טקסט</option>
            {FONT_SIZES.map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
        </select>
        
        <div className="w-[1px] h-6 bg-gray-300 mx-1" />
        <ToggleButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToggleButton>
        <div className="w-[1px] h-6 bg-gray-300 mx-1" />
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="h-4 w-4" /></ToggleButton>
        <ToggleButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight className="h-4 w-4" /></ToggleButton>
        <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 p-0 border-none cursor-pointer bg-transparent"/>
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }), // מסירים את הגדרות ברירת המחדל של הכותרות
      TextAlign.configure({ types: ['paragraph'] }),
      TextStyle,
      Color,
      FontSizeExtension, // הוספת ההרחבה החדשה
    ],
    content: content,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    editorProps: {
        attributes: { class: 'prose prose-sm sm:prose-base max-w-none m-5 focus:outline-none' },
    }
  });

  return (
    <div className="border border-gray-300 rounded-md">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[150px]" />
    </div>
  );
};

export default RichTextEditor;
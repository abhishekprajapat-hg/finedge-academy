"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet List
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


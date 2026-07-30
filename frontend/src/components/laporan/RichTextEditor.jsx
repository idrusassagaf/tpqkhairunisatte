import React, { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "",

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
  });

  // ==================================================
  // Sinkronkan editor ketika Topik/BAB berubah
  // ==================================================

  useEffect(() => {
    if (!editor) return;

    const current = editor.getText();
    const incoming = value || "";

    if (current !== incoming) {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  // ==================================================

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* ========================= */}
      {/* TOOLBAR */}
      {/* ========================= */}

      <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-100">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive("bold")
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive("italic")
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive("underline")
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          U
        </button>

        <div className="w-px bg-gray-300 mx-2"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Left
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Center
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Right
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Justify
        </button>

        <div className="w-px bg-gray-300 mx-2"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-3 py-1 bg-white border rounded"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="px-3 py-1 bg-white border rounded"
        >
          1. List
        </button>

        <div className="w-px bg-gray-300 mx-2"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-3 py-1 bg-white border rounded"
        >
          Redo
        </button>
      </div>

      {/* ========================= */}
      {/* EDITOR */}
      {/* ========================= */}

      <EditorContent
        editor={editor}
        className="min-h-[250px] p-5 prose max-w-none focus:outline-none"
      />
    </div>
  );
}

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

      <div
        className="
    w-full
    max-w-full
    overflow-hidden
    border-b
    bg-gray-200
    p-1
    md:p-3
  "
      >
        <div
          className="
    grid
    grid-cols-4
    gap-1
    w-full
    max-w-[calc(100vw-32px)]
    md:flex
    md:flex-wrap
    md:gap-2
    "
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base rounded ${
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
            className={`w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base rounded ${
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
            className={`w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base rounded ${
              editor.isActive("underline")
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            U
          </button>

          <div className="hidden md:block w-px bg-gray-300 mx-2"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Left
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Center
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Right
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Justify
          </button>

          <div className="hidden md:block w-px bg-gray-300 mx-2"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            • List
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            1. List
          </button>

          <div className="hidden md:block w-px bg-gray-300 mx-2"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Undo
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="w-full px-2 py-1 text-xs md:w-auto md:px-3 md:text-base bg-white border rounded"
          >
            Redo
          </button>
        </div>
      </div>
      {/* ========================= */}
      {/* EDITOR */}
      {/* ========================= */}

      <EditorContent
        editor={editor}
        className="min-h-[250px] p-5 prose max-w-none focus:outline-none text-justify"
      />
    </div>
  );
}

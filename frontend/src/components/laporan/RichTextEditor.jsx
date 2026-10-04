import { useEffect, useRef } from "react";

const TINYMCE_SRC = "/tinymce/tinymce.min.js";

// Muat script TinyMCE hanya sekali, walaupun komponen dipakai berkali-kali
let tinymceLoader = null;

function loadTinymce() {
  if (window.tinymce) return Promise.resolve(window.tinymce);

  if (!tinymceLoader) {
    tinymceLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TINYMCE_SRC;
      script.onload = () => resolve(window.tinymce);
      script.onerror = () => {
        tinymceLoader = null;
        reject(new Error("Gagal memuat TinyMCE"));
      };
      document.head.appendChild(script);
    });
  }

  return tinymceLoader;
}

export default function RichTextEditor({ value, onChange, height = 420 }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  // Simpan callback terbaru supaya event TinyMCE tidak memakai callback lama
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ==================================================
  // Inisialisasi TinyMCE (sekali saat komponen tampil)
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    loadTinymce()
      .then((tinymce) => {
        if (cancelled || !textareaRef.current) return;

        tinymce.init({
          target: textareaRef.current,
          base_url: "/tinymce",
          suffix: ".min",
          menubar: false,
          branding: false,
          height,
          plugins: "lists link autolink code",
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat code",
          content_style:
            "body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; }",
          setup: (editor) => {
            editorRef.current = editor;

            editor.on("init", () => {
              editor.setContent(value || "");
            });

            editor.on("input change undo redo", () => {
              onChangeRef.current?.(editor.getContent());
            });
          },
        });
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      const editor = editorRef.current;
      if (editor) {
        editor.remove();
        editorRef.current = null;
      }
    };
    // value sengaja tidak masuk dependency: sinkronisasi ditangani effect di bawah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================================================
  // Sinkronkan isi editor ketika Topik/BAB berubah
  // ==================================================

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !editor.initialized) return;

    const incoming = value || "";

    if (editor.getContent() !== incoming) {
      editor.setContent(incoming);
    }
  }, [value]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <textarea ref={textareaRef} defaultValue={value || ""} />
    </div>
  );
}

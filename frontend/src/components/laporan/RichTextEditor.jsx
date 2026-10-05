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
  const editorIdRef = useRef(
    `tinymce-editor-${Math.random().toString(36).slice(2)}`,
  );

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

    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.id = editorIdRef.current;

    loadTinymce()
      .then((tinymce) => {
        if (cancelled || !textarea.isConnected) return;

        tinymce.remove(`#${editorIdRef.current}`);

        tinymce.init({
          selector: `#${editorIdRef.current}`,
          base_url: "/tinymce",
          suffix: ".min",
          skin: "oxide",
          content_css: "/tinymce/skins/content/default/content.min.css",
          menubar: false,
          branding: false,
          resize: true,
          height,
          statusbar: true,
          plugins:
            "advlist autolink lists link image media table charmap preview anchor pagebreak searchreplace wordcount visualblocks code fullscreen insertdatetime help",
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | forecolor backcolor | removeformat code preview fullscreen help",
          toolbar_mode: "sliding",
          contextmenu: "link image table",
          quickbars_selection_toolbar:
            "bold italic underline | h2 h3 blockquote quickimage quicktable",
          quickbars_insert_toolbar: "image media quicktable",
          forced_root_block: "p",
          browser_spellcheck: true,
          paste_data_images: true,
          image_advtab: true,
          image_caption: true,
          media_live_embeds: true,
          content_style:
            "body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #111827; } p { margin: 0 0 1rem; } ul, ol { padding-left: 1.25rem; } h1, h2, h3, h4, h5, h6 { line-height: 1.35; margin: 0 0 0.75rem; } img { max-width: 100%; height: auto; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #d1d5db; padding: 0.5rem; } a { color: #2563eb; text-decoration: underline; }",
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
      <textarea
        ref={textareaRef}
        defaultValue={value || ""}
        className="min-h-[240px] w-full"
      />
    </div>
  );
}

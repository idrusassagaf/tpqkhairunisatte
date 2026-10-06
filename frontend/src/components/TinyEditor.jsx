import { useEffect, useRef } from "react";

// =========================================================
// EDITOR TEKS KAYA (TINYMCE)
// =========================================================
// TinyMCE dimuat dari /public/tinymce (self-hosted), jadi
// tidak butuh API key. Hasilnya berupa HTML.
// =========================================================

const TINYMCE_SRC = "/tinymce/tinymce.min.js";

let scriptPromise = null;

const loadTinyMCE = () => {
  if (window.tinymce) return Promise.resolve(window.tinymce);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = TINYMCE_SRC;
      script.onload = () => resolve(window.tinymce);
      script.onerror = () => reject(new Error("Gagal memuat TinyMCE"));

      document.head.appendChild(script);
    });
  }

  return scriptPromise;
};

export default function TinyEditor({ value, onChange, placeholder }) {
  const elementRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    let aktif = true;

    loadTinyMCE().then((tinymce) => {
      if (!aktif || !elementRef.current) return;

      tinymce.init({
        target: elementRef.current,
        base_url: "/tinymce",
        suffix: ".min",
        license_key: "gpl",
        height: 360,
        menubar: false,
        branding: false,
        placeholder,
        plugins: "lists link image code autolink",
        toolbar:
          "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image | removeformat | code",
        setup: (editor) => {
          editorRef.current = editor;

          editor.on("init", () => {
            editor.setContent(valueRef.current || "");
          });

          editor.on("input change keyup", () => {
            onChangeRef.current?.(editor.getContent());
          });
        },
      });
    });

    return () => {
      aktif = false;

      if (editorRef.current) {
        window.tinymce?.remove(editorRef.current);
        editorRef.current = null;
      }
    };
  }, []);

  // Sinkronkan isi jika form di-reset atau data diganti dari luar
  useEffect(() => {
    const editor = editorRef.current;

    if (editor && editor.initialized && editor.getContent() !== (value || "")) {
      editor.setContent(value || "");
    }
  }, [value]);

  // TinyMCE mengganti textarea di dalam pembungkus ini,
  // jadi React hanya mengelola pembungkusnya.
  return (
    <div>
      <textarea ref={elementRef} defaultValue={value || ""} />
    </div>
  );
}

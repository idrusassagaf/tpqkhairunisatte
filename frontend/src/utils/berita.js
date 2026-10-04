// Isi berita dari TinyMCE berbentuk HTML, sedangkan berita lama masih teks biasa.

const HTML_TAG = /<[a-z][\s\S]*>/i;

export const isHtmlContent = (value) => HTML_TAG.test(String(value || ""));

// Ubah HTML menjadi teks biasa, dipakai untuk deskripsi meta, teks share, dan ringkasan
export const isiToPlainText = (value) => {
  const text = String(value || "");

  if (!isHtmlContent(text)) {
    return text.replace(/\s+/g, " ").trim();
  }

  const doc = new DOMParser().parseFromString(text, "text/html");

  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

// Ubah HTML menjadi teks dengan jeda paragraf (baris kosong), dipakai untuk PDF
export const isiToParagraphs = (value) => {
  const text = String(value || "");

  if (!isHtmlContent(text)) {
    return text;
  }

  const doc = new DOMParser().parseFromString(
    text
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n"),
    "text/html",
  );

  return (doc.body.textContent || "").trim();
};

import DOMPurify from "dompurify";

// Isi berita disimpan sebagai HTML dari TinyMCE.
// Selalu dibersihkan sebelum ditampilkan.
export const sanitizeHtml = (html) => DOMPurify.sanitize(html || "");

// Teks polos untuk preview, deskripsi, dan meta tag.
export const stripHtml = (html) => {
  const wadah = document.createElement("div");

  wadah.innerHTML = sanitizeHtml(html);

  return (wadah.textContent || "").replace(/\s+/g, " ").trim();
};

// Berita lama disimpan sebagai teks biasa (belum ada tag HTML).
// Baris baru diubah jadi <br> supaya tetap rapi saat ditampilkan.
export const isiBeritaHtml = (isi) => {
  const teks = String(isi || "");

  if (/<[a-z][\s\S]*>/i.test(teks)) {
    return sanitizeHtml(teks);
  }

  const aman = teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return aman.replace(/\n/g, "<br />");
};

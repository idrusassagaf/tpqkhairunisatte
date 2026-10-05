// Font Arab untuk jsPDF. Font bawaan (helvetica) tidak punya huruf Arab,
// sedangkan DejaVu Sans punya glyph Arab dan Latin dalam satu file.

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
};

const muatFont = async (doc, url, filename, style) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Font gagal dimuat (${style}): HTTP ${res.status}`);
  }

  doc.addFileToVFS(filename, bufferToBase64(await res.arrayBuffer()));
  doc.addFont(filename, "DejaVuSans", style);
};

// Mengembalikan nama font yang harus dipakai di jsPDF
export const siapkanFontPdf = async (doc, language, { regular, bold }) => {
  if (language !== "ar") return "helvetica";

  try {
    await muatFont(doc, regular, "DejaVuSans.ttf", "normal");
    await muatFont(doc, bold, "DejaVuSans-Bold.ttf", "bold");

    return "DejaVuSans";
  } catch (error) {
    console.error("Font Arab gagal dimuat untuk PDF:", error);

    return "helvetica";
  }
};

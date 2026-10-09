import { api } from "../api";

// =========================================================
// FOTO UNTUK PDF (DIPOTONG BUJUR SANGKAR)
// =========================================================
// Foto diambil lewat endpoint API /foto (bukan langsung dari
// /storage) karena file /storage tidak membawa header CORS,
// sehingga tidak bisa digambar ke canvas. Hasilnya JPEG
// bujur sangkar siap di-crop lingkaran lewat doc.clip().
// Kalau gagal, Promise ditolak dan pemanggil fallback ke
// lingkaran placeholder.
// =========================================================

export const fotoKotakUntukPdf = async (pathFoto, ukuran = 300) => {
  const response = await api.get("/foto", {
    params: { path: pathFoto },
    responseType: "blob",
    skipLoading: true,
  });

  const objectUrl = URL.createObjectURL(response.data);

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");

          canvas.width = ukuran;
          canvas.height = ukuran;

          const ctx = canvas.getContext("2d");

          // Crop ke bujur sangkar dari tengah (seperti object-fit: cover)
          const sisi = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - sisi) / 2;
          const sy = (img.naturalHeight - sisi) / 2;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, ukuran, ukuran);
          ctx.drawImage(img, sx, sy, sisi, sisi, 0, 0, ukuran, ukuran);

          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Gagal memuat foto"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

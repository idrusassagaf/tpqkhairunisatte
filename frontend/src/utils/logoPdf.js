// =========================================================
// LOGO UNTUK PDF
// =========================================================
// Logo PNG punya kanal transparansi. Saat dimasukkan ke PDF,
// area transparan sering tampil hitam. Karena itu logo digambar
// dulu di atas latar putih, lalu diubah menjadi JPEG.
// =========================================================

export const logoPutihUntukPdf = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };

    img.onerror = () => reject(new Error("Gagal memuat logo"));
    img.src = src;
  });

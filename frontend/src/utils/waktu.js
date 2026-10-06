// =========================================================
// ZONA WAKTU SISTEM: WIT (Asia/Jayapura, UTC+9)
// =========================================================
// Semua penentuan "hari ini" dan "bulan ini" di halaman
// absensi memakai zona ini, supaya sama dengan server.
// =========================================================

export const ZONA_WAKTU = "Asia/Jayapura";

// Tanggal hari ini dalam format YYYY-MM-DD (en-CA memberi format itu)
export const tanggalHariIni = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_WAKTU,
  }).format(new Date());

// Bulan berjalan dalam format YYYY-MM
export const periodeSekarang = () => tanggalHariIni().slice(0, 7);

// Tahun berjalan (angka)
export const tahunSekarang = () => Number(tanggalHariIni().slice(0, 4));

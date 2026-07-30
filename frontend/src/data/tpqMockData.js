/* =========================
   ORANG TUA
========================= */
export const orangTua = [
  {
    id: 1,
    namaAyah: "Budi Santoso",
    namaIbu: "Siti Aminah",
    noHp: "08123456789",
    alamat: "Desa A",
  },
  {
    id: 2,
    namaAyah: "Ahmad Yani",
    namaIbu: "Nur Halimah",
    noHp: "082233445566",
    alamat: "Desa B",
  },
];

/* =========================
   GURU
========================= */
export const guru = [
  {
    id: 1,
    nama: "Ust. Hasan",
    bidang: "Iqra",
    noHp: "0811111111",
    aktif: true,
  },
  {
    id: 2,
    nama: "Ust. Abdullah",
    bidang: "Al-Qur'an",
    noHp: "0822222222",
    aktif: true,
  },
];

/* =========================
   SANTRI
========================= */
export const santri = [
  {
    id: 1,
    nama: "Ahmad Fauzi",
    umur: 10,
    idOrangTua: 1,
    status: "aktif",
  },
  {
    id: 2,
    nama: "Bilal Ramadhan",
    umur: 9,
    idOrangTua: 2,
    status: "aktif",
  },
];

/* =========================
   RELASI SANTRI - GURU
========================= */
export const santriGuru = [
  {
    id: 1,
    idSantri: 1,
    idGuru: 1,
    jenis: "Iqra",
  },
  {
    id: 2,
    idSantri: 1,
    idGuru: 2,
    jenis: "Al-Qur'an",
  },
  {
    id: 3,
    idSantri: 2,
    idGuru: 1,
    jenis: "Iqra",
  },
];

/* =========================
   PROGRES IQRA
========================= */
export const progresIqra = [
  {
    id: 1,
    idSantri: 1,
    jilid: 2,
    halaman: 15,
    status: "lancar",
  },
  {
    id: 2,
    idSantri: 2,
    jilid: 1,
    halaman: 8,
    status: "proses",
  },
];

/* =========================
   PROGRES AL-QUR'AN
========================= */
export const progresQuran = [
  {
    id: 1,
    idSantri: 1,
    juz: 30,
    surat: "An-Nas",
    status: "lancar",
  },
];

/* =========================
   PROGRES HAFALAN
========================= */
export const progresHafalan = [
  {
    id: 1,
    idSantri: 1,
    surat: "Al-Fatihah",
    status: "lancar",
  },
  {
    id: 2,
    idSantri: 2,
    surat: "An-Nas",
    status: "pemula",
  },
];

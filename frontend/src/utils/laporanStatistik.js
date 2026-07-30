export function laporanStatistik(masterData = {}) {
  const santri = masterData.santri || [];
  const guru = masterData.guru || [];
  const progres = masterData.progres || [];

  // ================= PROGRES IQRA (LocalStorage) =================

  const progresIqra = JSON.parse(
    localStorage.getItem("tpq_progres_iqra") || "{}",
  );

  const daftarIqra = santri.filter((s) =>
    (s.kelas || "").toLowerCase().includes("iqra"),
  );

  const iqraLancar = daftarIqra.filter(
    (s) => progresIqra[s.nis] === "Lancar",
  ).length;
  const iqraBelum = daftarIqra.filter(
    (s) => progresIqra[s.nis] === "Belum",
  ).length;
  const iqraLanjut = iqraLancar;
  const iqraUlang = iqraBelum;

  // ================= HAFALAN =================

  let jumlahHafalan = 0;
  let hafalanLancar = 0;
  let hafalanBelum = 0;

  santri.forEach((s) => {
    const data = JSON.parse(localStorage.getItem(`hafalan_${s.nis}`) || "{}");

    console.log({
      nis: s.nis,
      jumlah: Object.keys(data).length,
      data,
    });

    Object.values(data).forEach((item) => {
      jumlahHafalan++;

      if (item?.progres === "Lancar") {
        hafalanLancar++;
      }

      if (item?.progres === "Belum") {
        hafalanBelum++;
      }
    });
  });

  return {
    // ================= SANTRI =================

    jumlahSantri: santri.length,

    santriLaki: santri.filter((s) => s.jenis_kelamin === "L").length,

    santriPerempuan: santri.filter((s) => s.jenis_kelamin === "P").length,

    santriIqra: daftarIqra.length,

    santriQuran: santri.filter((s) =>
      (s.kelas || "").toLowerCase().includes("qur"),
    ).length,

    yatim: santri.filter(
      (s) =>
        (s.status_anak || "").toLowerCase().includes("yatim") &&
        !(s.status_anak || "").toLowerCase().includes("piatu"),
    ).length,

    piatu: santri.filter(
      (s) =>
        (s.status_anak || "").toLowerCase().includes("piatu") &&
        !(s.status_anak || "").toLowerCase().includes("yatim"),
    ).length,

    yatimPiatu: santri.filter((s) =>
      (s.status_anak || "").toLowerCase().includes("yatim piatu"),
    ).length,

    santunan: santri.filter((s) =>
      (s.status_anak || "").toLowerCase().includes("santunan"),
    ).length,

    // ================= GURU =================

    jumlahGuru: guru.length,

    guruLaki: guru.filter((g) => (g.jenis_kelamin || "").toUpperCase() === "L")
      .length,

    guruPerempuan: guru.filter(
      (g) => (g.jenis_kelamin || "").toUpperCase() === "P",
    ).length,

    // ================= PROGRES IQRA =================

    jumlahProgres: progres.length,

    iqraLancar,

    iqraBelum,

    iqraLanjut,

    iqraUlang,

    // ================= HAFALAN =================

    jumlahHafalan,
    hafalanLancar,
    hafalanBelum,
  };
}

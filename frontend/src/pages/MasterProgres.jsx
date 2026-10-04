import { useEffect, useState } from "react";
import { api } from "../api";
import { Skeleton, SkeletonRows } from "../components/Skeleton";
import { Eye, TrendingUp, BookOpen, BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Input angka Juz/Ayat/Hal di tabel Al-Qur'an dibuat lebih besar supaya mudah diisi
const numCls =
  "w-full min-w-[56px] rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100";

// Dropdown diatur secara global di styles/forms.css
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

const cellCls =
  "w-full min-w-0 rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-2 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100";

export default function MasterProgres() {
  const [loadingData, setLoadingData] = useState(true);

  const navigate = useNavigate();

  const [tab, setTab] = useState("iqra");
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [progresData, setProgresData] = useState({});
  const [saving, setSaving] = useState(false);
  const notify = window.__tpqNotify;

  // ================= SEARCH & FILTER IQRA =================
  const [searchIqra, setSearchIqra] = useState("");
  const [filterJilid, setFilterJilid] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");

  // ================= SEARCH & FILTER QURAN =================
  const [searchQuran, setSearchQuran] = useState("");
  const [filterJuzQuran, setFilterJuzQuran] = useState("");
  const [filterSurahQuran, setFilterSurahQuran] = useState("");
  const [filterProgresQuran, setFilterProgresQuran] = useState("");
  const [filterPrestasiQuran, setFilterPrestasiQuran] = useState("");

  // ================= PAGINATION =================
  const [currentPageIqra, setCurrentPageIqra] = useState(1);
  const [currentPageQuran, setCurrentPageQuran] = useState(1);

  const itemsPerPage = 10;

  const STORAGE_KEY = "tpq_progres_iqra";

  // ================= LOAD MASTER DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  // ================= LOAD LOCAL STORAGE =================
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        setProgresData((prev) => ({
          ...prev,
          ...parsedData,
        }));
      } catch (error) {
        console.error("Gagal membaca data localStorage:", error);
      }
    }
  }, []);

  // ================= HANDLE PROGRES =================
  const handleProgresChange = (id, value) => {
    setProgresData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      // ================= MASTER DATA =================
      const masterRes = await api.get("/master-data");

      setSantri(masterRes?.data?.data?.santri || []);
      setGuru(masterRes?.data?.data?.guru || []);

      // ================= PROGRES IQRA =================
      let progresIqraData = {};

      try {
        const iqraRes = await api.get("/progres-iqra");

        const iqraRows = iqraRes?.data?.data || [];

        iqraRows.forEach((row) => {
          if (!row?.nis) return;

          progresIqraData[row.nis] = row.progres || "";
          progresIqraData[`guru_${row.nis}`] = row.nama_guru || "";
          progresIqraData[`jilid_${row.nis}`] = row.jilid || "";
          progresIqraData[`hal_${row.nis}`] = row.halaman || "";
        });
      } catch (err) {
        console.error("Gagal ambil data Progres Iqra:", err);
      }

      // ================= PROGRES AL-QUR'AN =================
      let progresQuranData = {};

      try {
        const quranRes = await api.get("/progres-quran");

        const quranRows = quranRes?.data?.data || [];

        quranRows.forEach((row) => {
          if (!row?.nis) return;

          progresQuranData[`quran_guru_${row.nis}`] = row.nama_guru || "";

          progresQuranData[`quran_juz_${row.nis}`] = row.juz || "";

          progresQuranData[`quran_surah_${row.nis}`] = row.surah || "";

          progresQuranData[`quran_ayat_${row.nis}`] = row.ayat || "";

          progresQuranData[`quran_hal_${row.nis}`] = row.halaman || "";

          progresQuranData[`quran_progres_${row.nis}`] = row.progres || "";
        });
      } catch (err) {
        console.error("Gagal ambil data Progres Al-Qur'an:", err);
      }

      // ================= GABUNG DATA BACKEND =================
      const backendData = {
        ...progresIqraData,
        ...progresQuranData,
      };

      // ================= GABUNG DENGAN LOCAL STORAGE =================
      const savedData = localStorage.getItem(STORAGE_KEY);

      let localData = {};

      if (savedData) {
        try {
          localData = JSON.parse(savedData);
        } catch (error) {
          console.error("Gagal membaca data localStorage:", error);
        }
      }

      // Backend menjadi sumber data utama.
      // Data localStorage yang sudah ada tetap dipertahankan
      // sebagai override agar data localhost tidak hilang.
      const mergedData = {
        ...backendData,
        ...localData,
      };

      setProgresData(mergedData);

      // Simpan hasil gabungan agar data backend yang baru dimuat
      // juga tersedia di localStorage browser.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
    } catch (err) {
      console.error("Gagal ambil master data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ================= FILTER IQRA =================
  const santriIqra = santri.filter((s) => {
    const isIqra = (s.kelas || "").trim().toLowerCase() === "iqra";

    const guruDipilih = progresData[`guru_${s.nis}`] || "";

    const progresDipilih = progresData[s.nis] || "";

    const jilidDipilih = progresData[`jilid_${s.nis}`] || "";

    const prestasi =
      progresDipilih === "Lancar"
        ? "Di-Lanjut"
        : progresDipilih === "Belum"
          ? "Di-Ulang"
          : "";

    const keyword = searchIqra.toLowerCase();

    const cocokSearch = `
      ${s.nama || ""}
      ${s.nis || ""}
      ${guruDipilih}
    `
      .toLowerCase()
      .includes(keyword);

    const cocokJilid = !filterJilid || jilidDipilih === filterJilid;

    const cocokProgres = !filterProgres || progresDipilih === filterProgres;

    const cocokPrestasi = !filterPrestasi || prestasi === filterPrestasi;

    return isIqra && cocokSearch && cocokJilid && cocokProgres && cocokPrestasi;
  });

  // ================= FILTER QURAN =================
  const santriQuran = santri.filter((s) => {
    const kelas = (s.kelas || "").trim().toLowerCase();

    const isQuran =
      kelas === "al quran" || kelas === "alquran" || kelas === "al-qur'an";

    const guruDipilih = progresData[`quran_guru_${s.nis}`] || "";

    const juzDipilih = progresData[`quran_juz_${s.nis}`] || "";

    const surahDipilih = progresData[`quran_surah_${s.nis}`] || "";

    const progresDipilih = progresData[`quran_progres_${s.nis}`] || "";

    const prestasi =
      progresDipilih === "Lancar"
        ? "Di-Lanjut"
        : progresDipilih === "Belum"
          ? "Di-Ulang"
          : "";

    const keyword = searchQuran.toLowerCase();

    const cocokSearch = `
      ${s.nama || ""}
      ${s.nis || ""}
      ${guruDipilih}
      ${surahDipilih}
    `
      .toLowerCase()
      .includes(keyword);

    const cocokJuz =
      !filterJuzQuran || String(juzDipilih) === String(filterJuzQuran);

    const cocokSurah =
      !filterSurahQuran ||
      surahDipilih.toLowerCase().includes(filterSurahQuran.toLowerCase());

    const cocokProgres =
      !filterProgresQuran || progresDipilih === filterProgresQuran;

    const cocokPrestasi =
      !filterPrestasiQuran || prestasi === filterPrestasiQuran;

    return (
      isQuran &&
      cocokSearch &&
      cocokJuz &&
      cocokSurah &&
      cocokProgres &&
      cocokPrestasi
    );
  });

  // ================= PAGINATION IQRA =================
  const totalPagesIqra = Math.ceil(santriIqra.length / itemsPerPage);

  const startIndexIqra = (currentPageIqra - 1) * itemsPerPage;

  const paginatedSantriIqra = santriIqra.slice(
    startIndexIqra,
    startIndexIqra + itemsPerPage,
  );

  // ================= PAGINATION QURAN =================
  const totalPagesQuran = Math.ceil(santriQuran.length / itemsPerPage);

  const startIndexQuran = (currentPageQuran - 1) * itemsPerPage;

  const paginatedSantriQuran = santriQuran.slice(
    startIndexQuran,
    startIndexQuran + itemsPerPage,
  );

  // ================= AUTO PRESTASI =================
  const getPrestasi = (progres, jilid) => {
    if (progres === "Lancar" && jilid === "Iqra 6") {
      return "Sangat Baik";
    }

    if (progres === "Lancar") {
      return "Baik";
    }

    if (progres === "Proses") {
      return "Cukup";
    }

    return "-";
  };

  // ================= SIMPAN DATA =================
  const handleSave = async () => {
    setSaving(true);
    window.__tpqLoading?.show("Menyimpan progres...");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progresData));

      let berhasil = 0;
      let dilewati = 0;

      // =====================================================
      // SIMPAN IQRA SAJA JIKA TAB IQRA AKTIF
      // =====================================================
      if (tab === "iqra") {
        for (const s of santriIqra) {
          const namaGuru =
            progresData[`guru_${s.nis}`]?.toString().trim() || "";

          // Jika guru belum dipilih, jangan kirim ke database
          // karena kolom NIG wajib terisi.
          if (!namaGuru) {
            dilewati++;
            continue;
          }

          const dataGuru = guru.find(
            (g) =>
              g.nama_guru?.toString().trim().toLowerCase() ===
              namaGuru.toLowerCase(),
          );

          // Jika nama guru tidak ditemukan di master Guru,
          // jangan kirim data dengan NIG kosong.
          if (!dataGuru?.nig) {
            console.warn(
              `Guru tidak ditemukan atau NIG kosong untuk NIS ${s.nis}:`,
              namaGuru,
            );
            dilewati++;
            continue;
          }

          const progres = progresData[s.nis] || "";

          const prestasi =
            progres === "Lancar"
              ? "Di-Lanjut"
              : progres === "Belum"
                ? "Di-Ulang"
                : "";

          await api.post("/progres-iqra", {
            nama_santri: s.nama,
            nis: s.nis,
            nama_guru: namaGuru,
            nig: dataGuru.nig,
            kelas: s.kelas,
            jilid: progresData[`jilid_${s.nis}`] || "",
            halaman: progresData[`hal_${s.nis}`] || "",
            progres: progres,
            prestasi: prestasi,
          });

          berhasil++;
        }
      }

      // =====================================================
      // SIMPAN AL-QURAN SAJA JIKA TAB AL-QURAN AKTIF
      // =====================================================
      if (tab === "quran") {
        for (const s of santriQuran) {
          const namaGuru =
            progresData[`quran_guru_${s.nis}`]?.toString().trim() || "";

          // Jika guru belum dipilih, jangan kirim ke database
          // karena kolom NIG wajib terisi.
          if (!namaGuru) {
            dilewati++;
            continue;
          }

          const dataGuru = guru.find(
            (g) =>
              g.nama_guru?.toString().trim().toLowerCase() ===
              namaGuru.toLowerCase(),
          );

          // Jika nama guru tidak ditemukan di master Guru,
          // jangan kirim data dengan NIG kosong.
          if (!dataGuru?.nig) {
            console.warn(
              `Guru tidak ditemukan atau NIG kosong untuk NIS ${s.nis}:`,
              namaGuru,
            );
            dilewati++;
            continue;
          }

          const progres = progresData[`quran_progres_${s.nis}`] || "";

          const prestasi =
            progres === "Lancar"
              ? "Di-Lanjut"
              : progres === "Belum"
                ? "Di-Ulang"
                : "";

          await api.post("/progres-quran", {
            nama_santri: s.nama,
            nis: s.nis,
            nama_guru: namaGuru,
            nig: dataGuru.nig,
            kelas: s.kelas,
            juz: progresData[`quran_juz_${s.nis}`] || "",
            surah: progresData[`quran_surah_${s.nis}`] || "",
            ayat: progresData[`quran_ayat_${s.nis}`] || "",
            halaman: progresData[`quran_hal_${s.nis}`] || "",
            progres: progres,
            prestasi: prestasi,
          });

          berhasil++;
        }
      }

      // =====================================================
      // HASIL
      // =====================================================
      if (berhasil === 0 && dilewati > 0) {
        notify?.toast({
          type: "warning",
          title: "Tidak ada data yang disimpan",
          message: "Pastikan Guru sudah dipilih pada data yang ingin disimpan.",
        });
        return;
      }

      if (dilewati > 0) {
        notify?.toast({
          type: "success",
          title: "Data berhasil disimpan",
          message: `Berhasil: ${berhasil} data. Dilewati: ${dilewati} data karena Guru belum dipilih atau NIG tidak ditemukan.`,
        });
      } else {
        notify?.toast({
          type: "success",
          title: "Data berhasil disimpan",
          message: `Berhasil menyimpan ${berhasil} data.`,
        });
      }
    } catch (err) {
      console.error("Gagal menyimpan Master Progres:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Gagal menyimpan data";

      notify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message,
      });
    } finally {
      setSaving(false);
      window.__tpqLoading?.hide();
    }
  };

  // ================= HAFALAN =================
  const getJumlahHafalan = (nis, status) => {
    const saved = localStorage.getItem(`hafalan_${nis}`);

    if (!saved) {
      return 0;
    }

    try {
      const data = JSON.parse(saved);

      return Object.values(data).filter((item) => item.progres === status)
        .length;
    } catch (error) {
      console.error("Gagal membaca hafalan:", error);

      return 0;
    }
  };

  return (
    <div className="mx-auto w-full max-w-full min-w-0 space-y-5 overflow-x-hidden p-3 md:p-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <TrendingUp size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Master Progres</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Catat progres belajar Iqra dan Al-Qur’an setiap santri.
          </p>
        </div>
      </div>

      {/* ================= TAB ================= */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm md:inline-grid">
        {[
          { key: "iqra", label: "Progres Iqra", icon: BookOpen },
          { key: "quran", label: "Progres Al-Qur’an", icon: BookMarked },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === key
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ===================================================== */}
      {/* ================= TAB IQRA ========================== */}
      {/* ===================================================== */}

      {tab === "iqra" && (
        <>
          <div className="w-[calc(100%+8px)] -ml-1 md:w-auto md:ml-0 md:rounded-2xl md:border md:border-gray-200 md:bg-white md:p-5 md:shadow-sm overflow-x-auto">
            {/* ================= FILTER IQRA ================= */}
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-stretch">
              {/* SEARCH */}
              <input
                type="text"
                placeholder="Cari santri / guru..."
                value={searchIqra}
                onChange={(e) => {
                  setSearchIqra(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className={`${inputCls} md:flex-[2]`}
              />

              {/* FILTER JILID */}
              <select
                value={filterJilid}
                onChange={(e) => {
                  setFilterJilid(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Jilid</option>
                <option value="Iqra 1">Iqra 1</option>
                <option value="Iqra 2">Iqra 2</option>
                <option value="Iqra 3">Iqra 3</option>
                <option value="Iqra 4">Iqra 4</option>
                <option value="Iqra 5">Iqra 5</option>
                <option value="Iqra 6">Iqra 6</option>
              </select>

              {/* FILTER PROGRES */}
              <select
                value={filterProgres}
                onChange={(e) => {
                  setFilterProgres(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Progres</option>
                <option value="Lancar">Lancar</option>
                <option value="Belum">Belum</option>
              </select>

              {/* FILTER PRESTASI */}
              <select
                value={filterPrestasi}
                onChange={(e) => {
                  setFilterPrestasi(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Prestasi</option>
                <option value="Di-Lanjut">Di-Lanjut</option>
                <option value="Di-Ulang">Di-Ulang</option>
              </select>

              {/* SIMPAN */}
              <button
                type="button"
                onClick={handleSave}
                className="whitespace-nowrap rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 md:flex-none"
              >
                Simpan Data
              </button>
            </div>

            {/* ================= DESKTOP IQRA ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed text-sm text-gray-700">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold w-[15%]">Nama Santri</th>
                    <th className="px-3 py-3 font-semibold w-[8%]">NIS</th>
                    <th className="px-3 py-3 font-semibold w-[14%]">Guru</th>
                    <th className="px-3 py-3 font-semibold w-[8%]">NIG</th>
                    <th className="px-3 py-3 font-semibold w-[8%]">Kelas</th>
                    <th className="px-3 py-3 font-semibold w-[9%]">Jilid</th>
                    <th className="px-3 py-3 font-semibold w-[6%]">Hal.</th>
                    <th className="px-3 py-3 font-semibold w-[10%]">Progres</th>
                    <th className="px-3 py-3 font-semibold w-[8%]">Prestasi</th>
                    <th className="px-3 py-3 font-semibold w-[14%]">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingData ? (
                    <tr>
                      <td colSpan="10" className="p-0">
                        <SkeletonRows rows={6} cols={6} />
                      </td>
                    </tr>
                  ) : santriIqra.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Tidak ada data santri Iqra
                      </td>
                    </tr>
                  ) : (
                    paginatedSantriIqra.map((s, i) => {
                      const namaGuru = progresData[`guru_${s.nis}`] || "";

                      const dataGuru = guru.find(
                        (g) => g.nama_guru === namaGuru,
                      );

                      const progres = progresData[s.nis] || "";

                      const prestasi =
                        progres === "Lancar"
                          ? "Di-Lanjut"
                          : progres === "Belum"
                            ? "Di-Ulang"
                            : "-";

                      return (
                        <tr
                          key={s.nis || i}
                          className="border-t border-gray-100 transition hover:bg-purple-50/40"
                        >
                          {/* NAMA */}
                          <td className="px-3 py-2 align-middle font-semibold text-gray-800 truncate">
                            {s.nama}
                          </td>

                          {/* NIS */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {s.nis}
                          </td>

                          {/* GURU */}
                          <td className="px-3 py-2 align-middle">
                            <select
                              className={cellCls}
                              value={progresData[`guru_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `guru_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Pilih Guru</option>

                              {guru.map((g, index) => (
                                <option
                                  key={g.nig || index}
                                  value={g.nama_guru}
                                >
                                  {g.nama_guru}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* NIG */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {dataGuru?.nig || "-"}
                          </td>

                          {/* KELAS */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {s.kelas || "-"}
                          </td>

                          {/* JILID */}
                          <td className="px-3 py-2 align-middle">
                            <select
                              className={cellCls}
                              value={progresData[`jilid_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `jilid_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Pilih</option>
                              <option value="Iqra 1">Iqra 1</option>
                              <option value="Iqra 2">Iqra 2</option>
                              <option value="Iqra 3">Iqra 3</option>
                              <option value="Iqra 4">Iqra 4</option>
                              <option value="Iqra 5">Iqra 5</option>
                              <option value="Iqra 6">Iqra 6</option>
                            </select>
                          </td>

                          {/* HALAMAN */}
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="number"
                              className={cellCls}
                              placeholder="0"
                              value={progresData[`hal_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `hal_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          {/* PROGRES */}
                          <td className="px-3 py-2 align-middle">
                            <select
                              className={cellCls}
                              value={progres}
                              onChange={(e) =>
                                handleProgresChange(s.nis, e.target.value)
                              }
                            >
                              <option value="">Pilih</option>
                              <option value="Belum">Belum</option>
                              <option value="Lancar">Lancar</option>
                            </select>
                          </td>

                          {/* PRESTASI */}
                          <td className="px-3 py-2 align-middle font-medium whitespace-nowrap">
                            {prestasi}
                          </td>

                          {/* UPDATE */}
                          <td className="px-3 py-2 align-middle text-gray-500 whitespace-nowrap">
                            {new Date().toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE IQRA ================= */}
            <div className="md:hidden space-y-3">
              {loadingData ? (
                <SkeletonRows rows={4} cols={3} />
              ) : paginatedSantriIqra.map((s, i) => {
                const namaGuru = progresData[`guru_${s.nis}`] || "-";

                const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

                const progres = progresData[s.nis] || "-";

                const prestasi =
                  progres === "Lancar"
                    ? "Di-Lanjut"
                    : progres === "Belum"
                      ? "Di-Ulang"
                      : "-";

                return (
                  <div
                    key={s.nis || i}
                    className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* HEADER */}
                    <div className="bg-gray-300 text-black text-center px-3 py-2.5">
                      <div className="font-bold text-sm leading-5">
                        {s.nama?.toUpperCase()}
                      </div>

                      <div className="text-xs leading-5">
                        NIS : {s.nis} | KELAS {s.kelas?.toUpperCase() || "IQRA"}
                      </div>
                    </div>

                    {/* DATA PROGRES */}
                    <div className="px-3 py-3 text-xs text-gray-700 space-y-2">
                      {/* JILID | HALAMAN */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Jilid
                          </span>

                          <select
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`jilid_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `jilid_${s.nis}`,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="Iqra 1">Iqra 1</option>
                            <option value="Iqra 2">Iqra 2</option>
                            <option value="Iqra 3">Iqra 3</option>
                            <option value="Iqra 4">Iqra 4</option>
                            <option value="Iqra 5">Iqra 5</option>
                            <option value="Iqra 6">Iqra 6</option>
                          </select>
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Halaman
                          </span>

                          <input
                            type="number"
                            className={`w-14 ${cellCls}`}
                            placeholder="0"
                            value={progresData[`hal_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `hal_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* GURU | NIG */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Guru
                          </span>

                          <select
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`guru_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `guru_${s.nis}`,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Pilih Guru</option>

                            {guru.map((g, index) => (
                              <option key={g.nig || index} value={g.nama_guru}>
                                {g.nama_guru}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="shrink-0">
                          <span className="font-medium">NIG</span>{" "}
                          {dataGuru?.nig || "-"}
                        </div>
                      </div>

                      {/* PROGRES | PRESTASI */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Progres :
                          </span>

                          <select
                            className={`flex-1 ${cellCls}`}
                            value={progresData[s.nis] || ""}
                            onChange={(e) =>
                              handleProgresChange(s.nis, e.target.value)
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="Belum">Belum Lancar</option>
                            <option value="Lancar">Lancar</option>
                          </select>
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="shrink-0">
                          <span className="font-medium">Prestasi :</span>{" "}
                          {prestasi}
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-blue-200 bg-gray-200 px-3 py-2 text-[11px] text-purple-700">
                      Update tanggal{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= PAGINATION IQRA ================= */}
          {santriIqra.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
              <div className="text-xs text-gray-500">
                Menampilkan {startIndexIqra + 1}–
                {Math.min(startIndexIqra + itemsPerPage, santriIqra.length)}{" "}
                dari {santriIqra.length} santri
              </div>

              {totalPagesIqra > 1 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPageIqra((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPageIqra === 1}
                    className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>

                  {Array.from(
                    {
                      length: totalPagesIqra,
                    },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPageIqra(page)}
                      className={`px-3 py-1.5 text-xs rounded border ${
                        currentPageIqra === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPageIqra((prev) =>
                        Math.min(prev + 1, totalPagesIqra),
                      )
                    }
                    disabled={currentPageIqra === totalPagesIqra}
                    className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===================================================== */}
      {/* ================= TAB QURAN ========================= */}
      {/* ===================================================== */}

      {tab === "quran" && (
        <>
          <div className="w-[calc(100%+8px)] -ml-1 md:w-auto md:ml-0 md:rounded-2xl md:border md:border-gray-200 md:bg-white md:p-5 md:shadow-sm overflow-x-auto">
            {/* ================= FILTER QURAN ================= */}
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-stretch">
              {/* SEARCH */}
              <input
                type="text"
                placeholder="Cari santri / guru / surah..."
                value={searchQuran}
                onChange={(e) => {
                  setSearchQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className={`${inputCls} md:flex-[2]`}
              />

              {/* FILTER JUZ */}
              <select
                value={filterJuzQuran}
                onChange={(e) => {
                  setFilterJuzQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Juz</option>

                {[...Array(30)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Juz {i + 1}
                  </option>
                ))}
              </select>

              {/* FILTER SURAH */}
              <input
                type="text"
                placeholder="Filter Surah"
                value={filterSurahQuran}
                onChange={(e) => {
                  setFilterSurahQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className={`${inputCls} md:flex-1`}
              />

              {/* FILTER PROGRES */}
              <select
                value={filterProgresQuran}
                onChange={(e) => {
                  setFilterProgresQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Progres</option>
                <option value="Belum">Belum</option>
                <option value="Lancar">Lancar</option>
              </select>

              {/* FILTER PRESTASI */}
              <select
                value={filterPrestasiQuran}
                onChange={(e) => {
                  setFilterPrestasiQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className={`${inputCls} md:flex-1`}
              >
                <option value="">Semua Prestasi</option>
                <option value="Di-Lanjut">Di-Lanjut</option>
                <option value="Di-Ulang">Di-Ulang</option>
              </select>

              {/* SIMPAN */}
              <button
                type="button"
                onClick={handleSave}
                className="whitespace-nowrap rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 md:flex-none"
              >
                Simpan Data
              </button>
            </div>

            {/* ================= DESKTOP QURAN ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed text-sm text-gray-700">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold w-[11%]">Nama Santri</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">NIS</th>
                    <th className="px-3 py-3 font-semibold w-[11%]">Guru</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">NIG</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">Kelas</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">Juz</th>
                    <th className="px-3 py-3 font-semibold w-[12%]">Surah</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">Ayat</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">Hal.</th>
                    <th className="px-3 py-3 font-semibold w-[9%]">Progres</th>
                    <th className="px-3 py-3 font-semibold w-[7%]">Prestasi</th>
                    <th className="px-3 py-3 font-semibold w-[8%]">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingData ? (
                    <tr>
                      <td colSpan="12" className="p-0">
                        <SkeletonRows rows={6} cols={6} />
                      </td>
                    </tr>
                  ) : santriQuran.length === 0 ? (
                    <tr>
                      <td
                        colSpan="12"
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Tidak ada data santri Al-Qur’an
                      </td>
                    </tr>
                  ) : (
                    paginatedSantriQuran.map((s, i) => {
                      const namaGuru = progresData[`quran_guru_${s.nis}`] || "";

                      const dataGuru = guru.find(
                        (g) => g.nama_guru === namaGuru,
                      );

                      const progres =
                        progresData[`quran_progres_${s.nis}`] || "";

                      const prestasi =
                        progres === "Lancar"
                          ? "Di-Lanjut"
                          : progres === "Belum"
                            ? "Di-Ulang"
                            : "-";

                      return (
                        <tr
                          key={s.nis || i}
                          className="border-t border-gray-100 transition hover:bg-purple-50/40"
                        >
                          {/* NAMA */}
                          <td className="px-3 py-2 align-middle font-semibold truncate">
                            {s.nama}
                          </td>

                          {/* NIS */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {s.nis}
                          </td>

                          {/* GURU */}
                          <td className="px-3 py-2 align-middle">
                            <select
                              className={cellCls}
                              value={progresData[`quran_guru_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_guru_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Pilih Guru</option>

                              {guru.map((g, index) => (
                                <option
                                  key={g.nig || index}
                                  value={g.nama_guru}
                                >
                                  {g.nama_guru}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* NIG */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {dataGuru?.nig || "-"}
                          </td>

                          {/* KELAS */}
                          <td className="px-3 py-2 align-middle whitespace-nowrap">
                            {s.kelas || "-"}
                          </td>

                          {/* JUZ */}
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              className={numCls}
                              value={progresData[`quran_juz_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_juz_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          {/* SURAH */}
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="text"
                              className={cellCls}
                              value={progresData[`quran_surah_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_surah_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          {/* AYAT */}
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="number"
                              className={numCls}
                              value={progresData[`quran_ayat_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_ayat_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          {/* HALAMAN */}
                          <td className="px-3 py-2 align-middle">
                            <input
                              type="number"
                              className={numCls}
                              value={progresData[`quran_hal_${s.nis}`] || ""}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_hal_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            />
                          </td>

                          {/* PROGRES */}
                          <td className="px-3 py-2 align-middle">
                            <select
                              className={cellCls}
                              value={progres}
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_progres_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Pilih</option>
                              <option value="Belum">Belum</option>
                              <option value="Lancar">Lancar</option>
                            </select>
                          </td>

                          {/* PRESTASI */}
                          <td className="px-3 py-2 align-middle font-medium whitespace-nowrap">
                            {prestasi}
                          </td>

                          {/* UPDATE */}
                          <td className="px-3 py-2 align-middle text-gray-500 whitespace-nowrap">
                            {new Date().toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* ================= MOBILE QURAN ================= */}
            <div className="md:hidden space-y-3 mt-4">
              {loadingData ? (
                <SkeletonRows rows={4} cols={3} />
              ) : paginatedSantriQuran.map((s, i) => {
                const namaGuru = progresData[`quran_guru_${s.nis}`] || "-";

                const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

                const progres = progresData[`quran_progres_${s.nis}`] || "-";

                const prestasi =
                  progres === "Lancar"
                    ? "Di-Lanjut"
                    : progres === "Belum"
                      ? "Di-Ulang"
                      : "-";

                return (
                  <div
                    key={s.nis || i}
                    className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* HEADER */}
                    <div className="bg-gray-300 text-black text-center px-3 py-2.5">
                      <div className="font-bold text-sm leading-5">
                        {s.nama?.toUpperCase()}
                      </div>

                      <div className="text-xs leading-5">
                        NIS : {s.nis} | KELAS AL-QUR'AN
                      </div>
                    </div>

                    {/* DATA */}
                    <div className="px-3 py-3 text-xs text-gray-700 space-y-2">
                      {/* JUZ | SURAH */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Juz
                          </span>

                          <input
                            type="number"
                            min="1"
                            max="30"
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_juz_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_juz_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Surah
                          </span>

                          <input
                            type="text"
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_surah_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_surah_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* AYAT | HALAMAN */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Ayat
                          </span>

                          <input
                            type="number"
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_ayat_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_ayat_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Halaman
                          </span>

                          <input
                            type="number"
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_hal_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_hal_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* GURU | NIG */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Guru
                          </span>

                          <select
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_guru_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_guru_${s.nis}`,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Pilih Guru</option>

                            {guru.map((g, index) => (
                              <option key={g.nig || index} value={g.nama_guru}>
                                {g.nama_guru}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="shrink-0">
                          <span className="font-medium">NIG</span>{" "}
                          {dataGuru?.nig || "-"}
                        </div>
                      </div>

                      {/* PROGRES | PRESTASI */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <span className="font-medium whitespace-nowrap">
                            Progres :
                          </span>

                          <select
                            className={`flex-1 ${cellCls}`}
                            value={progresData[`quran_progres_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_progres_${s.nis}`,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="Belum">Belum Lancar</option>
                            <option value="Lancar">Lancar</option>
                          </select>
                        </div>

                        <span className="text-gray-400">|</span>

                        <div className="shrink-0">
                          <span className="font-medium">Prestasi :</span>{" "}
                          {prestasi}
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-blue-200 bg-gray-200 px-3 py-2 text-[11px] text-purple-700">
                      Update tanggal{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= PAGINATION QURAN ================= */}
          {santriQuran.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
              <div className="text-xs text-gray-500">
                Menampilkan {startIndexQuran + 1}–
                {Math.min(startIndexQuran + itemsPerPage, santriQuran.length)}{" "}
                dari {santriQuran.length} santri
              </div>

              {totalPagesQuran > 1 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPageQuran((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPageQuran === 1}
                    className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>

                  {Array.from(
                    {
                      length: totalPagesQuran,
                    },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPageQuran(page)}
                      className={`px-3 py-1.5 text-xs rounded border ${
                        currentPageQuran === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPageQuran((prev) =>
                        Math.min(prev + 1, totalPagesQuran),
                      )
                    }
                    disabled={currentPageQuran === totalPagesQuran}
                    className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

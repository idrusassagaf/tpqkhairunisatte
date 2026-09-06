import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MasterProgres() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("iqra");
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [progresData, setProgresData] = useState({});

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
        setProgresData(JSON.parse(savedData));
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
      const res = await api.get("/master-data");

      setSantri(res?.data?.data?.santri || []);
      setGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error("Gagal ambil master data:", err);
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progresData));

      // ================= SIMPAN IQRA =================
      for (const s of santriIqra) {
        const namaGuru = progresData[`guru_${s.nis}`] || "";

        const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

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
          nig: dataGuru?.nig || "",
          kelas: s.kelas,
          jilid: progresData[`jilid_${s.nis}`] || "",
          halaman: progresData[`hal_${s.nis}`] || "",
          progres: progres,
          prestasi: prestasi,
        });
      }

      // ================= SIMPAN AL-QURAN =================
      for (const s of santriQuran) {
        const namaGuru = progresData[`quran_guru_${s.nis}`] || "";

        const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

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
          nig: dataGuru?.nig || "",
          kelas: s.kelas,
          juz: progresData[`quran_juz_${s.nis}`] || "",
          surah: progresData[`quran_surah_${s.nis}`] || "",
          ayat: progresData[`quran_ayat_${s.nis}`] || "",
          halaman: progresData[`quran_hal_${s.nis}`] || "",
          progres: progres,
          prestasi: prestasi,
        });
      }

      alert("Data berhasil disimpan ke database");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
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
    <div className="space-y-4 p-4">
      {/* ================= TITLE ================= */}
      <h1 className="text-lg font-light text-black tracking-wide">
        MASTER PROGRES
      </h1>

      {/* ================= TAB ================= */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTab("iqra")}
          className={`px-4 py-2 rounded border text-sm ${
            tab === "iqra"
              ? "bg-purple-600 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Progres Iqra
        </button>

        <button
          type="button"
          onClick={() => setTab("quran")}
          className={`px-4 py-2 rounded border text-sm ${
            tab === "quran"
              ? "bg-purple-600 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Progres Al-Qur’an
        </button>
      </div>

      {/* ===================================================== */}
      {/* ================= TAB IQRA ========================== */}
      {/* ===================================================== */}

      {tab === "iqra" && (
        <>
          <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
            {/* ================= FILTER IQRA ================= */}
            <div className="mb-4 flex flex-col md:flex-row flex-wrap gap-2">
              {/* SEARCH */}
              <input
                type="text"
                placeholder="Cari santri / guru..."
                value={searchIqra}
                onChange={(e) => {
                  setSearchIqra(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className="border p-2 rounded w-full md:w-64 text-sm min-h-[44px]"
              />

              {/* FILTER JILID */}
              <select
                value={filterJilid}
                onChange={(e) => {
                  setFilterJilid(e.target.value);
                  setCurrentPageIqra(1);
                }}
                className="border p-2 rounded text-xs w-full md:w-auto min-h-[44px]"
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
                className="border p-2 rounded text-xs min-h-[44px]"
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
                className="border p-2 rounded text-xs min-h-[44px]"
              >
                <option value="">Semua Prestasi</option>
                <option value="Di-Lanjut">Di-Lanjut</option>
                <option value="Di-Ulang">Di-Ulang</option>
              </select>

              {/* SIMPAN */}
              <button
                type="button"
                onClick={handleSave}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs px-4 py-2 rounded min-h-[44px]"
              >
                Simpan Data
              </button>
            </div>

            {/* ================= DESKTOP IQRA ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed text-xs border border-gray-200">
                <thead className="bg-gray-100 text-left text-gray-900">
                  <tr>
                    <th className="p-1.5 border w-[15%]">Nama Santri</th>
                    <th className="p-1.5 border w-[8%]">NIS</th>
                    <th className="p-1.5 border w-[14%]">Guru</th>
                    <th className="p-1.5 border w-[8%]">NIG</th>
                    <th className="p-1.5 border w-[8%]">Kelas</th>
                    <th className="p-1.5 border w-[9%]">Jilid</th>
                    <th className="p-1.5 border w-[6%]">Hal.</th>
                    <th className="p-1.5 border w-[10%]">Progres</th>
                    <th className="p-1.5 border w-[8%]">Prestasi</th>
                    <th className="p-1.5 border w-[14%]">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {santriIqra.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="text-center p-4 text-gray-500"
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
                          className="border-t hover:bg-gray-50"
                        >
                          {/* NAMA */}
                          <td className="p-2 border align-middle font-semibold text-gray-800 truncate">
                            {s.nama}
                          </td>

                          {/* NIS */}
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {s.nis}
                          </td>

                          {/* GURU */}
                          <td className="p-2 border align-middle">
                            <select
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {dataGuru?.nig || "-"}
                          </td>

                          {/* KELAS */}
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {s.kelas || "-"}
                          </td>

                          {/* JILID */}
                          <td className="p-2 border align-middle">
                            <select
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <input
                              type="number"
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <select
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle font-medium whitespace-nowrap">
                            {prestasi}
                          </td>

                          {/* UPDATE */}
                          <td className="p-2 border align-middle text-gray-500 whitespace-nowrap">
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
            <div className="md:hidden space-y-4">
              {paginatedSantriIqra.map((s, i) => {
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
                    className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
                  >
                    <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                      {s.nama?.toUpperCase()}
                      <br />
                      NIS : {s.nis}
                    </div>

                    <div className="p-4 text-xs text-gray-700 space-y-4">
                      <div className="font-medium">
                        • Kelas : {s.kelas || "-"}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Jilid</div>

                        <div className="flex-1">
                          <select
                            className="border rounded-lg px-3 py-2 text-xs w-full"
                            value={progresData[`jilid_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `jilid_${s.nis}`,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Pilih Jilid</option>
                            <option value="Iqra 1">Iqra 1</option>
                            <option value="Iqra 2">Iqra 2</option>
                            <option value="Iqra 3">Iqra 3</option>
                            <option value="Iqra 4">Iqra 4</option>
                            <option value="Iqra 5">Iqra 5</option>
                            <option value="Iqra 6">Iqra 6</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Halaman</div>

                        <div className="flex-1">
                          <input
                            type="number"
                            className="border rounded-lg px-3 py-2 text-xs w-full"
                            placeholder="Masukkan halaman"
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

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 font-medium">• Guru</div>

                          <div className="flex-1">
                            <select
                              className="border rounded-lg px-3 py-2 text-xs w-full"
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
                          </div>
                        </div>

                        <div className="pl-[88px] text-[11px] text-gray-500">
                          NIG : {dataGuru?.nig || "-"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 font-medium">• Progres</div>

                          <div className="flex-1">
                            <select
                              className="border rounded-lg px-3 py-2 text-xs w-full"
                              value={progresData[s.nis] || ""}
                              onChange={(e) =>
                                handleProgresChange(s.nis, e.target.value)
                              }
                            >
                              <option value="">Pilih Progres</option>
                              <option value="Belum">Belum Lancar</option>
                              <option value="Lancar">Lancar</option>
                            </select>
                          </div>
                        </div>

                        <div className="pl-[88px] text-[11px] text-gray-500">
                          Prestasi :{" "}
                          <span className="font-medium">{prestasi}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-purple-700 border-t pt-3">
                        Update tanggal{" "}
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
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
          <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
            {/* ================= FILTER QURAN ================= */}
            <div className="mb-4 flex flex-col md:flex-row flex-wrap items-stretch gap-2">
              {/* SEARCH */}
              <input
                type="text"
                placeholder="Cari santri / guru / surah..."
                value={searchQuran}
                onChange={(e) => {
                  setSearchQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className="border p-2 rounded text-xs w-full md:w-64 min-h-[44px]"
              />

              {/* FILTER JUZ */}
              <select
                value={filterJuzQuran}
                onChange={(e) => {
                  setFilterJuzQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className="border p-2 rounded text-xs min-h-[44px]"
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
                className="border p-2 rounded text-xs min-h-[44px]"
              />

              {/* FILTER PROGRES */}
              <select
                value={filterProgresQuran}
                onChange={(e) => {
                  setFilterProgresQuran(e.target.value);
                  setCurrentPageQuran(1);
                }}
                className="border p-2 rounded text-xs min-h-[44px]"
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
                className="border p-2 rounded text-xs min-h-[44px]"
              >
                <option value="">Semua Prestasi</option>
                <option value="Di-Lanjut">Di-Lanjut</option>
                <option value="Di-Ulang">Di-Ulang</option>
              </select>

              {/* SIMPAN */}
              <button
                type="button"
                onClick={handleSave}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs px-4 py-2 rounded min-h-[44px]"
              >
                Simpan Data
              </button>
            </div>

            {/* ================= DESKTOP QURAN ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed border text-xs">
                <thead className="bg-gray-100 text-left text-gray-900">
                  <tr>
                    <th className="p-1.5 border w-[13%]">Nama Santri</th>
                    <th className="p-1.5 border w-[7%]">NIS</th>
                    <th className="p-1.5 border w-[12%]">Guru</th>
                    <th className="p-1.5 border w-[7%]">NIG</th>
                    <th className="p-1.5 border w-[7%]">Kelas</th>
                    <th className="p-1.5 border w-[5%]">Juz</th>
                    <th className="p-1.5 border w-[14%]">Surah</th>
                    <th className="p-1.5 border w-[5%]">Ayat</th>
                    <th className="p-1.5 border w-[5%]">Hal.</th>
                    <th className="p-1.5 border w-[9%]">Progres</th>
                    <th className="p-1.5 border w-[7%]">Prestasi</th>
                    <th className="p-1.5 border w-[9%]">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {santriQuran.length === 0 ? (
                    <tr>
                      <td
                        colSpan="12"
                        className="text-center p-4 text-gray-500"
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
                          className="border-t hover:bg-gray-50"
                        >
                          {/* NAMA */}
                          <td className="p-2 border align-middle font-semibold truncate">
                            {s.nama}
                          </td>

                          {/* NIS */}
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {s.nis}
                          </td>

                          {/* GURU */}
                          <td className="p-2 border align-middle">
                            <select
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {dataGuru?.nig || "-"}
                          </td>

                          {/* KELAS */}
                          <td className="p-2 border align-middle whitespace-nowrap">
                            {s.kelas || "-"}
                          </td>

                          {/* JUZ */}
                          <td className="p-2 border align-middle">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <input
                              type="text"
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <input
                              type="number"
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <input
                              type="number"
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle">
                            <select
                              className="border p-1.5 rounded text-xs w-full min-w-0"
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
                          <td className="p-2 border align-middle font-medium whitespace-nowrap">
                            {prestasi}
                          </td>

                          {/* UPDATE */}
                          <td className="p-2 border align-middle text-gray-500 whitespace-nowrap">
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
            <div className="md:hidden space-y-4 mt-4">
              {paginatedSantriQuran.map((s, i) => {
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
                    className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
                  >
                    <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                      {s.nama?.toUpperCase()}
                      <br />
                      NIS : {s.nis}
                    </div>

                    <div className="p-4 text-xs text-gray-700 space-y-4">
                      <div className="font-medium">
                        • Kelas : {s.kelas || "-"}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Juz</div>

                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            className="border rounded-lg px-3 py-2 text-xs w-full"
                            value={progresData[`quran_juz_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_juz_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Surah</div>

                        <div className="flex-1">
                          <input
                            type="text"
                            className="border rounded-lg px-3 py-2 text-xs w-full"
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

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Ayat</div>

                        <div className="flex-1">
                          <input
                            type="number"
                            className="border rounded-lg px-3 py-2 text-xs w-full"
                            value={progresData[`quran_ayat_${s.nis}`] || ""}
                            onChange={(e) =>
                              handleProgresChange(
                                `quran_ayat_${s.nis}`,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Halaman</div>

                        <div className="flex-1">
                          <input
                            type="number"
                            className="border rounded-lg px-3 py-2 text-xs w-full"
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

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 font-medium">• Guru</div>

                          <div className="flex-1">
                            <select
                              className="border rounded-lg px-3 py-2 text-xs w-full"
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
                          </div>
                        </div>

                        <div className="pl-[88px] text-[11px] text-gray-500">
                          NIG : {dataGuru?.nig || "-"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 font-medium">• Progres</div>

                          <div className="flex-1">
                            <select
                              className="border rounded-lg px-3 py-2 text-xs w-full"
                              value={
                                progresData[`quran_progres_${s.nis}`] || ""
                              }
                              onChange={(e) =>
                                handleProgresChange(
                                  `quran_progres_${s.nis}`,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Pilih Progres</option>
                              <option value="Belum">Belum</option>
                              <option value="Lancar">Lancar</option>
                            </select>
                          </div>
                        </div>

                        <div className="pl-[88px] text-[11px] text-gray-500">
                          Prestasi :{" "}
                          <span className="font-medium">{prestasi}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-purple-700 border-t pt-3">
                        Update tanggal{" "}
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
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

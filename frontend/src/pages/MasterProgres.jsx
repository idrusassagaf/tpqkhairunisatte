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
  const [searchIqra, setSearchIqra] = useState("");
  const [filterJilid, setFilterJilid] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");
  const [searchQuran, setSearchQuran] = useState("");
  const [filterJuzQuran, setFilterJuzQuran] = useState("");
  const [filterSurahQuran, setFilterSurahQuran] = useState("");
  const [filterProgresQuran, setFilterProgresQuran] = useState("");
  const [filterPrestasiQuran, setFilterPrestasiQuran] = useState("");
  const STORAGE_KEY = "tpq_progres_iqra";
  console.log(localStorage.getItem(STORAGE_KEY));
  useEffect(() => {
    fetchData();
  }, []);

  // ================= LOAD DATA =================
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      setProgresData(JSON.parse(savedData));
    }
  }, []);

  // ================= AUTO SAVE =================

  const handleProgresChange = (id, value) => {
    setProgresData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

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

      // ================= SIMPAN AL-QUR'AN =================
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

    if (!saved) return 0;

    const data = JSON.parse(saved);

    return Object.values(data).filter((item) => item.progres === status).length;
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");

      setSantri(res?.data?.data?.santri || []);
      setGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error("Gagal ambil master data:", err);
    }
  };

  // ================= FILTER IQRA ONLY =================
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

    // SEARCH
    const keyword = searchIqra.toLowerCase();

    const cocokSearch = `
    ${s.nama || ""}
    ${guruDipilih}
  `
      .toLowerCase()
      .includes(keyword);

    // FILTER
    const cocokJilid = !filterJilid || jilidDipilih === filterJilid;

    const cocokProgres = !filterProgres || progresDipilih === filterProgres;

    const cocokPrestasi = !filterPrestasi || prestasi === filterPrestasi;

    return isIqra && cocokSearch && cocokJilid && cocokProgres && cocokPrestasi;
  });

  // ================= PRESTASI AUTO =================
  const getPrestasi = (progres, jilid) => {
    if (progres === "Lancar" && jilid === "Iqra 6") return "Sangat Baik";
    if (progres === "Lancar") return "Baik";
    if (progres === "Proses") return "Cukup";
    return "-";
  };

  // ================= FILTER QURAN ONLY =================
  const santriQuran = santri.filter((s) => {
    const isQuran =
      (s.kelas || "").trim().toLowerCase() === "al quran" ||
      (s.kelas || "").trim().toLowerCase() === "alquran" ||
      (s.kelas || "").trim().toLowerCase() === "al-qur'an";

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

    // SEARCH
    const keyword = searchQuran.toLowerCase();

    const cocokSearch = `
    ${s.nama || ""}
    ${guruDipilih}
    ${surahDipilih}
  `
      .toLowerCase()
      .includes(keyword);

    // FILTER
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

  return (
    <div className="space-y-4 p-4">
      {/* TITLE */}
      <h1 className="text-lg font-light text-black tracking-wide">
        MASTER PROGRES
      </h1>

      {/* ================= TAB ================= */}
      <div className="flex gap-2 flex-wrap">
        <button
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

      {/* ================= IQRA ================= */}
      {tab === "iqra" && (
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <div className="mb-4 flex flex-col md:flex-row flex-wrap gap-2">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Cari santri / guru..."
              value={searchIqra}
              onChange={(e) => setSearchIqra(e.target.value)}
              className="border p-2 rounded w-full md:w-64 text-sm min-h-[44px]"
            />

            {/* FILTER JILID */}
            <select
              value={filterJilid}
              onChange={(e) => setFilterJilid(e.target.value)}
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
              onChange={(e) => setFilterProgres(e.target.value)}
              className="border p-2 rounded text-xs"
            >
              <option value="">Semua Progres</option>
              <option value="Lancar">Lancar</option>
              <option value="Belum">Belum</option>
            </select>

            {/* FILTER PRESTASI */}
            <select
              value={filterPrestasi}
              onChange={(e) => setFilterPrestasi(e.target.value)}
              className="border p-2 rounded text-xs"
            >
              <option value="">Semua Prestasi</option>
              <option value="Di-Lanjut">Di-Lanjut</option>
              <option value="Di-Ulang">Di-Ulang</option>
            </select>
            {/* BUTTON SIMPAN */}
            <button
              onClick={handleSave}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs px-4 py-2 rounded"
            >
              Simpan Data
            </button>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 text-left text-gray-900">
                <tr>
                  <th className="p-2 min-w-[170px]">Nama Santri</th>
                  <th className="p-2 min-w-[70px]">NIS</th>
                  <th className="p-2 min-w-[150px]">Guru</th>
                  <th className="p-2 min-w-[70px]">NIG</th>
                  <th className="p-2 min-w-[60px]">Kelas</th>
                  <th className="p-2 min-w-[90px]">Jilid</th>
                  <th className="p-2 min-w-[20px]">Hal.</th>
                  <th className="p-2 min-w-[100px]">Progres</th>
                  <th className="p-2 min-w-[80px]">Prestasi</th>
                  <th className="p-2 min-w-[100px]">Update</th>
                </tr>
              </thead>

              <tbody>
                {santriIqra.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-4 text-gray-500">
                      Tidak ada data santri Iqra
                    </td>
                  </tr>
                ) : (
                  santriIqra.map((s, i) => (
                    <tr key={i} className="border-t">
                      {/* NAMA */}
                      <td className="p-2 text-xs font-semibold text-gray-800">
                        {s.nama}
                      </td>

                      {/* NIS */}
                      <td className="p-2 text-xs">{s.nis}</td>

                      {/* GURU */}
                      <td className="p-2">
                        <select
                          className="border p-1 rounded text-xs w-full"
                          value={progresData[`guru_${s.nis}`] || ""}
                          onChange={(e) =>
                            handleProgresChange(`guru_${s.nis}`, e.target.value)
                          }
                        >
                          <option value="">Pilih Guru</option>

                          {guru.map((g, i) => (
                            <option key={i} value={g.nama_guru}>
                              {g.nama_guru}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* NIG */}
                      <td className="p-2 text-xs">
                        {guru.find(
                          (g) => g.nama_guru === progresData[`guru_${s.nis}`],
                        )?.nig || "-"}
                      </td>

                      {/* KELAS */}
                      <td className="p-2 text-xs">{s.kelas || "-"}</td>

                      {/* JILID */}
                      <td className="p-2">
                        <select
                          className="border p-1 rounded text-xs w-full"
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
                      <td className="p-2">
                        <input
                          type="number"
                          className="border p-1 w-16 rounded text-xs"
                          placeholder="0"
                          value={progresData[`hal_${s.nis}`] || ""}
                          onChange={(e) =>
                            handleProgresChange(`hal_${s.nis}`, e.target.value)
                          }
                        />
                      </td>

                      {/* PROGRES */}
                      <td className="p-2">
                        <select
                          className="border p-1 rounded text-xs w-full"
                          value={progresData[s.nis] || ""}
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
                      <td className="p-2 text-xs font-medium">
                        {progresData[s.nis] === "Lancar"
                          ? "Di-Lanjut"
                          : progresData[s.nis] === "Belum"
                            ? "Di-Ulang"
                            : "-"}
                      </td>

                      {/* UPDATE TGL */}
                      <td className="p-2 text-xs text-gray-500">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MOBILE IQRA ================= */}
      {tab === "iqra" && (
        <div className="md:hidden space-y-4">
          {santriIqra.map((s, i) => {
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
                key={i}
                className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
              >
                {/* HEADER */}
                <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                  {s.nama?.toUpperCase()}
                  <br />
                  NIS : {s.nis}
                </div>

                {/* BODY */}
                <div className="p-4 text-xs text-gray-700 space-y-4">
                  <div className="font-medium">• Kelas : {s.kelas || "-"}</div>

                  {/* JILID */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-medium">• Jilid</div>

                    <div className="flex-1">
                      <select
                        className="border rounded-lg px-3 py-2 text-xs w-full"
                        value={progresData[`jilid_${s.nis}`] || ""}
                        onChange={(e) =>
                          handleProgresChange(`jilid_${s.nis}`, e.target.value)
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

                  {/* HALAMAN */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 font-medium">• Halaman</div>

                    <div className="flex-1">
                      <input
                        type="number"
                        className="border rounded-lg px-3 py-2 text-xs w-full"
                        placeholder="Masukkan halaman"
                        value={progresData[`hal_${s.nis}`] || ""}
                        onChange={(e) =>
                          handleProgresChange(`hal_${s.nis}`, e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* GURU */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 font-medium">• Guru</div>

                      <div className="flex-1">
                        <select
                          className="border rounded-lg px-3 py-2 text-xs w-full"
                          value={progresData[`guru_${s.nis}`] || ""}
                          onChange={(e) =>
                            handleProgresChange(`guru_${s.nis}`, e.target.value)
                          }
                        >
                          <option value="">Pilih Guru</option>

                          {guru.map((g, index) => (
                            <option key={index} value={g.nama_guru}>
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

                  {/* PROGRES */}
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
                      Prestasi : <span className="font-medium">{prestasi}</span>
                    </div>
                  </div>

                  {/* UPDATE */}
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
      )}

      {/* ================= TAB QURAN ================= */}
      {tab === "quran" && (
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <div className="mb-4 item-center flex-wrap gap-2 flex">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Cari santri / guru / surah..."
              value={searchQuran}
              onChange={(e) => setSearchQuran(e.target.value)}
              className="border p-2 rounded text-xs w-54"
            />

            {/* FILTER JUZ */}
            <select
              value={filterJuzQuran}
              onChange={(e) => setFilterJuzQuran(e.target.value)}
              className="border p-2 rounded text-xs"
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
              onChange={(e) => setFilterSurahQuran(e.target.value)}
              className="border p-2 rounded text-xs"
            />

            {/* FILTER PROGRES */}
            <select
              value={filterProgresQuran}
              onChange={(e) => setFilterProgresQuran(e.target.value)}
              className="border p-2 rounded text-xs"
            >
              <option value="">Semua Progres</option>
              <option value="Belum">Belum</option>
              <option value="Lancar">Lancar</option>
            </select>

            {/* FILTER PRESTASI */}
            <select
              value={filterPrestasiQuran}
              onChange={(e) => setFilterPrestasiQuran(e.target.value)}
              className="border p-2 rounded text-xs"
            >
              <option value="">Semua Prestasi</option>
              <option value="Di-Lanjut">Di-Lanjut</option>
              <option value="Di-Ulang">Di-Ulang</option>
            </select>

            {/* BUTTON */}
            <button
              onClick={handleSave}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs px-4 py-2 rounded"
            >
              Simpan Data
            </button>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-auto border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 w-[18%]">Nama Santri</th>
                  <th className="p-3 w-[8%]">NIS</th>
                  <th className="p-3 w-[18%]">Guru</th>
                  <th className="p-3 w-[10%]">Kelas</th>
                  <th className="p-3 w-[7%]">Juz</th>
                  <th className="p-3 w-[14%]">Surah</th>
                  <th className="p-3 w-[7%]">Ayat</th>
                  <th className="p-3 w-[7%]">Hal.</th>
                  <th className="p-3 w-[10%]">Progres</th>
                  <th className="p-3 w-[10%]">Prestasi</th>
                  <th className="p-3 w-[12%]">Update</th>
                </tr>
              </thead>

              <tbody>
                {santriQuran.map((s, i) => {
                  const progres = progresData[`quran_progres_${s.nis}`] || "";

                  const prestasi =
                    progres === "Lancar"
                      ? "Di-Lanjut"
                      : progres === "Belum"
                        ? "Di-Ulang"
                        : "-";

                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-semibold text-xs">{s.nama}</td>

                      <td className="p-2 text-xs">{s.nis}</td>

                      {/* GURU */}
                      <td className="p-2">
                        <select
                          className="border px-3 py-2 rounded text-xs w-full"
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
                            <option key={index} value={g.nama_guru}>
                              {g.nama_guru}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* KELAS */}
                      <td className="p-2 text-xs">{s.kelas}</td>

                      {/* JUZ */}
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-3 py-2 rounded text-xs w-full"
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
                      <td className="p-2">
                        <input
                          type="text"
                          className="border px-3 py-2 rounded text-xs w-full"
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
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-3 py-2 rounded text-xs w-full"
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
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-3 py-2 rounded text-xs w-full"
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
                      <td className="p-2">
                        <select
                          className="border px-3 py-2 rounded text-xs w-full"
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
                      <td className="p-2 text-xs font-medium">{prestasi}</td>

                      {/* UPDATE */}
                      <td className="p-2 text-xs text-gray-500">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE QURAN ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {santriQuran.map((s, i) => {
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
                  key={i}
                  className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
                >
                  {/* HEADER */}
                  <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                    {s.nama?.toUpperCase()}
                    <br />
                    NIS : {s.nis}
                  </div>

                  {/* BODY */}
                  <div className="p-4 text-xs text-gray-700 space-y-4">
                    <div className="font-medium">
                      • Kelas : {s.kelas || "-"}
                    </div>

                    {/* JUZ */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 font-medium">• Juz</div>

                      <div className="flex-1">
                        <input
                          type="number"
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

                    {/* SURAH */}
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

                    {/* AYAT */}
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

                    {/* HALAMAN */}
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

                    {/* GURU */}
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
                              <option key={index} value={g.nama_guru}>
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

                    {/* PROGRES */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 font-medium">• Progres</div>

                        <div className="flex-1">
                          <select
                            className="border rounded-lg px-3 py-2 text-xs w-full"
                            value={progres}
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

                    {/* UPDATE */}
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
      )}
    </div>
  );
}

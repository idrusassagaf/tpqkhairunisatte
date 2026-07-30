import { useEffect, useState } from "react";
import { api } from "../api";

export default function ProgresQuran() {
  const [dataQuran, setDataQuran] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("");
  const [filterSurah, setFilterSurah] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ambil data santri
      const res = await api.get("/master-data");

      const santri = res?.data?.data?.santri || [];

      // ambil progres dari localStorage
      const saved = localStorage.getItem("tpq_progres_iqra");

      const progresData = saved ? JSON.parse(saved) : {};

      // filter khusus kelas quran
      const santriQuran = santri.filter((s) => {
        return (
          (s.kelas || "").trim().toLowerCase() === "al quran" ||
          (s.kelas || "").trim().toLowerCase() === "alquran" ||
          (s.kelas || "").trim().toLowerCase() === "al-qur'an"
        );
      });

      // gabungkan data
      const hasil = santriQuran.map((s) => {
        const progres = progresData[`quran_progres_${s.nis}`] || "";

        return {
          nama: s.nama || "-",

          nis: s.nis || "-",

          kelas: s.kelas || "-",

          guru: progresData[`quran_guru_${s.nis}`] || "-",

          juz: progresData[`quran_juz_${s.nis}`] || "-",

          surah: progresData[`quran_surah_${s.nis}`] || "-",

          ayat: progresData[`quran_ayat_${s.nis}`] || "-",

          halaman: progresData[`quran_hal_${s.nis}`] || "-",

          progres: progres || "-",

          prestasi:
            progres === "Lancar"
              ? "Di-Lanjut"
              : progres === "Belum"
                ? "Di-Ulang"
                : "-",

          update: new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        };
      });

      setDataQuran(hasil);
      setFilteredData(hasil);
    } catch (err) {
      console.error("Gagal ambil data progres quran:", err);
    }
  };

  useEffect(() => {
    const hasilFilter = dataQuran.filter((d) => {
      const keyword = search.toLowerCase();
      const cocokSearch = `
      ${d.nama || ""}
      ${d.nis || ""}
      ${d.guru || ""}
      ${d.surah || ""}
    `
        .toLowerCase()
        .includes(keyword);

      const cocokJuz = !filterJuz || String(d.juz) === String(filterJuz);
      const cocokSurah =
        !filterSurah ||
        (d.surah || "").toLowerCase().includes(filterSurah.toLowerCase());
      const cocokProgres = !filterProgres || d.progres === filterProgres;
      const cocokPrestasi = !filterPrestasi || d.prestasi === filterPrestasi;

      return (
        cocokSearch && cocokJuz && cocokSurah && cocokProgres && cocokPrestasi
      );
    });

    setFilteredData(hasilFilter);
  }, [
    dataQuran,
    search,
    filterJuz,
    filterSurah,
    filterProgres,
    filterPrestasi,
  ]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg tracking-wider font-light text-black mb-4">
        PROGRES AL'QURAN
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Cari santri / guru / surah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded text-xs w-64"
        />

        {/* FILTER JUZ */}
        <select
          value={filterJuz}
          onChange={(e) => setFilterJuz(e.target.value)}
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
          value={filterSurah}
          onChange={(e) => setFilterSurah(e.target.value)}
          className="border p-2 rounded text-xs"
        />

        {/* FILTER PROGRES */}
        <select
          value={filterProgres}
          onChange={(e) => setFilterProgres(e.target.value)}
          className="border p-2 rounded text-xs"
        >
          <option value="">Semua Progres</option>
          <option value="Belum">Belum</option>
          <option value="Lancar">Lancar</option>
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
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nama Santri</th>
              <th className="p-2 border">NIS</th>
              <th className="p-2 border">Guru</th>
              <th className="p-2 border">Kelas</th>
              <th className="p-2 border">Juz</th>
              <th className="p-2 border">Surah</th>
              <th className="p-2 border">Ayat</th>
              <th className="p-2 border">Halaman</th>
              <th className="p-2 border">Progres</th>
              <th className="p-2 border">Prestasi</th>
              <th className="p-2 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  Belum ada data progres Qur'an
                </td>
              </tr>
            ) : (
              filteredData.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 border font-semibold">{d.nama}</td>
                  <td className="p-2 border">{d.nis}</td>
                  <td className="p-2 border">{d.guru}</td>
                  <td className="p-2 border">{d.kelas}</td>
                  <td className="p-2 border">{d.juz}</td>
                  <td className="p-2 border">{d.surah}</td>
                  <td className="p-2 border">{d.ayat}</td>
                  <td className="p-2 border">{d.halaman}</td>
                  <td className="p-2 border">{d.progres}</td>
                  <td className="p-2 border">{d.prestasi}</td>
                  <td className="p-2 border text-xs text-gray-500">
                    {d.update}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500">
            Belum ada data progres Qur'an
          </div>
        ) : (
          filteredData.map((d, i) => (
            <div
              key={i}
              className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
            >
              {/* HEADER */}
              <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                {d.nama?.toUpperCase()}
                <br />
                NIS : {d.nis} | Kelas {d.kelas}
              </div>

              {/* BODY */}
              <div className="p-2 text-sm text-gray-700 space-y-1 text-center">
                {/* BARIS 1 */}
                <div>
                  {" "}
                  <b>SURAH : {d.surah.toUpperCase()}</b>
                </div>
                {/* BARIS 2 */}
                <div>
                  | Juz {d.juz} | Ayat {d.ayat || "-"} | Halaman {d.halaman} |
                </div>
                {/* BARIS 3 */}
                <div>
                  Guru : <b>{d.guru || "-"}</b>
                </div>
                {/* BARIS 4 */}
                <div>
                  Progres <b>{d.progres.toUpperCase()}</b> maka prestasi belajar
                  santri harus <b>{d.prestasi.toUpperCase()}</b>
                </div>
                {/* UPDATE */}
                <div className="text-[11px] text-purple-700 border-t pt-3">
                  Update tanggal {d.update}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

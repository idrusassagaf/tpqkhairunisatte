import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { Skeleton, SkeletonRows } from "../components/Skeleton";
import { Eye, BookOpen } from "lucide-react";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";
import { useNavigate } from "react-router-dom";

export default function MasterHafalan() {
  const [loading, setLoading] = useState(true);
  const [santri, setSantri] = useState([]);
  const [progresHafalan, setProgresHafalan] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();

  // =========================================================
  // 46 JENIS HAFALAN
  //
  // HARUS SAMA DENGAN ProgresHafalanSantri.jsx
  // =========================================================

  const jenisHafalan = [
    "Doa sebelum belajar mengaji",
    "Doa sesudah belajar mengaji",
    "Doa berwudhu",
    "Doa sesudah berwudhu",
    "Doa sesudah Azan",
    "Doa menjawab iqamah",
    "Niat shalat Dhuhur",
    "Niat shalat Ashar",
    "Niat shalat Maghrib",
    "Niat shalat Isya",
    "Niat shalat Subuh",
    "Doa Doa Iftitah",
    "Doa ketika ruku",
    "Doa ketika i'tidal",
    "Doa ketika sujud",
    "Doa duduk diantara dua sujud",
    "Doa tahyatul awal",
    "Doa tahyatul akhir",
    "Doa Qunut",
    "Doa sebelum tidur",
    "Doa bangun tidur",
    "Doa masuk kamar mandi",
    "Doa keluar kamar mandi",
    "Doa bersuci dari hadast kecil",
    "Doa mandi janabah",
    "Doa mandi hari jumat",
    "Doa ketika bercermin",
    "Doa ketika masuk rumah",
    "Doa keluar rumah",
    "Doa masuk masjid",
    "Doa keluar masjid",
    "Doa naik kendaraan bepergian",
    "Doa sebelum makan",
    "Doa sesudah makan",
    "Doa untuk orangtua",
    "Doa selamat dunia dan akhirat",
    "Doa memohon ampunan",
    "Doa syifa (kesembuhan)",
    "Niat berpuasa Ramadhan",
    "Niat membayar hutang puasa Ramadhan",
    "Doa berbuka puasa",
    "Ayat Kursi",
    "Niat shalat witir",
    "Niat shalat tarawih",
    "Dzikir tauhid",
    "Bacaan salam kepada Rasulullah SAW dan Keluarga",
  ];

  // =========================================================
  // NORMALISASI NAMA JENIS HAFALAN
  //
  // Sama seperti pencocokan di ProgresHafalanSantri.jsx:
  // huruf besar/kecil dan spasi awal/akhir diabaikan.
  // =========================================================

  const normalizeJenisHafalan = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // AMBIL DATA MASTER + PROGRES HAFALAN DARI DATABASE
  // =========================================================

  const fetchData = useCallback(async () => {
    try {
      const [masterRes, hafalanRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/progres-hafalan"),
      ]);

      const dataSantri = masterRes?.data?.data?.santri || [];
      const dataHafalan = hafalanRes?.data?.data || [];

      setSantri(dataSantri);
      setProgresHafalan(Array.isArray(dataHafalan) ? dataHafalan : []);
    } catch (err) {
      console.error("Gagal ambil data master hafalan:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // =======================================================
    // Jika kembali ke halaman ini dari halaman detail,
    // refresh data agar jumlah selalu mengikuti database.
    // =======================================================

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchData]);

  // =========================================================
  // BENTUKKAN DATA HAFALAN PER SANTRI
  //
  // SATU NIS + SATU JENIS HAFALAN = SATU DATA
  //
  // Ini mengikuti konsep ProgresHafalanSantri.jsx yang
  // menempatkan setiap jenis hafalan ke satu index dari 46.
  //
  // API /progres-hafalan menggunakan latest(), sehingga data
  // yang datang lebih baru berada di depan.
  // Karena itu data pertama untuk jenis yang sama dipakai.
  // =========================================================

  const getHafalanSantri = (nis) => {
    const hasil = {};

    const dataSantri = progresHafalan.filter(
      (item) => String(item?.nis || "") === String(nis || ""),
    );

    dataSantri.forEach((item) => {
      const jenisDatabase = normalizeJenisHafalan(item?.jenis_hafalan);

      if (!jenisDatabase) {
        return;
      }

      const index = jenisHafalan.findIndex(
        (jenis) => normalizeJenisHafalan(jenis) === jenisDatabase,
      );

      if (index === -1) {
        return;
      }

      // Jangan menimpa data yang sudah ditemukan.
      // Endpoint backend menggunakan latest(), sehingga
      // item pertama adalah data terbaru.
      if (!hasil[index]) {
        hasil[index] = item;
      }
    });

    return hasil;
  };

  // =========================================================
  // HITUNG HAFALAN
  //
  // HANYA MENGHITUNG HAFALAN UNIK DARI 46 JENIS.
  // =========================================================

  const getJumlahHafalan = (nis, status) => {
    const dataSantri = getHafalanSantri(nis);

    return Object.values(dataSantri).filter((item) => item?.progres === status)
      .length;
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredSantri = santri.filter((s) => {
    const keyword = search.toLowerCase();

    return `
    ${s.nama || ""}
    ${s.nis || ""}
    ${s.kelas || ""}
  `
      .toLowerCase()
      .includes(keyword);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(filteredSantri.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentSantri = filteredSantri.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 overflow-x-hidden p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <BookOpen size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Master Hafalan</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Rekap jumlah hafalan yang sudah dan belum lancar setiap santri.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* SEARCH */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Cari nama / NIS / kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} md:w-72`}
          />

          {santri.length > 0 && (
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {filteredSantri.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredSantri.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">
                {filteredSantri.length}
              </span>{" "}
              santri
            </div>
          )}
        </div>

        {/* TABLE DESKTOP */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-semibold">No.</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Santri</th>
                <th className="px-4 py-3 text-left font-semibold">NIS</th>
                <th className="px-4 py-3 text-left font-semibold">Kelas</th>
                <th className="px-4 py-3 text-center font-semibold">Sudah Lancar</th>
                <th className="px-4 py-3 text-center font-semibold">Belum Lancar</th>
                <th className="px-4 py-3 text-center font-semibold">Lihat Hafalan</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-0">
                    <SkeletonRows rows={6} cols={5} />
                  </td>
                </tr>
              ) : santri.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Data santri belum tersedia
                  </td>
                </tr>
              ) : currentSantri.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Data santri tidak ditemukan
                  </td>
                </tr>
              ) : (
                currentSantri.map((s, i) => (
                  <tr
                    key={s.nis || i}
                    className="border-t border-gray-100 transition hover:bg-purple-50/40"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {startIndex + i + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">{s.nama}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{s.nis}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{s.kelas || "-"}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {getJumlahHafalan(s.nis, "Lancar")} Hafalan
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        {getJumlahHafalan(s.nis, "Belum")} Hafalan
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        aria-label={`Lihat hafalan ${s.nama}`}
                        onClick={() => navigate(`/dashboard/master-hafalan/${s.nis}`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 transition hover:bg-purple-100"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <SkeletonRows rows={4} cols={3} />
          ) : currentSantri.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {santri.length === 0
                ? "Data santri belum tersedia"
                : "Data santri tidak ditemukan"}
            </div>
          ) : (
            currentSantri.map((s, i) => {
              const lancar = getJumlahHafalan(s.nis, "Lancar");
              const belum = getJumlahHafalan(s.nis, "Belum");

              return (
                <div
                  key={s.nis || i}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <span className="font-semibold text-gray-500">
                          {startIndex + i + 1}.
                        </span>

                        <span className="truncate font-semibold text-gray-900">
                          {s.nama}
                        </span>
                      </div>

                      <div className="mt-1 ml-6 text-xs text-gray-500">
                        NIS {s.nis} · Kelas {s.kelas || "-"}
                      </div>

                      <div className="mt-3 ml-6 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          {lancar} Lancar
                        </span>

                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          {belum} Belum
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Lihat hafalan ${s.nama}`}
                      onClick={() => navigate(`/dashboard/master-hafalan/${s.nis}`)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 transition hover:bg-purple-100"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] rounded-lg border px-3 py-1.5 text-xs transition ${
                      currentPage === page
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

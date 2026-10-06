import TableLoadingRow from "../components/TableLoadingRow";
import useSedangMemuat from "../hooks/useSedangMemuat";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MasterHafalan() {
  const sedangMemuat = useSedangMemuat();

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
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-2xl shadow p-0 overflow-x-auto">
        {/* TITLE */}

        <h1 className="text-lg font-light tracking-wide text-black ml-2 mb-4">
          MASTER HAFALAN
        </h1>

        {/* SEARCH */}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama / NIS / kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              border rounded-lg px-3 py-2
              text-sm w-full md:w-72
              focus:outline-none focus:ring-2
              focus:ring-purple-300
            "
          />
        </div>

        {/* TABLE DESKTOP */}

        <table className="hidden md:table w-full border text-xs text-black">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-1 border w-16">No.</th>
              <th className="p-1 border">Nama Santri</th>
              <th className="p-1 border">NIS</th>
              <th className="p-1 border">Kelas</th>
              <th className="p-1 border text-center">Sudah Lancar</th>
              <th className="p-1 border text-center">Belum Lancar</th>
              <th className="p-1 border text-center">Lihat Hafalan</th>
            </tr>
          </thead>

          <tbody>
            {sedangMemuat ? (
              <TableLoadingRow colSpan={8} />
            ) : (
              <>
                {santri.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      Data santri belum tersedia
                    </td>
                  </tr>
                ) : currentSantri.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      Data santri tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  currentSantri.map((s, i) => (
                    <tr key={s.nis || i} className="border-t hover:bg-gray-50">
                      <td className="p-1 border text-center">
                        {startIndex + i + 1}
                      </td>

                      <td className="p-1 border font-medium">{s.nama}</td>

                      <td className="p-1 border">{s.nis}</td>

                      <td className="p-1 border">{s.kelas}</td>

                      <td className="p-1 border text-center font-medium text-green-700">
                        {getJumlahHafalan(s.nis, "Lancar")}-Hafalan
                      </td>

                      <td className="p-1 border text-center font-medium text-red-700">
                        {getJumlahHafalan(s.nis, "Belum")}-Hafalan
                      </td>

                      <td className="p-1 border text-center">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/master-hafalan/${s.nis}`)
                          }
                          className="
                        inline-flex items-center justify-center
                        w-7 h-7 rounded-full
                        bg-purple-100 hover:bg-purple-200
                        text-purple-700 transition
                      "
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>

        {/* MOBILE CARD */}

        <div className="md:hidden space-y-3 mt-4">
          {currentSantri.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
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
                  className="
                    bg-white
                    border
                    rounded-2xl
                    shadow-sm
                    p-3
                  "
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2">
                        <span className="font-semibold text-black">
                          {startIndex + i + 1}.
                        </span>

                        <span
                          className="
                            font-semibold
                            text-black
                            truncate
                          "
                        >
                          {s.nama}
                        </span>
                      </div>

                      <div
                        className="
                          text-xs
                          text-gray-600
                          mt-1
                          ml-6
                        "
                      >
                        NIS {s.nis} | K-{s.kelas}
                      </div>
                    </div>

                    <div
                      className="
                        text-center
                        text-xs
                        font-semibold
                        min-w-[50px]
                      "
                    >
                      <div className="text-black mt-1">{lancar}- Lcr</div>

                      <div className="text-black mt-2">{belum}- Blm</div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/master-hafalan/${s.nis}`)
                      }
                      className="
                        w-9 h-9
                        rounded-full
                        bg-purple-100
                        text-purple-700
                        flex items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t p-2">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredSantri.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">
                {filteredSantri.length}
              </span>{" "}
              santri
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
                  px-3 py-2
                  border rounded-lg
                  text-xs
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-gray-100
                "
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-9 px-3 py-2 rounded-lg text-xs border ${
                      currentPage === page
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
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
                className="
                  px-3 py-2
                  border rounded-lg
                  text-xs
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-gray-100
                "
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

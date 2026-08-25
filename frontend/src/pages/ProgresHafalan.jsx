import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProgresHafalan() {
  const [santri, setSantri] = useState([]);
  const [search, setSearch] = useState("");

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");

      const dataSantri = res?.data?.data?.santri || [];

      setSantri(dataSantri);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);
    }
  };

  // ================= JUMLAH HAFALAN =================
  const getJumlahHafalan = (nis, status) => {
    const saved = localStorage.getItem(`hafalan_${nis}`);

    if (!saved) return 0;

    try {
      const data = JSON.parse(saved);

      return Object.values(data).filter((item) => item?.progres === status)
        .length;
    } catch (err) {
      console.error("Data hafalan rusak:", err);
      return 0;
    }
  };

  // ================= FILTER SANTRI =================
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

  // ================= RESET PAGE SAAT SEARCH =================
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredSantri.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentSantri = filteredSantri.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // ================= JIKA PAGE MELEBIHI TOTAL =================
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow p-0 overflow-x-auto">
        {/* ================= TITLE ================= */}
        <h1 className="text-lg font-light tracking-wide text-black ml-2 mb-4">
          PROGRES HAFALAN
        </h1>

        {/* ================= SEARCH ================= */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama / NIS / kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              border rounded-lg px-3 py-2
              text-xs w-full md:w-72
              focus:outline-none focus:ring-2
              focus:ring-purple-300
            "
          />
        </div>

        {/* ================= DESKTOP TABLE ================= */}
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
            {filteredSantri.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  Data santri belum tersedia
                </td>
              </tr>
            ) : (
              currentSantri.map((s, i) => (
                <tr key={s.nis || i} className="border-t hover:bg-gray-50">
                  {/* NO */}
                  <td className="p-1 border text-center">
                    {startIndex + i + 1}
                  </td>

                  {/* NAMA */}
                  <td className="p-1 border font-medium">{s.nama}</td>

                  {/* NIS */}
                  <td className="p-1 border">{s.nis}</td>

                  {/* KELAS */}
                  <td className="p-1 border">{s.kelas}</td>

                  {/* LANCAR */}
                  <td className="p-1 border text-center font-medium text-green-700">
                    {getJumlahHafalan(s.nis, "Lancar")}-Hafalan
                  </td>

                  {/* BELUM */}
                  <td className="p-1 border text-center font-medium text-red-700">
                    {getJumlahHafalan(s.nis, "Belum")}-Hafalan
                  </td>

                  {/* LIHAT PROGRES */}
                  <td className="p-1 border text-center">
                    <button
                      onClick={() => navigate(`/progres-hafalan/${s.nis}`)}
                      className="
                        inline-flex items-center justify-center
                        w-6 h-6 rounded-full
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
          </tbody>
        </table>

        {/* ================= MOBILE CARD ================= */}
        <div className="md:hidden space-y-3 mt-4">
          {filteredSantri.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              Data santri belum tersedia
            </div>
          ) : (
            currentSantri.map((s, i) => {
              const saved = (() => {
                try {
                  return (
                    JSON.parse(localStorage.getItem(`hafalan_${s.nis}`)) || {}
                  );
                } catch (err) {
                  return {};
                }
              })();

              const lancar = Object.values(saved).filter(
                (item) => item?.progres === "Lancar",
              ).length;

              const belum = Object.values(saved).filter(
                (item) => item?.progres === "Belum",
              ).length;

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
                  {/* BARIS ATAS */}
                  <div className="flex items-start justify-between gap-2">
                    {/* KIRI */}
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

                    {/* TENGAH */}
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

                    {/* KANAN */}
                    <button
                      onClick={() => navigate(`/progres-hafalan/${s.nis}`)}
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

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-3
              mt-5
              px-2
              pb-4
            "
          >
            {/* INFO */}
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>
              {" - "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredSantri.length)}
              </span>
              {" dari "}
              <span className="font-semibold text-gray-700">
                {filteredSantri.length}
              </span>{" "}
              santri
            </div>

            {/* BUTTON PAGINATION */}
            <div className="flex items-center gap-1">
              {/* SEBELUMNYA */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
                  px-3 py-1.5
                  border
                  rounded-lg
                  text-xs
                  bg-white
                  hover:bg-gray-100
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Sebelumnya
              </button>

              {/* NOMOR HALAMAN */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                      min-w-[30px]
                      h-[30px]
                      rounded-lg
                      text-xs
                      border
                      ${
                        currentPage === page
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              {/* BERIKUTNYA */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="
                  px-3 py-1.5
                  border
                  rounded-lg
                  text-xs
                  bg-white
                  hover:bg-gray-100
                  disabled:opacity-40
                  disabled:cursor-not-allowed
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

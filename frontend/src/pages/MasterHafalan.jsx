import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MasterHafalan() {
  const [santri, setSantri] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");
      const dataSantri = res?.data?.data?.santri || [];
      setSantri(dataSantri);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);
    }
  };
  const getJumlahHafalan = (nis, status) => {
    const saved = localStorage.getItem(`hafalan_${nis}`);
    if (!saved) return 0;
    const data = JSON.parse(saved);
    return Object.values(data).filter((item) => item.progres === status).length;
  };
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

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-2xl shadow p-0  overflow-x-auto">
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

        {/* TABLE */}
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
            {santri.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Data santri belum tersedia
                </td>
              </tr>
            ) : (
              filteredSantri.map((s, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  {/* NO */}
                  <td className="p-1 border text-center">{i + 1}</td>
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
                      onClick={() => navigate(`/master-hafalan/${s.nis}`)}
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
          </tbody>
        </table>
        {/* ================= MOBILE CARD ================= */}
        <div className="md:hidden space-y-3 mt-4">
          {filteredSantri.map((s, i) => {
            const saved =
              JSON.parse(localStorage.getItem(`hafalan_${s.nis}`)) || {};

            const lancar = Object.values(saved).filter(
              (item) => item?.progres === "Lancar",
            ).length;

            const belum = Object.values(saved).filter(
              (item) => item?.progres === "Belum",
            ).length;

            return (
              <div
                key={i}
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
                      <span className="font-semibold text-black">{i + 1}.</span>

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
                      NIS {s.nis} |K-{s.kelas}
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
          })}
        </div>
      </div>
    </div>
  );
}

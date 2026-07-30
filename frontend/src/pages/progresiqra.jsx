import { useEffect, useState } from "react";
import { api } from "../api";

export default function ProgresIqra() {
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [progresData, setProgresData] = useState({});
  const [searchIqra, setSearchIqra] = useState("");
  const [filterJilid, setFilterJilid] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");

  const STORAGE_KEY = "tpq_progres_iqra";

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setProgresData(JSON.parse(saved));
    }
  }, []);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");

      setSantri(res?.data?.data?.santri || []);
      setGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FILTER IQRA =================
  const santriIqra = santri.filter((s) => {
    const isIqra = (s.kelas || "").toLowerCase().includes("iqra");

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
    ${s.nis || ""}
  `
      .toLowerCase()
      .includes(keyword);

    // FILTER
    const cocokJilid = !filterJilid || jilidDipilih === filterJilid;
    const cocokProgres = !filterProgres || progresDipilih === filterProgres;
    const cocokPrestasi = !filterPrestasi || prestasi === filterPrestasi;
    return isIqra && cocokSearch && cocokJilid && cocokProgres && cocokPrestasi;
  });

  return (
    <div className="p-2 md:p-4 space-y-4">
      <h1 className="text-lg tracking-wider font-light text-black">
        PROGRES IQRA
      </h1>

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="mb-4 flex flex-wrap gap-2">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Cari santri / guru..."
            value={searchIqra}
            onChange={(e) => setSearchIqra(e.target.value)}
            className="border p-2 rounded w-full md:w-64 text-sm"
          />

          {/* FILTER JILID */}
          <select
            value={filterJilid}
            onChange={(e) => setFilterJilid(e.target.value)}
            className="border p-2 rounded text-xs"
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
        </div>

        {/* MOBILE CARD */}
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
                className="bg-gray-200 border rounded-xl shadow overflow-hidden"
              >
                {/* HEADER */}
                <div className="bg-purple-600 text-white text-center font-bold py-2 px-3 text-sm">
                  {s.nama?.toUpperCase()}
                  <br />
                  NIS : {s.nis} | Kelas {s.kelas || "-"}
                </div>

                {/* BODY */}
                <div className="p-2 mb-1 text-sm text-gray-700 space-y-1 text-center">
                  <div>
                    | Jilid {progresData[`jilid_${s.nis}`] || "-"} | Halaman{" "}
                    {progresData[`hal_${s.nis}`] || "-"} |
                  </div>

                  <div>
                    Guru : <b>{namaGuru} </b>{" "}
                  </div>
                  <div>| NIG : {dataGuru?.nig || "-"} |</div>

                  <div>
                    Progres <b>{progres.toUpperCase()}</b> maka prestasi belajar
                    santri harus <b>{prestasi.toUpperCase()} </b>
                  </div>

                  <div className="text-xs text-purple-700 pt-1">
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

          {/* DESKTOP */}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nama Santri</th>
                <th className="p-2">NIS</th>
                <th className="p-2">Guru</th>
                <th className="p-2">NIG</th>
                <th className="p-2">Kelas</th>
                <th className="p-2">Jilid</th>
                <th className="p-2">Hal.</th>
                <th className="p-2">Progres</th>
                <th className="p-2">Prestasi</th>
                <th className="p-2">Update</th>
              </tr>
            </thead>

            <tbody>
              {santriIqra.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4">
                    Tidak ada data progres iqra
                  </td>
                </tr>
              ) : (
                santriIqra.map((s, i) => {
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
                    <tr key={i} className="border-t">
                      <td className="p-2 font-semibold">{s.nama}</td>
                      <td className="p-2">{s.nis}</td>
                      <td className="p-2">{namaGuru}</td>
                      <td className="p-2">{dataGuru?.nig || "-"}</td>
                      <td className="p-2">{s.kelas || "-"}</td>
                      <td className="p-2">
                        {progresData[`jilid_${s.nis}`] || "-"}
                      </td>
                      <td className="p-2">
                        {progresData[`hal_${s.nis}`] || "-"}
                      </td>
                      <td className="p-2">{progres}</td>
                      <td className="p-2">{prestasi}</td>
                      <td className="p-2 text-xs text-gray-500">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
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
      </div>
    </div>
  );
}

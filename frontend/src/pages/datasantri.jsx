import { useEffect, useState } from "react";
import { api } from "../api";

export default function DataSantri() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const filteredData = data.filter((d) => {
    const keyword = search.toLowerCase();

    const semuaData = `
    ${d.nama || ""}
    ${d.nis || ""}
    ${d.kelas || ""}
    ${d.jenis_kelamin === "L" ? "laki laki" : "perempuan"}
    ${d.tanggal_lahir || ""}
    ${d.usia || ""}
    ${d.alamat || ""}
    ${d.kontak || ""}
    ${d.orang_tua?.nama_ayah || ""}
    ${d.orang_tua?.nama_ibu || ""}
    ${d.orang_tua?.pekerjaan_ayah || ""}
    ${d.orang_tua?.pekerjaan_ibu || ""}
    ${d.status_orangtua || ""}
    ${d.status_anak || ""}
  `.toLowerCase();

    return semuaData.includes(keyword);
  });

  // ================= FETCH DATA =================
  const fetchSantri = async () => {
    try {
      const res = await api.get("/master-data");
      setData(res?.data?.data?.santri || []);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);
      setData([]);
    }
  };

  useEffect(() => {
    api.get("/master-data").then((res) => {
      setData(res?.data?.data?.santri || []);
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* TITLE */}
        <h1 className="text-lg font-light text-black tracking-wide">
          DATA BASE SANTRI
        </h1>

        {/* SEARCH */}
        <div>
          <input
            type="text"
            placeholder="Cari data santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-64"
          />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="block md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500">Data tidak ditemukan</div>
        ) : (
          filteredData.map((d, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow bg-white border"
            >
              {/* HEADER */}
              <div className="bg-purple-600 p-2 mb-1 flex flex-col items-center space-y-0.5 text-center">
                {d.foto ? (
                  <img
                    src={`http://localhost:8000/storage/${d.foto}`}
                    alt="foto"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-xs">
                    No Foto
                  </div>
                )}

                <h2 className="mt-1 text-white font-bold text-lg uppercase">
                  {d.nama}
                </h2>

                <p className="text-white font-extralight text-sm ">
                  {d.nis} | Kelas {d.kelas || "-"}
                </p>
              </div>
              {/* NARASI */}
              <div className="bg-gray-300 font-light p-4 text-sm  text-gray-800 space-y-0 text-justify">
                <p>
                  Adalah santri TPQ Khairunisa Ternate dengan jenis kelamin{" "}
                  {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} berusia{" "}
                  {d.usia} tahun dan lahir pada tanggal {d.tanggal_lahir}.
                  Santri merupakan anak dari Ayah bernama{" "}
                  <b>{d.orang_tua?.nama_ayah || "-"}</b> dengan pekerjaan{" "}
                  {d.orang_tua?.pekerjaan_ayah || "-"} dan Ibu bernama{" "}
                  <b>{d.orang_tua?.nama_ibu || "-"}</b> dengan pekerjaan{" "}
                  {d.orang_tua?.pekerjaan_ibu || "-"}. Status orang tua adalah{" "}
                  <b>{d.status_orangtua || "-"}</b> dan santri termasuk{" "}
                  <b>{d.status_anak || "-"}</b>.
                </p>
                <p>
                  Santri berdomisili di Kelurahan {d.alamat || "-"} Kota
                  Ternate.
                  {d.kontak && ` Nomor kontak ${d.kontak}.`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-medium">Foto</th>
              <th className="p-3 text-left font-medium">Nama - NIS</th>
              <th className="p-3 text-left font-medium">
                JK, Usia - Kelahiran
              </th>
              <th className="p-3 text-left font-medium">Alamat - Kontak</th>
              <th className="p-3 text-left font-medium">Ayah - Pekerjaan</th>
              <th className="p-3 text-left font-medium">Ibu - Pekerjaan</th>
              <th className="p-3 text-left font-medium">Status Ortu - Anak</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center  p-6 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              filteredData.map((d, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 transition">
                  {/* FOTO */}
                  <td className="p-3">
                    {d.foto ? (
                      <img
                        src={`http://localhost:8000/storage/${d.foto}`}
                        alt="foto"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Img
                      </div>
                    )}
                  </td>

                  {/* NAMA */}
                  <td className="p-3">
                    <div className="font-medium">{d.nama}</div>
                    <div className="text-xs text-gray-500">{d.nis}</div>
                  </td>

                  {/* JK + USIA */}
                  <td className="p-3">
                    <div>
                      {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                      {d.usia} Th
                    </div>
                    <div className="text-xs text-gray-500">
                      {d.tanggal_lahir}
                    </div>
                  </td>

                  {/* ALAMAT */}
                  <td className="p-3">
                    <div>{d.alamat}</div>
                    <div className="text-xs text-gray-500">
                      {d.kontak || "-"}
                    </div>
                  </td>

                  {/* AYAH */}
                  <td className="p-3">
                    <div>{d.orang_tua?.nama_ayah || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {d.orang_tua?.pekerjaan_ayah || "-"}
                    </div>
                  </td>

                  {/* IBU */}
                  <td className="p-3">
                    <div>{d.orang_tua?.nama_ibu || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {d.orang_tua?.pekerjaan_ibu || "-"}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <div>{d.status_orangtua || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {d.status_anak || "-"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

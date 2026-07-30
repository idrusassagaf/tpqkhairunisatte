import { useEffect, useState } from "react";
import { api } from "../api";

export default function DatabaseGuru() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    api.get("/master-data").then((res) => {
      setData(res?.data?.data?.guru || []);
    });
  }, []);

  const filteredData = data.filter((g) => {
    const keyword = search.toLowerCase();

    const semuaData = `
    ${g.nama_guru || ""}
    ${g.nig || ""}
   ${g.jenis_kelamin === "L" ? "laki laki" : "perempuan"}
    ${g.tanggal_lahir || ""}
    ${g.usia || ""}
    ${g.pendidikan || ""}
    ${g.pekerjaan || ""}
    ${g.kontak || ""}
  `.toLowerCase();

    return semuaData.includes(keyword);
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* TITLE */}
        <h1 className="text-xl font-light text-black tracking-wide">
          DATA BASE GURU
        </h1>

        {/* SEARCH */}
        <div>
          <input
            type="text"
            placeholder="Cari data santri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 text-xs rounded w-full md:w-64"
          />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="block md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500">Data tidak ditemukan</div>
        ) : (
          filteredData.map((g, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow bg-white border"
            >
              {/* HEADER */}
              <div className="bg-purple-600 p-2 mb-1 flex flex-col items-center space-y-0.5 text-center">
                {g.foto_url ? (
                  <img
                    src={g.foto_url}
                    alt="foto"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-xs">
                    No Foto
                  </div>
                )}

                <h2 className="mt-1 text-white font-bold text-lg uppercase">
                  {g.nama_guru}
                </h2>
              </div>

              {/* NARASI */}
              <div className="bg-gray-300 p-4  font-extralight text-sm  text-gray-800 space-y-3 text-justify">
                <p>
                  Adalah guru TPQ Khairunisa Ternate dengan nomor ID{" "}
                  <b>{g.nig}</b>. Berjenis kelamin{" "}
                  {g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} dan
                  berusia {g.usia} tahun. Lahir pada tanggal {g.tanggal_lahir}.
                  Memiliki latar belakang pendidikan{" "}
                  <b>{g.pendidikan || "-"}</b> dan bekerja sebagai{" "}
                  <b>{g.pekerjaan || "-"}</b>. Dapat dihubungi melalui nomor
                  kontak <b>{g.kontak || "-"}</b>.
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full text-xs font-medium">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="text-left p-2">Foto</th> {/* 🔥 TAMBAH INI */}
              <th className="text-left p-2">Nama / NIG</th>
              <th className="text-left p-2">JK, Usia / Kelahiran</th>
              <th className="text-left p-2">Pendidikan / Pekerjaan</th>
              <th className="text-left p-2">Kontak</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((d, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 align-top">
                {/* FOTO */}
                <td className="p-2">
                  {d.foto_url ? (
                    <img
                      src={d.foto_url}
                      alt="foto"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                      No Img
                    </div>
                  )}
                </td>

                {/* KOLOM 1 */}
                <td className="p-2">
                  <div className="font-medium">{d.nama_guru}</div>
                  <div className="text-gray-500 text-xs">{d.nig}</div>
                </td>

                {/* KOLOM 2 */}
                <td className="p-2">
                  <div>
                    {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                    {d.usia} Th
                  </div>
                  <div className="text-gray-500 text-xs">{d.tanggal_lahir}</div>
                </td>

                {/* KOLOM 3 */}
                <td className="p-2">
                  <div>{d.pendidikan || "-"}</div>
                  <div className="text-gray-500 text-xs">
                    {d.pekerjaan || "-"}
                  </div>
                </td>

                {/* KOLOM 4 */}
                <td className="p-2">
                  <div>{d.kontak || "-"}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useLocation } from "react-router-dom";

export default function ProgresHafalanSantri() {
  const { nis } = useParams();
  const [guru, setGuru] = useState([]);
  const [santri, setSantri] = useState(null);
  const location = useLocation();
  const backLink = location.pathname.includes("master-hafalan")
    ? "/master-hafalan"
    : "/progres-hafalan";
  const isReadonly = location.pathname.includes("/progres-hafalan/");
  const [dataHafalan, setDataHafalan] = useState({});

  // ================= HITUNG JUMLAH =================
  const getJumlah = (status) => {
    return Object.values(dataHafalan).filter((item) => item?.progres === status)
      .length;
  };

  // ================= JENIS HAFALAN =================
  const jenisHafalan = [
    "Doa Sebelum Belajar Mengaji",
    "Doa Sesudah Belajar Mengaji",
    "Doa Berwudhu",
    "Doa 4",
    "Doa 5",
    "Doa 6",
    "Doa 7",
  ];

  useEffect(() => {
    fetchGuru();
    fetchSantri();

    const saved = localStorage.getItem(`hafalan_${nis}`);
    if (saved) {
      setDataHafalan(JSON.parse(saved));
    }
  }, [nis]);

  // ================= AMBIL DATA GURU =================
  const fetchGuru = async () => {
    try {
      const res = await api.get("/master-data");
      const dataGuru = res?.data?.data?.guru || [];
      setGuru(dataGuru);
    } catch (err) {
      console.error("Gagal ambil guru:", err);
    }
  };

  // ================= AMBIL DATA SANTRI =================
  const fetchSantri = async () => {
    try {
      const res = await api.get("/master-data");
      const dataSantri = res?.data?.data?.santri || [];
      const found = dataSantri.find((s) => s.nis === nis);
      setSantri(found || null);
    } catch (err) {
      console.error("Gagal ambil santri:", err);
    }
  };
  // ================= HANDLE CHANGE =================
  const handleChange = async (index, field, value) => {
    const updated = {
      ...dataHafalan,

      [index]: {
        ...dataHafalan[index],

        jenis: jenisHafalan[index],

        [field]: value,

        update: new Date().toLocaleDateString("id-ID"),
      },
    };

    localStorage.setItem(`hafalan_${nis}`, JSON.stringify(updated));

    setDataHafalan(updated);

    try {
      const item = updated[index];

      const namaGuru = item.guru || "";

      const dataGuru = guru.find(
        (g) => (g.nama || g.nama_guru || g.name) === namaGuru,
      );

      const progres = item.progres || "";

      const prestasi =
        progres === "Lancar"
          ? "Di-Lanjut"
          : progres === "Belum"
            ? "Di-Ulang"
            : "";

      await api.post("/progres-hafalan", {
        nama_santri: santri?.nama,

        nis: santri?.nis,

        nama_guru: namaGuru,

        nig: dataGuru?.nig || "",

        jenis_hafalan: item.jenis,

        progres: progres,

        prestasi: prestasi,
      });
    } catch (err) {
      console.error("Gagal simpan hafalan", err);
    }
  };

  return (
    <div className="p-4">
      {/* ================= HEADER ================= */}
      <div className="bg-gray-200 rounded-2xl shadow p-4 mb-4">
        {/* TOP */}
        <div className="flex items-start justify-between mb-3">
          {/* KIRI */}
          <div>
            {/* JUDUL DESKTOP */}
            <h1
              className="
          hidden md:block
          text-lg
          font-light
          tracking-[3px]
          uppercase
          text-black
          mb-2
        "
            >
              HAFALAN SANTRI
            </h1>

            {/* DESKTOP */}
            <div
              className="
          hidden md:flex
          flex-wrap
          items-center
          gap-2
          text-black
           font-light
          tracking-[2px]
          text-xs
        "
            >
              <span className="font-bold uppercase">{santri?.nama || "-"}</span>
              <span>|</span>
              <span>{nis}</span>
              <span>|</span>
              <span>Kelas {santri?.kelas || "-"}</span>
              <span>|</span>
              <span className="text-green-700">
                Sudah Lancar {getJumlah("Lancar")}-Hafalan
              </span>
              <span>|</span>
              <span className="text-red-600">
                Belum Lancar {getJumlah("Belum")}-Hafalan
              </span>
            </div>
          </div>

          {/* KEMBALI */}
          <Link
            to={backLink}
            className="
        text-sm
        font-medium
        text-purple-700
        hover:underline
        whitespace-nowrap
      "
          >
            ← Kembali
          </Link>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden text-center text-black">
          {/* JUDUL */}
          <h1
            className="
        text-lg
        font-light
        tracking-[3px]
        uppercase
        mb-4
      "
          >
            HAFALAN SANTRI
          </h1>

          {/* NAMA */}
          <div className="font-bold text-lg uppercase">
            {santri?.nama || "-"}
          </div>

          {/* NIS + KELAS */}
          <div className="text-xs text-gray-700 mt-1">
            {nis} | Kelas {santri?.kelas || "-"}
          </div>

          {/* SUDAH LANCAR */}
          <div className="text-xs text-green-700 mt-3">
            Sudah Lancar : {getJumlah("Lancar")}-Hafalan
          </div>

          {/* BELUM LANCAR */}
          <div className="text-xs text-red-600 mt-1">
            Belum Lancar : {getJumlah("Belum")}-Hafalan
          </div>
        </div>
      </div>

      {/* ================= TABLE DESKTOP ================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full border text-xs text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border w-14">No</th>
              <th className="p-2 border text-left">Jenis Hafalan</th>
              <th className="p-2 border">Guru</th>
              <th className="p-2 border">Progres</th>
              <th className="p-2 border">Prestasi</th>
              <th className="p-2 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {jenisHafalan.map((item, i) => {
              const progres = dataHafalan[i]?.progres || "";

              const prestasi =
                progres === "Belum"
                  ? "Di Ulang"
                  : progres === "Lancar"
                    ? "Di Lanjut"
                    : "-";

              return (
                <tr key={i} className="hover:bg-gray-50">
                  {/* NO */}
                  <td className="p-2 border text-center">{i + 1}</td>

                  {/* JENIS */}
                  <td className="p-2 border">{item}</td>

                  {/* GURU */}
                  <td className="p-2 border">
                    <select
                      disabled={isReadonly}
                      value={dataHafalan[i]?.guru || ""}
                      onChange={(e) => handleChange(i, "guru", e.target.value)}
                      className="
                        border rounded
                        px-2 py-1
                        w-full
                        text-xs
                      "
                    >
                      <option value="">Pilih Guru</option>

                      {guru.map((g, idx) => {
                        const namaGuru =
                          g.nama || g.nama_guru || g.name || "Tanpa Nama";

                        return (
                          <option key={idx} value={namaGuru}>
                            {namaGuru}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  {/* PROGRES */}
                  <td className="p-2 border">
                    <select
                      disabled={isReadonly}
                      value={progres}
                      onChange={(e) =>
                        handleChange(i, "progres", e.target.value)
                      }
                      className="
                        border rounded
                        px-2 py-1
                        w-full
                        text-xs
                      "
                    >
                      <option value="">Pilih</option>

                      <option value="Belum">Belum</option>

                      <option value="Lancar">Lancar</option>
                    </select>
                  </td>

                  {/* PRESTASI */}
                  <td className="p-2 border text-center font-medium">
                    {prestasi}
                  </td>

                  {/* UPDATE */}
                  <td className="p-2 border text-center text-xs">
                    {dataHafalan[i]?.update || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD ================= */}
      <div className="md:hidden space-y-4">
        {jenisHafalan.map((item, i) => {
          const progres = dataHafalan[i]?.progres || "";

          const prestasi =
            progres === "Belum"
              ? "Di Ulang"
              : progres === "Lancar"
                ? "Di Lanjut"
                : "-";

          return (
            <div
              key={i}
              className="
                bg-white
                rounded-2xl
                shadow
                border
                overflow-hidden
              "
            >
              {/* HEADER */}
              <div
                className="
                  bg-purple-600
                  text-white
                  px-4 py-3
                  font-semibold
                  text-sm
                "
              >
                {i + 1}. {item}
              </div>

              {/* BODY */}
              <div className="p-4 space-y-4 text-sm text-black">
                {/* GURU */}
                <div>
                  <div className="mb-1 font-medium">Guru</div>

                  <select
                    disabled={isReadonly}
                    value={dataHafalan[i]?.guru || ""}
                    onChange={(e) => handleChange(i, "guru", e.target.value)}
                    className="
                      border rounded-lg
                      px-3 py-2
                      w-full
                      text-xs
                    "
                  >
                    <option value="">Pilih Guru</option>

                    {guru.map((g, idx) => {
                      const namaGuru =
                        g.nama || g.nama_guru || g.name || "Tanpa Nama";

                      return (
                        <option key={idx} value={namaGuru}>
                          {namaGuru}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* PROGRES */}
                <div>
                  <div className="mb-1 font-medium">Progres</div>

                  <select
                    disabled={isReadonly}
                    value={progres}
                    onChange={(e) => handleChange(i, "progres", e.target.value)}
                    className="
                      border rounded-lg
                      px-3 py-2
                      w-full
                      text-xs
                    "
                  >
                    <option value="">Pilih</option>

                    <option value="Belum">Belum</option>

                    <option value="Lancar">Lancar</option>
                  </select>
                </div>

                {/* PRESTASI */}
                <div className="text-sm">
                  <span className="font-medium">Prestasi :</span> {prestasi}
                </div>
              </div>

              {/* FOOTER */}
              <div className="bg-gray-100 px-4 py-2 border-t">
                <div className="text-xs text-gray-600">
                  Update : {dataHafalan[i]?.update || "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

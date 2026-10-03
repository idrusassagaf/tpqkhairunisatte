import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Printer, Search, UserRound, Users, CreditCard } from "lucide-react";
import { api } from "../api";

export default function KartuQRSantri() {
  const [tipe, setTipe] = useState("santri");
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/master-data");

        const data = response?.data?.data || {};

        const dataSantri = Array.isArray(data.santri) ? data.santri : [];
        const dataGuru = Array.isArray(data.guru) ? data.guru : [];

        setSantri(dataSantri);
        setGuru(dataGuru);

        const hasilQr = {};

        for (const item of dataSantri) {
          const nis = String(item?.nis || "").trim();

          if (!nis) {
            continue;
          }

          hasilQr[`santri-${nis}`] = await QRCode.toDataURL(nis, {
            width: 260,
            margin: 2,
            errorCorrectionLevel: "M",
          });
        }

        for (const item of dataGuru) {
          const nig = String(item?.nig || "").trim();

          if (!nig) {
            continue;
          }

          hasilQr[`guru-${nig}`] = await QRCode.toDataURL(nig, {
            width: 260,
            margin: 2,
            errorCorrectionLevel: "M",
          });
        }

        setQrCodes(hasilQr);
      } catch (err) {
        console.error("Gagal memuat data kartu QR:", err);

        setError(
          err?.response?.data?.message || "Data santri dan guru gagal dimuat.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const dataAktif = tipe === "santri" ? santri : guru;

  const dataFiltered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return dataAktif;
    }

    return dataAktif.filter((item) => {
      if (tipe === "santri") {
        return `
          ${item?.nama || ""}
          ${item?.nis || ""}
          ${item?.kelas || ""}
        `
          .toLowerCase()
          .includes(keyword);
      }

      return `
        ${item?.nama_guru || ""}
        ${item?.nig || ""}
      `
        .toLowerCase()
        .includes(keyword);
    });
  }, [dataAktif, search, tipe]);

  const handleTipeChange = (value) => {
    setTipe(value);
    setSearch("");
  };

  const handleCetak = () => {
    if (dataFiltered.length === 0) {
      return;
    }

    window.print();
  };

  const getFotoUrl = (foto) => {
    if (!foto) {
      return null;
    }

    const baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

    return `${baseUrl}/storage/${foto}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER HALAMAN */}
        <div className="mb-6 no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <CreditCard size={24} />
            </div>

            <div>
              <h1 className="text-sm md:text-3xl font-extralight text-gray-800">
                Kartu QR Absensi
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Kartu ID Card untuk absensi santri dan guru.
              </p>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-5 mb-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* SANTRI / GURU */}
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTipeChange("santri")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                  tipe === "santri"
                    ? "bg-gray-500 text-white border-gray-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <UserRound size={18} />
                Santri
              </button>

              <button
                type="button"
                onClick={() => handleTipeChange("guru")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                  tipe === "guru"
                    ? "bg-gray-500 text-white border-gray-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Users size={18} />
                Guru
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative flex-1 min-w-0">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  tipe === "santri"
                    ? "Cari nama / NIS / kelas..."
                    : "Cari nama guru / NIG..."
                }
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  pl-10 pr-3 py-3
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-300
                "
              />
            </div>

            {/* CETAK */}
            <button
              type="button"
              onClick={handleCetak}
              disabled={loading || dataFiltered.length === 0}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-lg
                bg-gray-500
                text-white
                hover:bg-purple-700
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
                shrink-0
              "
            >
              <Printer size={18} />
              Cetak
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">
              {dataFiltered.length}
            </span>{" "}
            {tipe === "santri" ? "santri" : "guru"}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6 no-print">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 no-print">
            Memuat data dan membuat QR Code...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && dataFiltered.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 no-print">
            {search
              ? "Data yang dicari tidak ditemukan."
              : `Data ${tipe === "santri" ? "santri" : "guru"} belum tersedia.`}
          </div>
        )}

        {/* KARTU */}
        {!loading && !error && dataFiltered.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
              print-card-container
            "
          >
            {dataFiltered.map((item, index) => {
              const isSantri = tipe === "santri";

              const nama = isSantri
                ? item?.nama || "-"
                : item?.nama_guru || "-";

              const kode = isSantri
                ? String(item?.nis || "").trim()
                : String(item?.nig || "").trim();

              const kelas = isSantri ? item?.kelas || "-" : null;

              const foto = getFotoUrl(item?.foto);

              const qrKey = `${tipe}-${kode}`;
              const qrCode = qrCodes[qrKey];

              return (
                <div
                  key={kode || index}
                  className="flex justify-center print-card-wrapper"
                >
                  <div
                    className="
                      w-full
                      max-w-[360px]
                      bg-white
                      border
                      border-gray-200
                      rounded-2xl
                      shadow-md
                      overflow-hidden
                      print-card
                    "
                  >
                    {/* HEADER KARTU */}
                    <div className="bg-green-600 text-white px-5 py-4 text-center">
                      <div className="text-xl font-bold tracking-wide whitespace-nowrap">
                        TPQ HAIRUNISSA
                      </div>

                      <div className="text-xs mt-1 opacity-90 tracking-wide">
                        KARTU ABSENSI PENGAJIAN
                      </div>
                    </div>

                    {/* ISI KARTU */}
                    <div className="px-5 py-4 text-center">
                      {/* FOTO */}
                      <div className="flex justify-center mb-3">
                        {foto ? (
                          <img
                            src={foto}
                            alt={`Foto ${nama}`}
                            className="
                              w-24
                              h-24
                              rounded-full
                              object-cover
                              border-4
                              border-white
                              shadow-md
                              ring-2
                              ring-purple-100
                            "
                          />
                        ) : (
                          <div
                            className="
                              w-24
                              h-24
                              rounded-full
                              bg-gray-100
                              border-4
                              border-white
                              shadow-md
                              ring-2
                              ring-gray-200
                              flex
                              items-center
                              justify-center
                              text-xs
                              text-gray-400
                            "
                          >
                            No Foto
                          </div>
                        )}
                      </div>

                      {/* NAMA */}
                      <h2 className="text-lg font-bold text-gray-800 uppercase break-words">
                        {nama}
                      </h2>

                      {/* ID + KELAS */}
                      <div className="mt-1 text-sm font-medium text-gray-600 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">
                          ID : {kode || "-"}
                        </span>

                        {isSantri && (
                          <>
                            <span className="mx-1">|</span>
                            <span>Kelas {kelas}</span>
                          </>
                        )}
                      </div>

                      {/* QR CODE */}
                      <div className="mt-3 flex justify-center">
                        {qrCode ? (
                          <div className="p-1.5 border border-gray-200 rounded-lg bg-white">
                            <img
                              src={qrCode}
                              alt={`QR Absensi ${nama}`}
                              className="w-[175px] h-[175px]"
                            />
                          </div>
                        ) : (
                          <div className="w-[175px] h-[175px] flex items-center justify-center border border-red-200 rounded-lg text-xs text-red-500">
                            QR tidak tersedia
                          </div>
                        )}
                      </div>

                      {/* CATATAN */}
                      <div className="mt-2 text-[10px] text-gray-400 leading-tight">
                        Kartu QR wajib dibawa setiap masuk pengajian.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRINT STYLE */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            .print-card-container,
            .print-card-container * {
              visibility: visible;
            }

            .print-card-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: grid !important;
              grid-template-columns: repeat(2, 1fr);
              gap: 8mm;
              padding: 0;
              margin: 0;
            }

            .print-card-wrapper {
              display: flex !important;
              justify-content: center;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .print-card {
              width: 85.6mm !important;
              height: 54mm !important;
              min-height: 54mm !important;
              max-width: 85.6mm !important;
              border: 1px solid #999 !important;
              border-radius: 3mm !important;
              box-shadow: none !important;
              overflow: hidden;
            }

            .print-card .px-5 {
              padding-left: 3mm !important;
              padding-right: 3mm !important;
            }

            .print-card .py-4 {
              padding-top: 1.8mm !important;
              padding-bottom: 1.8mm !important;
            }

            .print-card img {
              width: 20mm !important;
              height: 20mm !important;
            }

            .print-card .w-24 {
              width: 20mm !important;
            }

            .print-card .h-24 {
              height: 20mm !important;
            }

            .print-card .mb-3 {
              margin-bottom: 1mm !important;
            }

            .print-card .mt-1 {
              margin-top: 0.7mm !important;
            }

            .print-card .mt-2 {
              margin-top: 1mm !important;
            }

            .print-card .mt-3 {
              margin-top: 1mm !important;
            }

            .print-card .text-xl {
              font-size: 10pt !important;
            }

            .print-card .text-lg {
              font-size: 8.5pt !important;
            }

            .print-card .text-sm {
              font-size: 6.5pt !important;
            }

            .print-card .text-xs {
              font-size: 5.5pt !important;
            }

            .print-card .w-\\[175px\\] {
              width: 19mm !important;
            }

            .print-card .h-\\[175px\\] {
              height: 19mm !important;
            }

            .print-card .p-1\\.5 {
              padding: 0.7mm !important;
            }

            .print-card .text-\\[10px\\] {
              font-size: 5pt !important;
            }
          }
        `}
      </style>
    </div>
  );
}

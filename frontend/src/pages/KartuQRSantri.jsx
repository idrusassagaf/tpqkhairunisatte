import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Skeleton } from "../components/Skeleton";
import { Printer, Search, UserRound, Users, CreditCard } from "lucide-react";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";
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
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6 no-print">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <CreditCard size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Kartu QR Absensi</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Kartu ID Card untuk absensi santri dan guru.
            </p>
          </div>
        </div>

        {/* TIPE */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5 md:inline-grid">
          <button
            type="button"
            onClick={() => handleTipeChange("santri")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tipe === "santri" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"
            }`}
          >
            <UserRound size={16} />
            Santri
          </button>

          <button
            type="button"
            onClick={() => handleTipeChange("guru")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tipe === "guru" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"
            }`}
          >
            <Users size={16} />
            Guru
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 no-print">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              className={`${inputCls} pl-10`}
            />
          </div>

          <button
            type="button"
            onClick={handleCetak}
            disabled={loading || dataFiltered.length === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer size={17} />
            Cetak
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">{dataFiltered.length}</span>{" "}
          {tipe === "santri" ? "santri" : "guru"}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 no-print">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 no-print">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
            >
              <Skeleton className="h-16 w-full rounded-none" />

              <div className="flex flex-col items-center gap-3 px-5 py-4">
                <Skeleton className="h-24 w-24 rounded-full" />

                <Skeleton className="h-5 w-40" />

                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-[175px] w-[175px] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && dataFiltered.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm no-print">
          {search
            ? "Data yang dicari tidak ditemukan."
            : `Data ${tipe === "santri" ? "santri" : "guru"} belum tersedia.`}
        </div>
      )}

      {/* KARTU */}
      {!loading && !error && dataFiltered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 print-card-container">
          {dataFiltered.map((item, index) => {
            const isSantri = tipe === "santri";

            const nama = isSantri ? item?.nama || "-" : item?.nama_guru || "-";

            const kode = isSantri
              ? String(item?.nis || "").trim()
              : String(item?.nig || "").trim();

            const kelas = isSantri ? item?.kelas || "-" : null;

            const foto = getFotoUrl(item?.foto);

            const qrKey = `${tipe}-${kode}`;
            const qrCode = qrCodes[qrKey];

            return (
              <div key={kode || index} className="flex justify-center print-card-wrapper">
                <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md print-card">
                  {/* HEADER KARTU */}
                  <div className="bg-gradient-to-r from-green-600 to-green-500 px-5 py-4 text-center text-white">
                    <div className="whitespace-nowrap text-xl font-bold tracking-wide">
                      TPQ HAIRUNISSA
                    </div>

                    <div className="mt-1 text-xs tracking-wide opacity-90">
                      KARTU ABSENSI PENGAJIAN
                    </div>
                  </div>

                  {/* ISI KARTU */}
                  <div className="px-5 py-4 text-center">
                    {/* FOTO */}
                    <div className="mb-3 flex justify-center">
                      {foto ? (
                        <img
                          src={foto}
                          alt={`Foto ${nama}`}
                          className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-purple-100"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-100 text-xs text-gray-400 shadow-md ring-2 ring-gray-200">
                          No Foto
                        </div>
                      )}
                    </div>

                    {/* NAMA */}
                    <h2 className="break-words text-lg font-bold uppercase text-gray-900">
                      {nama}
                    </h2>

                    {/* ID + KELAS */}
                    <div className="mt-1 whitespace-nowrap text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">ID : {kode || "-"}</span>

                      {isSantri && (
                        <>
                          <span className="mx-1 text-gray-300">|</span>
                          <span>Kelas {kelas}</span>
                        </>
                      )}
                    </div>

                    {/* QR CODE */}
                    <div className="mt-3 flex justify-center">
                      {qrCode ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
                          <img src={qrCode} alt={`QR Absensi ${nama}`} className="h-[175px] w-[175px]" />
                        </div>
                      ) : (
                        <div className="flex h-[175px] w-[175px] items-center justify-center rounded-xl border border-red-200 bg-red-50 text-xs text-red-500">
                          QR tidak tersedia
                        </div>
                      )}
                    </div>

                    {/* CATATAN */}
                    <div className="mt-2 text-[10px] leading-tight text-gray-400">
                      Kartu QR wajib dibawa setiap masuk pengajian.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import {
  Printer,
  Search,
  UserRound,
  Users,
  CreditCard,
  Download,
} from "lucide-react";
import { api } from "../api";
import logoTPQ from "../assets/logo-tpq.png";
import { logoPutihUntukPdf } from "../utils/logoPdf";
import { fotoKotakUntukPdf } from "../utils/fotoPdf";

// Ukuran kartu ID vertikal (65 x 105 mm), dipakai untuk cetak & PDF
const KARTU_LEBAR_MM = 65;
const KARTU_TINGGI_MM = 105;

export default function KartuQRSantri() {
  const [tipe, setTipe] = useState("santri");
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

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

  // =========================================================
  // DOWNLOAD PDF (SEMUA KARTU YANG SEDANG DITAMPILKAN)
  // =========================================================

  // Kecilkan ukuran font sampai teks muat dalam satu baris.
  const fontMuatSatuBaris = (
    doc,
    teks,
    lebarMaksimal,
    fontBesar,
    fontKecil,
  ) => {
    let ukuran = fontBesar;

    doc.setFontSize(ukuran);

    while (ukuran > fontKecil && doc.getTextWidth(teks) > lebarMaksimal) {
      ukuran -= 0.5;
      doc.setFontSize(ukuran);
    }

    return ukuran;
  };

  const gambarSatuKartu = async (doc, item, x, y, logoData) => {
    const isSantri = tipe === "santri";

    const nama = (isSantri ? item?.nama : item?.nama_guru) || "-";
    const kode = String(isSantri ? item?.nis : item?.nig || "").trim();
    const kelas = isSantri ? item?.kelas : null;

    const qrCode = qrCodes[`${tipe}-${kode}`];

    const w = KARTU_LEBAR_MM;
    const h = KARTU_TINGGI_MM;
    const cx = x + w / 2;

    // ============ BINGKAI KARTU ============
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.25);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");

    // ============ HEADER (hijau, sudut atas membulat) ============
    const tinggiHeader = 14;

    // Gradasi kiri -> kanan seperti di web (green-700 -> green-600).
    // Dibuat dari pita vertikal tipis, lalu dipotong ke bentuk header
    // (sudut atas membulat, bawah rata).
    const warnaKiri = [21, 128, 61]; // green-700
    const warnaKanan = [22, 163, 74]; // green-600
    const jumlahPita = 80;
    const lebarPita = w / jumlahPita;

    doc.saveGraphicsState();
    doc.roundedRect(x, y, w, tinggiHeader + 3, 3, 3, null);
    doc.clip();
    doc.discardPath();

    for (let i = 0; i < jumlahPita; i++) {
      const t = i / (jumlahPita - 1);
      const warna = warnaKiri.map((c, idx) =>
        Math.round(c + (warnaKanan[idx] - c) * t),
      );

      doc.setFillColor(...warna);
      // Tiap pita diisi sampai ujung kanan dan ditimpa pita berikutnya,
      // supaya tidak muncul garis tipis di sambungan antar pita.
      doc.rect(x + i * lebarPita, y, w - i * lebarPita, tinggiHeader, "F");
    }

    doc.restoreGraphicsState();

    // Logo bulat putih di kiri header
    const logoR = 4;
    const logoCx = x + 6.5;
    const logoCy = y + tinggiHeader / 2;

    doc.setFillColor(255, 255, 255);
    doc.circle(logoCx, logoCy, logoR, "F");

    if (logoData) {
      doc.saveGraphicsState();
      doc.circle(logoCx, logoCy, logoR - 0.4, null);
      doc.clip();
      doc.discardPath();
      doc.addImage(
        logoData,
        "JPEG",
        logoCx - logoR,
        logoCy - logoR,
        logoR * 2,
        logoR * 2,
      );
      doc.restoreGraphicsState();
    }

    // Judul institusi
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("TPQ HAIRUNISSA", logoCx + logoR + 1.8, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.3);
    doc.text("KARTU ABSENSI PENGAJIAN", logoCx + logoR + 1.8, y + 9.6);

    // ============ LENCANA (SANTRI/GURU) di bawah header ============
    const lencana = isSantri ? "SANTRI" : "GURU";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);

    const lebarLencana = doc.getTextWidth(lencana) + 6;
    const lencanaY = y + tinggiHeader + 2.5;

    doc.setFillColor(220, 252, 231); // green-100
    doc.roundedRect(
      cx - lebarLencana / 2,
      lencanaY,
      lebarLencana,
      4.5,
      2.25,
      2.25,
      "F",
    );
    doc.setTextColor(22, 101, 52);
    doc.text(lencana, cx, lencanaY + 3.2, { align: "center" });

    // ============ FOTO (dipotong lingkaran, di tengah) ============
    const fotoR = 13;
    const fotoCy = lencanaY + 4.5 + 3 + fotoR;

    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.6);
    doc.circle(cx, fotoCy, fotoR + 0.8, "S");

    let fotoData = null;

    if (item?.foto) {
      try {
        fotoData = await fotoKotakUntukPdf(item.foto);
      } catch {
        fotoData = null;
      }
    }

    if (fotoData) {
      doc.saveGraphicsState();
      doc.circle(cx, fotoCy, fotoR, null);
      doc.clip();
      doc.discardPath();
      doc.addImage(
        fotoData,
        "JPEG",
        cx - fotoR,
        fotoCy - fotoR,
        fotoR * 2,
        fotoR * 2,
      );
      doc.restoreGraphicsState();
    } else {
      doc.setFillColor(243, 244, 246); // gray-100
      doc.circle(cx, fotoCy, fotoR, "F");
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text("NO FOTO", cx, fotoCy + 1.5, { align: "center" });
    }

    // ============ NAMA (tengah) ============
    const namaY = fotoCy + fotoR + 6;

    doc.setTextColor(31, 41, 55); // gray-800
    doc.setFont("helvetica", "bold");

    const namaUpper = nama.toUpperCase();

    fontMuatSatuBaris(doc, namaUpper, w - 8, 9, 6);
    doc.text(namaUpper, cx, namaY, { align: "center" });

    // ============ NIS/NIG + KELAS (tengah) ============
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(75, 85, 99); // gray-600

    const baris2 = isSantri
      ? `NIS ${kode || "-"}  •  Kelas ${kelas || "-"}`
      : `NIG ${kode || "-"}`;

    doc.text(baris2, cx, namaY + 4.5, { align: "center" });

    // ============ GARIS PEMISAH ============
    const garisY = namaY + 8;

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.line(x + 6, garisY, x + w - 6, garisY);

    // ============ QR CODE (tengah, bawah) ============
    const qrSisi = 30;
    const qrX = cx - qrSisi / 2;
    const qrY = garisY + 4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      qrX - 1.2,
      qrY - 1.2,
      qrSisi + 2.4,
      qrSisi + 2.4,
      1.8,
      1.8,
      "FD",
    );

    if (qrCode) {
      doc.addImage(qrCode, "PNG", qrX, qrY, qrSisi, qrSisi);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(5.5);
      doc.text("QR TIDAK TERSEDIA", cx, qrY + qrSisi / 2, { align: "center" });
    }

    // ============ CATATAN ============
    doc.setFont("helvetica", "italic");
    doc.setFontSize(4.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Wajib dibawa setiap masuk pengajian", cx, y + h - 3, {
      align: "center",
    });
  };

  const handleDownloadPdf = async () => {
    if (dataFiltered.length === 0 || downloading) {
      return;
    }

    try {
      setDownloading(true);

      const logoData = await logoPutihUntukPdf(logoTPQ).catch(() => null);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const gapX = 8;
      const gapY = 8;
      // Kartu vertikal 65 x 105 mm: muat 2 kolom x 2 baris di A4.
      const kolom = 2;
      const baris = 2;
      const perHalaman = kolom * baris;

      const lebarTotal = KARTU_LEBAR_MM * kolom + gapX * (kolom - 1);
      const marginKiri = (210 - lebarTotal) / 2;
      const marginAtas = 15;

      for (let i = 0; i < dataFiltered.length; i++) {
        const posisi = i % perHalaman;

        if (i > 0 && posisi === 0) {
          doc.addPage();
        }

        const kolomKe = posisi % kolom;
        const barisKe = Math.floor(posisi / kolom);

        const x = marginKiri + kolomKe * (KARTU_LEBAR_MM + gapX);
        const y = marginAtas + barisKe * (KARTU_TINGGI_MM + gapY);

        // eslint-disable-next-line no-await-in-loop
        await gambarSatuKartu(doc, dataFiltered[i], x, y, logoData);
      }

      const tanggal = new Date().toISOString().slice(0, 10);

      doc.save(`kartu-qr-${tipe}-${tanggal}.pdf`);
    } catch (err) {
      console.error("Gagal membuat PDF kartu:", err);

      alert("Gagal membuat PDF kartu. Coba lagi.");
    } finally {
      setDownloading(false);
    }
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
                    ? "bg-green-700 text-white border-green-700"
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
                    ? "bg-green-700 text-white border-green-700"
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

            {/* DOWNLOAD */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading || downloading || dataFiltered.length === 0}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-lg
                border
                border-green-700
                text-green-700
                hover:bg-green-50
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
                shrink-0
              "
            >
              {downloading ? (
                <span className="h-[18px] w-[18px] rounded-full border-2 border-green-200 border-t-green-700 animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {downloading ? "Membuat PDF..." : "Download PDF"}
            </button>

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
                bg-green-700
                text-white
                hover:bg-green-800
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
          <div className="bg-white rounded-xl shadow p-8 no-print flex flex-col items-center justify-center gap-3 text-gray-500">
            <span className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin" />

            <span className="text-sm">Memuat data dan membuat QR Code...</span>
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
                      flex
                      flex-col
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
                    <div className="relative bg-gradient-to-r from-green-700 to-green-600 text-white px-4 py-3 flex items-center gap-3 print-card-header">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden print-card-logo">
                        <img
                          src={logoTPQ}
                          alt="Logo TPQ"
                          className="w-7 h-7 object-contain"
                        />
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="text-base font-bold tracking-wide leading-tight truncate print-card-title">
                          TPQ HAIRUNISSA
                        </div>

                        <div className="text-[10px] opacity-90 tracking-wide leading-tight print-card-subtitle">
                          KARTU ABSENSI PENGAJIAN
                        </div>
                      </div>
                    </div>

                    {/* ISI KARTU */}
                    <div className="flex-1 flex flex-col items-center px-4 py-3 print-card-body">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase print-card-badge">
                        {isSantri ? "Santri" : "Guru"}
                      </span>

                      <div className="mt-3 w-full flex flex-col items-center gap-2 text-center print-card-row-atas">
                        {/* FOTO */}
                        {foto ? (
                          <img
                            src={foto}
                            alt={`Foto ${nama}`}
                            className="
                              w-24
                              h-24
                              rounded-full
                              object-cover
                              border-2
                              border-green-600
                              shrink-0
                              print-card-foto
                            "
                          />
                        ) : (
                          <div
                            className="
                              w-24
                              h-24
                              rounded-full
                              bg-gray-100
                              border-2
                              border-green-600
                              shrink-0
                              flex
                              items-center
                              justify-center
                              text-[9px]
                              text-gray-400
                              print-card-foto
                            "
                          >
                            No Foto
                          </div>
                        )}

                        {/* NAMA + ID */}
                        <div className="w-full min-w-0 text-center">
                          <h2 className="text-sm font-bold text-gray-800 uppercase leading-tight truncate print-card-nama">
                            {nama}
                          </h2>

                          <div className="mt-1.5 flex flex-wrap justify-center gap-1 print-card-pill-row">
                            <span className="inline-block bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full print-card-pill">
                              {isSantri ? "NIS" : "NIG"} {kode || "-"}
                            </span>

                            {isSantri && (
                              <span className="inline-block bg-green-50 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full print-card-pill">
                                Kelas {kelas}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* GARIS PEMISAH */}
                      <div className="mt-3 w-full border-t border-dashed border-gray-200 print-card-divider" />

                      {/* QR CODE */}
                      <div className="mt-3 flex flex-col items-center print-card-qr-wrap">
                        {qrCode ? (
                          <div className="p-1.5 border border-green-200 rounded-lg bg-white print-card-qr-box">
                            <img
                              src={qrCode}
                              alt={`QR Absensi ${nama}`}
                              className="w-[130px] h-[130px] print-card-qr"
                            />
                          </div>
                        ) : (
                          <div className="w-[130px] h-[130px] flex items-center justify-center border border-red-200 rounded-lg text-xs text-red-500 print-card-qr">
                            QR tidak tersedia
                          </div>
                        )}

                        <div className="mt-1.5 text-[9px] text-gray-400 italic leading-tight print-card-catatan">
                          Wajib dibawa setiap masuk pengajian
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KARTU STYLE: ukuran sama dengan PDF (mm), diperbesar --k di layar */}
      <style>
        {`
          .print-card-container {
            --k: 1.45;
          }

          .print-card {
            width: calc(${KARTU_LEBAR_MM}mm * var(--k)) !important;
            height: calc(${KARTU_TINGGI_MM}mm * var(--k)) !important;
            border-radius: calc(3mm * var(--k)) !important;
            overflow: hidden;
          }

          .print-card-header {
            padding: calc(2.5mm * var(--k)) calc(3mm * var(--k)) !important;
            gap: calc(1.8mm * var(--k)) !important;
          }

          .print-card-logo {
            width: calc(8mm * var(--k)) !important;
            height: calc(8mm * var(--k)) !important;
          }

          .print-card-logo img {
            width: calc(6.2mm * var(--k)) !important;
            height: calc(6.2mm * var(--k)) !important;
          }

          .print-card-title {
            font-size: calc(7pt * var(--k)) !important;
          }

          .print-card-subtitle {
            font-size: calc(4.3pt * var(--k)) !important;
          }

          .print-card-body {
            padding: calc(2.5mm * var(--k)) calc(3mm * var(--k)) !important;
            flex: 1;
          }

          .print-card-badge {
            font-size: calc(5.5pt * var(--k)) !important;
            padding: calc(0.6mm * var(--k)) calc(3mm * var(--k)) !important;
          }

          .print-card-row-atas {
            margin-top: calc(3mm * var(--k)) !important;
            gap: calc(2mm * var(--k)) !important;
          }

          .print-card-foto {
            width: calc(26mm * var(--k)) !important;
            height: calc(26mm * var(--k)) !important;
          }

          .print-card-nama {
            font-size: calc(9pt * var(--k)) !important;
          }

          .print-card-pill-row {
            margin-top: calc(1mm * var(--k)) !important;
            gap: calc(1mm * var(--k)) !important;
          }

          .print-card-pill {
            font-size: calc(5.5pt * var(--k)) !important;
            padding: calc(0.4mm * var(--k)) calc(2mm * var(--k)) !important;
          }

          .print-card-divider {
            margin-top: calc(3mm * var(--k)) !important;
          }

          .print-card-qr-wrap {
            margin-top: calc(3mm * var(--k)) !important;
          }

          .print-card-qr-box {
            padding: calc(1.2mm * var(--k)) !important;
          }

          .print-card-qr {
            width: calc(30mm * var(--k)) !important;
            height: calc(30mm * var(--k)) !important;
          }

          .print-card-catatan {
            font-size: calc(4.5pt * var(--k)) !important;
            margin-top: calc(1.5mm * var(--k)) !important;
          }

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
              --k: 1;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: grid !important;
              grid-template-columns: repeat(2, ${KARTU_LEBAR_MM}mm);
              justify-content: center;
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
              border: 1px solid #cbd5e1 !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

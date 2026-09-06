import { useEffect, useState } from "react";

import { api } from "../api";

import heroImage from "../assets/hero-putih04.jpg";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function KalenderPublic() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [jadwal, setJadwal] = useState({});

  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    loadJadwal();
  }, []);

  // =========================================================
  // LOAD JADWAL
  // =========================================================

  const loadJadwal = async () => {
    try {
      const res = await api.get("/jadwal");

      setJadwal(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // DATA BULAN
  // =========================================================

  const bulanTahun = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const tahun = currentDate.getFullYear();

  const bulan = currentDate.getMonth();

  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  const firstDay = new Date(tahun, bulan, 1).getDay();

  const offset = firstDay === 0 ? 6 : firstDay - 1;

  // =========================================================
  // NAMA BULAN
  // =========================================================

  const bulanList = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // =========================================================
  // PINDAH BULAN
  // =========================================================

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

    setShowDownload(false);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

    setShowDownload(false);
  };

  // =========================================================
  // DATA UNTUK DOWNLOAD
  // =========================================================

  const getDownloadData = () => {
    return Array.from({ length: jumlahHari }).map((_, index) => {
      const tanggal = index + 1;

      const key = `${tahun}-${bulan + 1}-${tanggal}`;

      const status = jadwal[key] || "";

      let keterangan = "-";

      if (status === "mengaji") {
        keterangan = "Mengaji";
      }

      if (status === "libur") {
        keterangan = "Libur";
      }

      return {
        no: tanggal,
        tanggal: `${String(tanggal).padStart(2, "0")} ${
          bulanList[bulan]
        } ${tahun}`,
        status: keterangan,
      };
    });
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const downloadExcel = () => {
    try {
      const downloadData = getDownloadData();

      const excelData = [
        ["KALENDER PENGAJIAN"],
        ["TPQ Khairunissa Ternate"],
        [],
        ["Bulan", bulanList[bulan], "|", "Tahun", tahun],
        [],
        ["No", "Tanggal", "Keterangan"],
      ];

      downloadData.forEach((item) => {
        excelData.push([item.no, item.tanggal, item.status]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      worksheet["!cols"] = [{ wch: 8 }, { wch: 28 }, { wch: 20 }, { wch: 12 }];

      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: 3 },
        },
        {
          s: { r: 1, c: 0 },
          e: { r: 1, c: 3 },
        },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Kalender Pengajian");

      const nomorBulan = String(bulan + 1).padStart(2, "0");

      const namaFile = `kalender-pengajian-${tahun}-${nomorBulan}.xlsx`;

      XLSX.writeFile(workbook, namaFile);

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat Excel:", error);

      alert("Excel gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    try {
      const downloadData = getDownloadData();

      // =====================================================
      // TANGGAL REALTIME SAAT PDF DI-DOWNLOAD
      // =====================================================

      const sekarang = new Date();

      const tanggalUpdate = sekarang.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // =====================================================
      // BUAT PDF A4 PORTRAIT
      // =====================================================

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      console.log("PDF KALENDER: PORTRAIT AKTIF");

      // =====================================================
      // UKURAN HALAMAN
      // =====================================================

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // =====================================================
      // JUDUL
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(16);

      doc.text("KALENDER PENGAJIAN", centerX, 15, {
        align: "center",
      });

      // =====================================================
      // SUB JUDUL
      // =====================================================

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text("TPQ Khairunissa Ternate", centerX, 21, {
        align: "center",
      });

      // =====================================================
      // PERIODE
      // =====================================================

      doc.setFontSize(9);

      doc.text(
        `Periode: ${bulanList[bulan].toUpperCase()} ${tahun}`,
        centerX,
        27,
        {
          align: "center",
        },
      );

      // =====================================================
      // DATA TABEL
      // =====================================================

      const rows = downloadData.map((item) => [
        item.no,
        item.tanggal,
        item.status,
      ]);

      // =====================================================
      // TABEL
      //
      // A4 PORTRAIT = 210 mm
      //
      // Lebar tabel dibuat 170 mm agar proporsional
      // dengan halaman portrait.
      // =====================================================

      const tableWidth = 170;

      const tableLeft = (pageWidth - tableWidth) / 2;

      autoTable(doc, {
        startY: 33,

        head: [["No", "Tanggal", "Keterangan"]],

        body: rows,

        theme: "grid",

        tableWidth: tableWidth,

        margin: {
          left: tableLeft,
          right: tableLeft,
        },

        styles: {
          fontSize: 8,

          cellPadding: 2.5,

          overflow: "linebreak",

          valign: "middle",

          halign: "center",
        },

        headStyles: {
          fontSize: 8,

          fontStyle: "bold",

          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 20,

            halign: "center",
          },

          1: {
            cellWidth: 75,

            halign: "left",
          },

          2: {
            cellWidth: 75,

            halign: "center",
          },
        },

        // ===================================================
        // FOOTER
        // ===================================================

        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          doc.setFont("helvetica", "normal");

          doc.setFontSize(7);

          doc.text(
            `TPQ Khairunissa • Kalender Pengajian • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
            centerX,
            pageHeight - 7,
            {
              align: "center",
            },
          );
        },
      });

      // =====================================================
      // NAMA FILE
      // =====================================================

      const nomorBulan = String(bulan + 1).padStart(2, "0");

      const namaFile = `kalender-pengajian-${tahun}-${nomorBulan}.pdf`;

      doc.save(namaFile);

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          min-h-[85vh]
          pt-8
          md:pt-10
        "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>
        <div
          className="
            relative
            z-10
            max-w-6xl
            mx-auto
            px-4
            pt-2
            md:pt-4
          "
        >
          {/* =================================================
              JUDUL
          ================================================= */}

          <div className="text-center mb-5">
            <h1
              className="
                text-2xl
                md:text-4xl
                font-bold
                text-green-800
              "
            >
              Kalender Pengajian
            </h1>
          </div>

          {/* =================================================
              CARD BULAN
          ================================================= */}

          <div
            className="
              bg-white/35
              backdrop-blur-xs
              border
              border-white/30
              rounded-3xl
              shadow-lg
              p-3
              md:p-4
              mb-4
            "
          >
            <div className="flex items-center justify-between">
              {/* PREVIOUS */}

              <button
                onClick={prevMonth}
                className="
                  p-2
                  rounded-xl
                  bg-green-50
                  hover:bg-green-100
                "
              >
                <ChevronLeft />
              </button>

              {/* BULAN */}

              <div className="flex items-center gap-2">
                <CalendarDays className="text-green-700" size={20} />

                <h2
                  className="
                    text-base
                    md:text-2xl
                    font-bold
                    capitalize
                    text-blue-800
                  "
                >
                  {bulanTahun}
                </h2>
              </div>

              {/* NEXT */}

              <button
                onClick={nextMonth}
                className="
                  p-2
                  rounded-xl
                  bg-green-50
                  hover:bg-green-100
                "
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* =================================================
              KALENDER
          ================================================= */}

          <div
            className="
              bg-white/35
              backdrop-blur-xs
              border
              border-white/30
              rounded-3xl
              shadow-lg
              p-3
              md:p-5
            "
          >
            {/* HARI */}

            <div className="grid grid-cols-7 gap-1 mb-3">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((hari) => (
                <div
                  key={hari}
                  className="
                      text-center
                      text-xs
                      md:text-base
                      font-bold
                      text-green-700
                    "
                >
                  {hari}
                </div>
              ))}
            </div>

            {/* TANGGAL */}

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({
                length: offset,
              }).map((_, i) => (
                <div key={i}></div>
              ))}

              {Array.from({
                length: jumlahHari,
              }).map((_, index) => {
                const tanggal = index + 1;

                const key = `${tahun}-${bulan + 1}-${tanggal}`;

                const status = jadwal[key];

                return (
                  <div
                    key={tanggal}
                    className="
                      border
                      border-green-400
                      rounded-2xl
                      h-12
                      md:h-20
                      bg-white/25
                      backdrop-blur-xs
                      flex
                      flex-col
                      items-center
                      justify-center
                      hover:bg-white/10
                      transition
                    "
                  >
                    <div
                      className="
                        text-xs
                        md:text-base
                        font-semibold
                      "
                    >
                      {tanggal}
                    </div>

                    {status === "mengaji" && (
                      <div
                        className="
                          mt-1
                          w-5
                          h-5
                          md:w-7
                          md:h-7
                          rounded-full
                          bg-green-500
                          text-white
                          flex
                          items-center
                          justify-center
                          text-[10px]
                        "
                      >
                        M
                      </div>
                    )}

                    {status === "libur" && (
                      <div
                        className="
                          mt-1
                          w-5
                          h-5
                          md:w-7
                          md:h-7
                          rounded-full
                          bg-red-500
                          text-white
                          flex
                          items-center
                          justify-center
                          text-[10px]
                        "
                      >
                        L
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        ```jsx
        {/* ===================================================
            KETERANGAN + DOWNLOAD
        =================================================== */}
        <div
          className="
            flex
            justify-center
            items-center
            gap-4
            md:gap-8
            mt-3
            pb-6
            text-sm
            md:text-base
            flex-wrap
          "
        >
          {/* MENGAJI */}

          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="
                w-7
                h-7
                rounded-full
                bg-green-500
                text-white
                flex
                items-center
                justify-center
                font-bold
              "
            >
              M
            </div>

            <span className="font-medium text-gray-700">Mengaji</span>
          </div>

          {/* LIBUR */}

          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="
                w-7
                h-7
                rounded-full
                bg-red-500
                text-white
                flex
                items-center
                justify-center
                font-bold
              "
            >
              L
            </div>

            <span className="font-medium text-gray-700">Libur</span>
          </div>

          {/* DOWNLOAD */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-blue-600
                text-white
                text-sm
                font-medium
                shadow
                hover:bg-blue-700
                transition
              "
            >
              <Download size={17} />
              Download
            </button>

            {showDownload && (
              <div
                className="
                  absolute
                  bottom-full
                  left-1/2
                  -translate-x-1/2
                  mb-2
                  w-52
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-lg
                  z-50
                  overflow-hidden
                "
              >
                {/* EXCEL */}

                <button
                  type="button"
                  onClick={downloadExcel}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                    transition
                  "
                >
                  <FileSpreadsheet size={18} className="text-green-600" />

                  <div className="text-left">
                    <div className="font-medium">Excel</div>

                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

                {/* PDF */}

                <button
                  type="button"
                  onClick={downloadPDF}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                    transition
                    border-t
                  "
                >
                  <FileText size={18} className="text-red-600" />

                  <div className="text-left">
                    <div className="font-medium">PDF</div>

                    <div className="text-xs text-gray-400">.pdf</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

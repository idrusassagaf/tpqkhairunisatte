import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { api } from "../api";
import { Skeleton, SkeletonCard } from "../components/Skeleton";

import heroImage from "../assets/hero-putih04.jpg";
import notoNaskhArabicRegular from "../assets/NotoNaskhArabic-Regular.ttf";

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
  const [loading, setLoading] = useState(true);

  const { language } = useOutletContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [jadwal, setJadwal] = useState({});
  const [showDownload, setShowDownload] = useState(false);

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  const translations = {
    id: {
      title: "Kalender Pengajian",
      study: "Mengaji",
      holiday: "Libur",
      download: "Download",
      excel: "Excel",
      pdf: "PDF",
      days: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      months: [
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
      ],
      pdfTitle: "KALENDER PENGAJIAN",
      pdfPeriod: "Periode",
      pdfStudy: "Mengaji",
      pdfHoliday: "Libur",
      pdfHeaderNo: "No",
      pdfHeaderDate: "Tanggal",
      pdfHeaderDescription: "Keterangan",
      pdfFooter: "Kalender Pengajian",
    },

    en: {
      title: "Study Schedule Calendar",
      study: "Study",
      holiday: "Holiday",
      download: "Download",
      excel: "Excel",
      pdf: "PDF",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      pdfTitle: "STUDY SCHEDULE CALENDAR",
      pdfPeriod: "Period",
      pdfStudy: "Study",
      pdfHoliday: "Holiday",
      pdfHeaderNo: "No",
      pdfHeaderDate: "Date",
      pdfHeaderDescription: "Description",
      pdfFooter: "Study Schedule Calendar",
    },

    ar: {
      title: "تقويم الدراسة",
      study: "الدراسة",
      holiday: "عطلة",
      download: "تحميل",
      excel: "Excel",
      pdf: "PDF",
      days: [
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
        "الأحد",
      ],
      months: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ],
      pdfTitle: "تقويم الدراسة",
      pdfPeriod: "الفترة",
      pdfStudy: "الدراسة",
      pdfHoliday: "عطلة",
      pdfHeaderNo: "الرقم",
      pdfHeaderDate: "التاريخ",
      pdfHeaderDescription: "البيان",
      pdfFooter: "تقويم الدراسة",
    },
  };

  const t = translations[language] || translations.id;

  // =========================================================
  // LOAD JADWAL
  // =========================================================

  useEffect(() => {
    loadJadwal();
  }, []);

  const loadJadwal = async () => {
    try {
      const res = await api.get("/jadwal");
      setJadwal(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DATA BULAN
  // =========================================================

  const bulanTahun = `${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const tahun = currentDate.getFullYear();
  const bulan = currentDate.getMonth();

  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  const firstDay = new Date(tahun, bulan, 1).getDay();

  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const buatKey = (tahunX, bulanX, tanggalX) =>
    `${tahunX}-${String(bulanX).padStart(2, "0")}-${String(tanggalX).padStart(2, "0")}`;

  const getDownloadData = () => {
    return Array.from({ length: jumlahHari }).map((_, index) => {
      const tanggal = index + 1;

      const key = buatKey(tahun, bulan + 1, tanggal);

      const status = jadwal[key] || "";

      let keterangan = "-";

      if (status === "mengaji") {
        keterangan = t.pdfStudy;
      }

      if (status === "libur") {
        keterangan = t.pdfHoliday;
      }

      return {
        no: tanggal,
        tanggal: `${String(tanggal).padStart(2, "0")} ${t.months[bulan]} ${tahun}`,
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
        [t.pdfTitle],
        ["TPQ Hairunissa Ternate"],
        [],
        [t.pdfPeriod, t.months[bulan], "|", "Tahun", tahun],
        [],
        [t.pdfHeaderNo, t.pdfHeaderDate, t.pdfHeaderDescription],
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
  // ARRAY BUFFER -> BASE64
  // =========================================================

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);

    let binary = "";

    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));

      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("KALENDER PENGAJIAN TPQ", centerX, 18, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(bulanTahun.toUpperCase(), centerX, 26, { align: "center" });

      const totalSel = offset + jumlahHari;
      const totalMinggu = Math.ceil(totalSel / 7);

      const gridTeks = [];
      const gridStatus = [];

      for (let m = 0; m < totalMinggu; m++) {
        const barisTeks = [];
        const barisStatus = [];

        for (let h = 0; h < 7; h++) {
          const selIndex = m * 7 + h;
          const tanggal = selIndex - offset + 1;

          if (tanggal < 1 || tanggal > jumlahHari) {
            barisTeks.push("");
            barisStatus.push(null);
            continue;
          }

          const tglKey = buatKey(tahun, bulan + 1, tanggal);
          const status = jadwal[tglKey];

          const label =
            status === "mengaji"
              ? "Mengaji"
              : status === "libur"
                ? "Libur"
                : "";

          barisTeks.push(label ? `${tanggal}\n${label}` : `${tanggal}`);
          barisStatus.push(status || null);
        }

        gridTeks.push(barisTeks);
        gridStatus.push(barisStatus);
      }

      autoTable(doc, {
        startY: 34,
        head: [
          ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        ],
        body: gridTeks,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          minCellHeight: 16,
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        didParseCell: (data) => {
          if (data.section !== "body") return;

          const status = gridStatus[data.row.index]?.[data.column.index];

          if (status === "mengaji") {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
          } else if (status === "libur") {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [153, 27, 27];
          }
        },
      });

      const keteranganY = doc.lastAutoTable.finalY + 10;

      doc.setFillColor(220, 252, 231);
      doc.rect(20, keteranganY - 4, 5, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("Mengaji", 28, keteranganY);

      doc.setFillColor(254, 226, 226);
      doc.rect(60, keteranganY - 4, 5, 5, "F");
      doc.text("Libur", 68, keteranganY);

      const nomorBulan = String(bulan + 1).padStart(2, "0");
      const namaFile = `kalender-pengajian-${tahun}-${nomorBulan}.pdf`;

      doc.save(namaFile);
      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF kalender:", error);
      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

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
  // RENDER
  // =========================================================

  return (
    <div className="bg-[#f8faf8] min-h-screen">
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
          <div className="text-center mb-5">
            <h1
              className="
                text-2xl
                md:text-4xl
                font-bold
                text-green-800
              "
            >
              {t.title}
            </h1>
          </div>

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
            <div className="grid grid-cols-7 gap-1 mb-3">
              {t.days.map((hari) => (
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

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({
                length: offset,
              }).map((_, i) => (
                <div key={i}></div>
              ))}

              {loading
                ? Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 md:h-20 rounded-xl" />
                  ))
                : Array.from({
                    length: jumlahHari,
                  }).map((_, index) => {
                const tanggal = index + 1;

                const key = buatKey(tahun, bulan + 1, tanggal);

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

            <span className="font-medium text-gray-700">{t.study}</span>
          </div>

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

            <span className="font-medium text-gray-700">{t.holiday}</span>
          </div>

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
              {t.download}
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
                    <div className="font-medium">{t.excel}</div>

                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

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
                    <div className="font-medium">{t.pdf}</div>

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

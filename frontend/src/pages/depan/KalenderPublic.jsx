import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { api } from "../../api";
import { Skeleton, SkeletonCard } from "../../components/Skeleton";

import heroImage from "../../assets/hero-putih04.jpg";
import dejaVuSansRegular from "../../assets/DejaVuSans.ttf";
import dejaVuSansBold from "../../assets/DejaVuSans-Bold.ttf";
import { siapkanFontPdf } from "../../utils/pdfFont";

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
  const downloadRef = useRef(null);

  // Tutup menu download saat klik di luar atau menekan Escape
  useEffect(() => {
    if (!showDownload) return;

    const onDown = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownload(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setShowDownload(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDownload]);

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

  const sekarang = new Date();

  const isToday = (tanggal) =>
    tanggal === sekarang.getDate() &&
    bulan === sekarang.getMonth() &&
    tahun === sekarang.getFullYear();

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

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const fontName = await siapkanFontPdf(doc, language, {
        regular: dejaVuSansRegular,
        bold: dejaVuSansBold,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.setFont(fontName, "bold");
      doc.setFontSize(16);
      doc.text(t.pdfTitle, centerX, 18, { align: "center" });

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.text(bulanTahun, centerX, 26, { align: "center" });

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
              ? t.study
              : status === "libur"
                ? t.holiday
                : "";

          barisTeks.push(label ? `${tanggal}\n${label}` : `${tanggal}`);
          barisStatus.push(status || null);
        }

        gridTeks.push(barisTeks);
        gridStatus.push(barisStatus);
      }

      autoTable(doc, {
        startY: 34,
        head: [t.days],
        body: gridTeks,
        theme: "grid",
        styles: {
          font: fontName,
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          minCellHeight: 16,
        },
        headStyles: {
          font: fontName,
          fillColor: [22, 101, 52],
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
      doc.setFont(fontName, "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(t.study, 28, keteranganY);

      doc.setFillColor(254, 226, 226);
      doc.rect(60, keteranganY - 4, 5, 5, "F");
      doc.text(t.holiday, 68, keteranganY);

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

  const hariKosong = Array.from({ length: offset });
  const hariBulan = Array.from({ length: jumlahHari }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#f6faf7] text-gray-800" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* HEADER DENGAN FOTO LATAR */}
      <section
        className="relative overflow-hidden px-4 pb-14 pt-8 md:px-6 md:pt-14"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
            {t.study} · {t.holiday}
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-gray-900 md:text-5xl">
            {t.title}
          </h1>

          {/* UNDUH */}
          <div ref={downloadRef} className="relative mt-6 inline-block">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={showDownload}
              onClick={() => setShowDownload((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-green-700"
            >
              <Download size={17} />
              {t.download}
            </button>

            {showDownload && (
              <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-xl">
                <button
                  type="button"
                  onClick={downloadExcel}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet size={18} className="text-green-600" />

                  <div>
                    <div className="font-medium">{t.excel}</div>
                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={downloadPDF}
                  className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileText size={18} className="text-red-600" />

                  <div>
                    <div className="font-medium">{t.pdf}</div>
                    <div className="text-xs text-gray-400">.pdf</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KALENDER */}
      <section className="mx-auto -mt-6 max-w-6xl px-4 pb-20 md:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xl shadow-green-900/5 md:p-8">
          {/* NAVIGASI BULAN */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-green-600" />

              <h2 className="text-lg font-semibold capitalize text-gray-900 md:text-2xl">
                {bulanTahun}
              </h2>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Bulan berikutnya"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* NAMA HARI */}
          <div className="mt-6 grid grid-cols-7 gap-1 md:gap-2">
            {t.days.map((hari) => (
              <div
                key={hari}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:text-xs"
              >
                {hari}
              </div>
            ))}
          </div>

          {/* GRID TANGGAL */}
          <div className="mt-1 grid grid-cols-7 gap-1 md:gap-2">
            {hariKosong.map((_, i) => (
              <div key={`kosong-${i}`} />
            ))}

            {loading
              ? Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={`sk-${i}`} className="h-14 rounded-xl md:h-20" />
                ))
              : hariBulan.map((tanggal) => {
                  const status = jadwal[buatKey(tahun, bulan + 1, tanggal)];
                  const hariIni = isToday(tanggal);

                  return (
                    <div
                      key={tanggal}
                      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl md:h-20 border text-sm transition md:rounded-2xl ${
                        hariIni
                          ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                          : "border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/40"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          hariIni ? "text-green-700" : "text-gray-800"
                        }`}
                      >
                        {tanggal}
                      </span>

                      {status === "mengaji" && (
                        <span className="rounded-full bg-green-500 px-1.5 text-[9px] font-semibold uppercase leading-4 text-white md:px-2 md:text-[10px]">
                          {t.study}
                        </span>
                      )}

                      {status === "libur" && (
                        <span className="rounded-full bg-red-500 px-1.5 text-[9px] font-semibold uppercase leading-4 text-white md:px-2 md:text-[10px]">
                          {t.holiday}
                        </span>
                      )}
                    </div>
                  );
                })}
          </div>

          {/* LEGENDA */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 pt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              {t.study}
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />

              {t.holiday}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

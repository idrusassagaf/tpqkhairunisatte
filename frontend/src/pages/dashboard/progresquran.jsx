import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText, BookMarked } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { api } from "../../api";
import { SkeletonRows } from "../../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

export default function ProgresQuran() {
  const [loading, setLoading] = useState(true);

  const [dataQuran, setDataQuran] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState("");
  const [filterSurah, setFilterSurah] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");

  // ================= DOWNLOAD =================
  const [showDownload, setShowDownload] = useState(false);

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      // Ambil data santri + progres Al-Qur'an dari backend
      const [masterRes, quranRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/progres-quran"),
      ]);

      const santri = masterRes?.data?.data?.santri || [];

      const progresData = {};

      (quranRes?.data?.data || []).forEach((row) => {
        if (!row?.nis) return;

        progresData[`quran_guru_${row.nis}`] = row.nama_guru || "";
        progresData[`quran_juz_${row.nis}`] = row.juz || "";
        progresData[`quran_surah_${row.nis}`] = row.surah || "";
        progresData[`quran_ayat_${row.nis}`] = row.ayat || "";
        progresData[`quran_hal_${row.nis}`] = row.halaman || "";
        progresData[`quran_progres_${row.nis}`] = row.progres || "";
      });

      // Filter khusus kelas Al Quran
      const santriQuran = santri.filter((s) => {
        return (
          (s.kelas || "").trim().toLowerCase() === "al quran" ||
          (s.kelas || "").trim().toLowerCase() === "alquran" ||
          (s.kelas || "").trim().toLowerCase() === "al-qur'an"
        );
      });

      // Gabungkan data
      const hasil = santriQuran.map((s) => {
        const progres = progresData[`quran_progres_${s.nis}`] || "";

        return {
          nama: s.nama || "-",
          nis: s.nis || "-",
          kelas: s.kelas || "-",
          guru: progresData[`quran_guru_${s.nis}`] || "-",
          juz: progresData[`quran_juz_${s.nis}`] || "-",
          surah: progresData[`quran_surah_${s.nis}`] || "-",
          ayat: progresData[`quran_ayat_${s.nis}`] || "-",
          halaman: progresData[`quran_hal_${s.nis}`] || "-",
          progres: progres || "-",

          prestasi:
            progres === "Lancar"
              ? "Di-Lanjut"
              : progres === "Belum"
                ? "Di-Ulang"
                : "-",

          update: new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        };
      });

      setDataQuran(hasil);
      setFilteredData(hasil);
    } catch (err) {
      console.error("Gagal ambil data progres quran:", err);

      setDataQuran([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  useEffect(() => {
    const hasilFilter = dataQuran.filter((d) => {
      const keyword = search.toLowerCase();

      const cocokSearch = `
        ${d.nama || ""}
        ${d.nis || ""}
        ${d.guru || ""}
        ${d.surah || ""}
        ${d.juz || ""}
        ${d.ayat || ""}
        ${d.halaman || ""}
        ${d.progres || ""}
        ${d.prestasi || ""}
      `
        .toLowerCase()
        .includes(keyword);

      const cocokJuz = !filterJuz || String(d.juz) === String(filterJuz);

      const cocokSurah =
        !filterSurah ||
        (d.surah || "").toLowerCase().includes(filterSurah.toLowerCase());

      const cocokProgres = !filterProgres || d.progres === filterProgres;

      const cocokPrestasi = !filterPrestasi || d.prestasi === filterPrestasi;

      return (
        cocokSearch && cocokJuz && cocokSurah && cocokProgres && cocokPrestasi
      );
    });

    setFilteredData(hasilFilter);
  }, [
    dataQuran,
    search,
    filterJuz,
    filterSurah,
    filterProgres,
    filterPrestasi,
  ]);

  // ================= RESET HALAMAN =================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJuz, filterSurah, filterProgres, filterPrestasi]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data progres Al-Qur'an yang dapat di-download.",
      });
      return;
    }

    const excelData = filteredData.map((d, index) => ({
      No: index + 1,
      "Nama Santri": d.nama || "-",
      NIS: d.nis || "-",
      Guru: d.guru || "-",
      Kelas: d.kelas || "-",
      Juz: d.juz || "-",
      Surah: d.surah || "-",
      Ayat: d.ayat || "-",
      Halaman: d.halaman || "-",
      Progres: d.progres || "-",
      Prestasi: d.prestasi || "-",
      Update: d.update || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // =======================================================
    // LEBAR KOLOM EXCEL
    // =======================================================

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 15 },
      { wch: 25 },
      { wch: 16 },
      { wch: 10 },
      { wch: 28 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Progres Al Quran");

    const namaFile = search.trim()
      ? "progres-alquran-hasil-pencarian.xlsx"
      : "progres-alquran.xlsx";

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = () => {
    if (filteredData.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data progres Al-Qur'an yang dapat di-download.",
      });
      return;
    }

    try {
      // =====================================================
      // TANGGAL DOWNLOAD REALTIME
      // =====================================================

      const tanggalUpdate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // =====================================================
      // BUAT DOKUMEN PDF
      // =====================================================

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // =====================================================
      // UKURAN HALAMAN
      // =====================================================

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // =====================================================
      // JUDUL
      // =====================================================

      doc.setFontSize(16);

      doc.setFont("helvetica", "bold");

      doc.text("PROGRES AL'QURAN", centerX, 15, {
        align: "center",
      });

      // =====================================================
      // SUB JUDUL
      // =====================================================

      doc.setFontSize(10);

      doc.setFont("helvetica", "normal");

      doc.text("TPQ Hairunissa Ternate", centerX, 21, {
        align: "center",
      });

      // =====================================================
      // INFO FILTER / PENCARIAN
      // =====================================================

      let startY = 27;

      if (
        search.trim() ||
        filterJuz ||
        filterSurah ||
        filterProgres ||
        filterPrestasi
      ) {
        doc.setFontSize(8);

        const info = [];

        if (search.trim()) {
          info.push(`Pencarian: "${search}"`);
        }

        if (filterJuz) {
          info.push(`Juz: ${filterJuz}`);
        }

        if (filterSurah) {
          info.push(`Surah: ${filterSurah}`);
        }

        if (filterProgres) {
          info.push(`Progres: ${filterProgres}`);
        }

        if (filterPrestasi) {
          info.push(`Prestasi: ${filterPrestasi}`);
        }

        doc.text(info.join("  |  "), 10, 28);

        startY = 33;
      }

      // =====================================================
      // DATA TABEL
      // =====================================================

      const tableData = filteredData.map((d, index) => [
        index + 1,
        d.nama || "-",
        d.nis || "-",
        d.guru || "-",
        d.kelas || "-",
        d.juz || "-",
        d.surah || "-",
        d.ayat || "-",
        d.halaman || "-",
        d.progres || "-",
        d.prestasi || "-",
        d.update || "-",
      ]);

      // =====================================================
      // TABEL PDF
      // =====================================================

      autoTable(doc, {
        startY,

        head: [
          [
            "No",
            "Nama Santri",
            "NIS",
            "Guru",
            "Kelas",
            "Juz",
            "Surah",
            "Ayat",
            "Halaman",
            "Progres",
            "Prestasi",
            "Update",
          ],
        ],

        body: tableData,

        theme: "grid",

        // ===================================================
        // STYLE
        // ===================================================

        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontSize: 7.5,
          fontStyle: "bold",
          halign: "center",
        },

        // ===================================================
        // LEBAR KOLOM
        // ===================================================

        columnStyles: {
          0: {
            cellWidth: 8,
            halign: "center",
          },

          1: {
            cellWidth: 29,
          },

          2: {
            cellWidth: 17,
          },

          3: {
            cellWidth: 28,
          },

          4: {
            cellWidth: 18,
          },

          5: {
            cellWidth: 11,
            halign: "center",
          },

          6: {
            cellWidth: 30,
          },

          7: {
            cellWidth: 11,
            halign: "center",
          },

          8: {
            cellWidth: 15,
            halign: "center",
          },

          9: {
            cellWidth: 18,
            halign: "center",
          },

          10: {
            cellWidth: 20,
            halign: "center",
          },

          11: {
            cellWidth: 25,
          },
        },

        // ===================================================
        // POSISI TABEL
        // ===================================================

        margin: {
          left: 33.5,
          right: 33.5,
        },

        // ===================================================
        // FOOTER PDF — SATU BARIS
        // ===================================================

        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          doc.setFont("helvetica", "normal");

          doc.setFontSize(7);

          doc.text(
            `TPQ Hairunissa • Progres Al'Quran • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
            centerX,
            pageHeight - 7,
            {
              align: "center",
            },
          );
        },
      });

      // =====================================================
      // NAMA FILE PDF
      // =====================================================

      const namaFile = search.trim()
        ? "progres-alquran-hasil-pencarian.pdf"
        : "progres-alquran.pdf";

      doc.save(namaFile);

      // =====================================================
      // TUTUP MENU DOWNLOAD
      // =====================================================

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF Quran:", error);
      window.__tpqNotify?.toast({
        type: "error",
        title: "Download gagal",
        message: "PDF gagal dibuat. Silakan cek Console browser.",
      });
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 overflow-x-hidden p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BookMarked size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Progres Al-Qur&apos;an</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Pantau juz, surah, ayat, dan progres bacaan santri.
            </p>
          </div>
        </div>

        {/* DOWNLOAD */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDownload((prev) => !prev)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
          >
            <Download size={17} />
            Download
          </button>

          {showDownload && (
            <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg md:w-52">
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <FileSpreadsheet size={18} className="text-green-600" />

                <div className="text-left">
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-gray-400">.xlsx</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex w-full items-center gap-3 border-t px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
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

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <input
            type="text"
            placeholder="Cari santri / guru / surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} md:w-72`}
          />

          <select
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            className={`${inputCls} md:w-36`}
          >
            <option value="">Semua Juz</option>

            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Juz {i + 1}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter Surah"
            value={filterSurah}
            onChange={(e) => setFilterSurah(e.target.value)}
            className={`${inputCls} md:w-44`}
          />

          <select
            value={filterProgres}
            onChange={(e) => setFilterProgres(e.target.value)}
            className={`${inputCls} md:w-44`}
          >
            <option value="">Semua Progres</option>
            <option value="Belum">Belum</option>
            <option value="Lancar">Lancar</option>
          </select>

          <select
            value={filterPrestasi}
            onChange={(e) => setFilterPrestasi(e.target.value)}
            className={`${inputCls} md:w-44`}
          >
            <option value="">Semua Prestasi</option>
            <option value="Di-Lanjut">Di-Lanjut</option>
            <option value="Di-Ulang">Di-Ulang</option>
          </select>
        </div>

        {loading ? (
          <SkeletonRows rows={6} cols={6} />
        ) : (
          <>
          {/* DESKTOP */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Santri</th>
                <th className="px-4 py-3 font-semibold">NIS</th>
                <th className="px-4 py-3 font-semibold">Guru</th>
                <th className="px-4 py-3 font-semibold">Kelas</th>
                <th className="px-4 py-3 font-semibold">Juz</th>
                <th className="px-4 py-3 font-semibold">Surah</th>
                <th className="px-4 py-3 font-semibold">Ayat</th>
                <th className="px-4 py-3 font-semibold">Halaman</th>
                <th className="px-4 py-3 font-semibold">Progres</th>
                <th className="px-4 py-3 font-semibold">Prestasi</th>
                <th className="px-4 py-3 font-semibold">Update</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    Belum ada data progres Qur&apos;an
                  </td>
                </tr>
              ) : (
                currentData.map((d, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-100 transition hover:bg-emerald-50/40"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{d.nama}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{d.nis}</td>

                    <td className="px-4 py-3">{d.guru}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{d.kelas}</td>

                    <td className="px-4 py-3 text-center">{d.juz}</td>

                    <td className="px-4 py-3">{d.surah}</td>

                    <td className="px-4 py-3 text-center">{d.ayat}</td>

                    <td className="px-4 py-3 text-center">{d.halaman}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          d.progres === "Lancar"
                            ? "bg-green-100 text-green-700"
                            : d.progres === "Belum"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.progres}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium">{d.prestasi}</td>

                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {d.update}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}
        <div className="w-full space-y-3 md:hidden">
          {currentData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Belum ada data progres Qur&apos;an
            </div>
          ) : (
            currentData.map((d, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="bg-emerald-50 px-4 py-3 text-center">
                  <div className="font-semibold text-gray-900">
                    {d.nama?.toUpperCase()}
                  </div>

                  <div className="mt-0.5 text-xs text-gray-500">
                    NIS {d.nis} · Kelas {d.kelas}
                  </div>
                </div>

                <div className="space-y-2 p-4 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
                      Juz {d.juz}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
                      Ayat {d.ayat || "-"}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
                      Hal. {d.halaman}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        d.progres === "Lancar"
                          ? "bg-green-100 text-green-700"
                          : d.progres === "Belum"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.progres || "-"}
                    </span>
                  </div>

                  <div>
                    Surah <span className="font-medium">{d.surah || "-"}</span>
                  </div>

                  <div>
                    Guru <span className="font-medium">{d.guru || "-"}</span>
                  </div>

                  <div>
                    Prestasi <span className="font-semibold">{d.prestasi || "-"}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-2 text-xs text-purple-700">
                    Update tanggal {d.update}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        </>
        )}

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">{startIndex + 1}</span>{" "}
              –{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">{filteredData.length}</span>{" "}
              data
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] rounded-lg border px-3 py-1.5 text-xs transition ${
                        currentPage === page
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

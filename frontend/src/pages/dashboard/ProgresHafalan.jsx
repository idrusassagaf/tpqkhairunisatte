import { useEffect, useState } from "react";
import { api } from "../../api";
import { SkeletonRows } from "../../components/Skeleton";
import { Eye, Download, FileSpreadsheet, FileText, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

export default function ProgresHafalan() {
  const [loading, setLoading] = useState(true);

  const [santri, setSantri] = useState([]);
  const [hafalanByNis, setHafalanByNis] = useState({});
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDownload, setShowDownload] = useState(false);

  const itemsPerPage = 10;

  const navigate = useNavigate();

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = async () => {
    try {
      const [masterRes, hafalanRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/progres-hafalan"),
      ]);

      const dataSantri = masterRes?.data?.data?.santri || [];

      setSantri(dataSantri);

      const grouped = {};

      (hafalanRes?.data?.data || []).forEach((row) => {
        if (!row?.nis) return;

        if (!grouped[row.nis]) {
          grouped[row.nis] = [];
        }

        grouped[row.nis].push(row);
      });

      setHafalanByNis(grouped);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // JUMLAH HAFALAN
  // =========================================================

  const getJumlahHafalan = (nis, status) => {
    const rows = hafalanByNis[nis] || [];

    return rows.filter((item) => item?.progres === status).length;
  };

  // =========================================================
  // FILTER / SEARCH
  // =========================================================

  const filteredSantri = santri.filter((s) => {
    const keyword = search.toLowerCase();

    return `
      ${s.nama || ""}
      ${s.nis || ""}
      ${s.kelas || ""}
    `
      .toLowerCase()
      .includes(keyword);
  });

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(filteredSantri.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedSantri = filteredSantri.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (filteredSantri.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data santri yang dapat di-download.",
      });
      return;
    }

    const excelData = filteredSantri.map((s, index) => ({
      No: index + 1,

      "Nama Santri": s.nama || "-",

      NIS: s.nis || "-",

      Kelas: s.kelas || "-",

      "Sudah Lancar": `${getJumlahHafalan(s.nis, "Lancar")}-Hafalan`,

      "Belum Lancar": `${getJumlahHafalan(s.nis, "Belum")}-Hafalan`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // =======================================================
    // LEBAR KOLOM EXCEL
    // =======================================================

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Progres Hafalan");

    const namaFile = search.trim()
      ? "progres-hafalan-hasil-pencarian.xlsx"
      : "progres-hafalan.xlsx";

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = () => {
    if (filteredSantri.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data santri yang dapat di-download.",
      });
      return;
    }

    try {
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

      doc.text("PROGRES HAFALAN", centerX, 15, {
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
      // INFO PENCARIAN
      // =====================================================

      if (search.trim()) {
        doc.setFontSize(8);

        doc.text(`Hasil pencarian: "${search}"`, 10, 28);
      }

      // =====================================================
      // DATA TABEL
      // =====================================================

      const tableData = filteredSantri.map((s, index) => [
        index + 1,

        s.nama || "-",

        s.nis || "-",

        s.kelas || "-",

        `${getJumlahHafalan(s.nis, "Lancar")}-Hafalan`,

        `${getJumlahHafalan(s.nis, "Belum")}-Hafalan`,
      ]);

      // =====================================================
      // TABEL PDF
      // =====================================================

      autoTable(doc, {
        startY: search.trim() ? 33 : 27,

        head: [
          ["No", "Nama Santri", "NIS", "Kelas", "Sudah Lancar", "Belum Lancar"],
        ],

        body: tableData,

        theme: "grid",

        // ===================================================
        // STYLE TABEL
        // ===================================================

        styles: {
          fontSize: 8,

          cellPadding: 3,

          overflow: "linebreak",

          valign: "middle",
        },

        headStyles: {
          fontSize: 8,

          fontStyle: "bold",

          halign: "center",
        },

        // ===================================================
        // LEBAR KOLOM
        // ===================================================

        columnStyles: {
          0: {
            cellWidth: 12,

            halign: "center",
          },

          1: {
            cellWidth: 70,
          },

          2: {
            cellWidth: 35,
          },

          3: {
            cellWidth: 40,
          },

          4: {
            cellWidth: 45,

            halign: "center",
          },

          5: {
            cellWidth: 45,

            halign: "center",
          },
        },

        // ===================================================
        // POSISI TABEL
        // ===================================================

        margin: {
          left: 25,

          right: 25,
        },

        // ===================================================
        // FOOTER
        // ===================================================

        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          const tanggalUpdate = new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });

          doc.setFontSize(7);

          doc.setFont("helvetica", "normal");

          doc.text(
            `TPQ Hairunissa • Progres Hafalan • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
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
        ? "progres-hafalan-hasil-pencarian.pdf"
        : "progres-hafalan.pdf";

      doc.save(namaFile);

      // =====================================================
      // TUTUP MENU DOWNLOAD
      // =====================================================

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF hafalan:", error);
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
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <BookOpen size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Progres Hafalan</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Rekap hafalan yang sudah dan belum lancar setiap santri.
            </p>
          </div>
        </div>

        {/* SEARCH + DOWNLOAD */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Cari nama / NIS / kelas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputCls} sm:w-72`}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <Download size={17} />
              Download
            </button>

            {showDownload && (
              <div className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:left-auto sm:right-0 sm:w-52">
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
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-16 px-4 py-3 text-center font-semibold">No.</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Santri</th>
                <th className="px-4 py-3 text-left font-semibold">NIS</th>
                <th className="px-4 py-3 text-left font-semibold">Kelas</th>
                <th className="px-4 py-3 text-center font-semibold">Sudah Lancar</th>
                <th className="px-4 py-3 text-center font-semibold">Belum Lancar</th>
                <th className="px-4 py-3 text-center font-semibold">Lihat Progres</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-0">
                    <SkeletonRows rows={6} cols={5} />
                  </td>
                </tr>
              ) : santri.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Data santri belum tersedia
                  </td>
                </tr>
              ) : (
                paginatedSantri.map((s, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-100 transition hover:bg-purple-50/40"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{i + 1}</td>

                    <td className="px-4 py-3 font-semibold text-gray-900">{s.nama}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{s.nis}</td>

                    <td className="px-4 py-3 whitespace-nowrap">{s.kelas || "-"}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {getJumlahHafalan(s.nis, "Lancar")} Hafalan
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        {getJumlahHafalan(s.nis, "Belum")} Hafalan
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        aria-label={`Lihat progres hafalan ${s.nama}`}
                        onClick={() => navigate(`/dashboard/progres-hafalan/${s.nis}`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 transition hover:bg-purple-100"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <SkeletonRows rows={5} cols={3} />
          ) : paginatedSantri.map((s, i) => {
            const lancar = getJumlahHafalan(s.nis, "Lancar");
            const belum = getJumlahHafalan(s.nis, "Belum");

            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-500">{i + 1}.</span>

                      <span className="truncate font-semibold text-gray-900">{s.nama}</span>
                    </div>

                    <div className="mt-1 ml-6 text-xs text-gray-500">
                      NIS {s.nis} · Kelas {s.kelas || "-"}
                    </div>

                    <div className="mt-3 ml-6 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {lancar} Lancar
                      </span>

                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        {belum} Belum
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Lihat progres hafalan ${s.nama}`}
                    onClick={() => navigate(`/dashboard/progres-hafalan/${s.nis}`)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 transition hover:bg-purple-100"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {filteredSantri.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredSantri.length)} dari{" "}
              {filteredSantri.length} santri
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

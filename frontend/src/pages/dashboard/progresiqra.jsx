import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText, BookOpen } from "lucide-react";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../../api";
import { SkeletonRows } from "../../components/Skeleton";

export default function ProgresIqra() {
  const [loading, setLoading] = useState(true);

  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [progresData, setProgresData] = useState({});
  const [searchIqra, setSearchIqra] = useState("");
  const [filterJilid, setFilterJilid] = useState("");
  const [filterProgres, setFilterProgres] = useState("");
  const [filterPrestasi, setFilterPrestasi] = useState("");

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // ================= DOWNLOAD =================
  const [showDownload, setShowDownload] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const [masterRes, iqraRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/progres-iqra"),
      ]);

      setSantri(masterRes?.data?.data?.santri || []);
      setGuru(masterRes?.data?.data?.guru || []);

      const progresIqraData = {};

      (iqraRes?.data?.data || []).forEach((row) => {
        if (!row?.nis) return;

        progresIqraData[row.nis] = row.progres || "";
        progresIqraData[`guru_${row.nis}`] = row.nama_guru || "";
        progresIqraData[`jilid_${row.nis}`] = row.jilid || "";
        progresIqraData[`hal_${row.nis}`] = row.halaman || "";
      });

      setProgresData(progresIqraData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER IQRA =================
  const santriIqra = santri.filter((s) => {
    const isIqra = (s.kelas || "").toLowerCase().includes("iqra");

    const guruDipilih = progresData[`guru_${s.nis}`] || "";
    const progresDipilih = progresData[s.nis] || "";
    const jilidDipilih = progresData[`jilid_${s.nis}`] || "";

    const prestasi =
      progresDipilih === "Lancar"
        ? "Di-Lanjut"
        : progresDipilih === "Belum"
          ? "Di-Ulang"
          : "";

    // SEARCH
    const keyword = searchIqra.toLowerCase();

    const cocokSearch = `
      ${s.nama || ""}
      ${guruDipilih}
      ${s.nis || ""}
    `
      .toLowerCase()
      .includes(keyword);

    // FILTER
    const cocokJilid = !filterJilid || jilidDipilih === filterJilid;
    const cocokProgres = !filterProgres || progresDipilih === filterProgres;
    const cocokPrestasi = !filterPrestasi || prestasi === filterPrestasi;

    return isIqra && cocokSearch && cocokJilid && cocokProgres && cocokPrestasi;
  });

  // ================= RESET HALAMAN SAAT FILTER BERUBAH =================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchIqra, filterJilid, filterProgres, filterPrestasi]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(santriIqra.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentSantri = santriIqra.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // =========================================================
  // DATA UNTUK DOWNLOAD
  // =========================================================

  const getDownloadData = () => {
    return santriIqra.map((s, index) => {
      const namaGuru = progresData[`guru_${s.nis}`] || "-";

      const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

      const progres = progresData[s.nis] || "-";

      const prestasi =
        progres === "Lancar"
          ? "Di-Lanjut"
          : progres === "Belum"
            ? "Di-Ulang"
            : "-";

      return {
        no: index + 1,
        nama: s.nama || "-",
        nis: s.nis || "-",
        guru: namaGuru,
        nig: dataGuru?.nig || "-",
        kelas: s.kelas || "-",
        jilid: progresData[`jilid_${s.nis}`] || "-",
        halaman: progresData[`hal_${s.nis}`] || "-",
        progres,
        prestasi,
      };
    });
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (santriIqra.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data progres Iqra yang dapat di-download.",
      });
      return;
    }

    const downloadData = getDownloadData();

    const excelData = downloadData.map((d) => ({
      No: d.no,
      "Nama Santri": d.nama,
      NIS: d.nis,
      Guru: d.guru,
      NIG: d.nig,
      Kelas: d.kelas,
      Jilid: d.jilid,
      Halaman: d.halaman,
      Progres: d.progres,
      Prestasi: d.prestasi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // ================= LEBAR KOLOM =================

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 15 },
      { wch: 28 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Progres Iqra");

    const namaFile = searchIqra.trim()
      ? "progres-iqra-hasil-pencarian.xlsx"
      : "progres-iqra.xlsx";

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = () => {
    if (santriIqra.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data progres Iqra yang dapat di-download.",
      });
      return;
    }

    try {
      // ================= DOKUMEN PDF =================

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // ================= JUDUL =================

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");

      doc.text("PROGRES IQRA", centerX, 15, {
        align: "center",
      });

      // ================= SUB JUDUL =================

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text("TPQ Hairunissa Ternate", centerX, 21, {
        align: "center",
      });

      // ================= INFO FILTER =================

      let startY = 27;

      if (searchIqra.trim()) {
        doc.setFontSize(8);

        doc.text(`Hasil pencarian: "${searchIqra}"`, 10, 27);

        startY = 33;
      }

      // ================= DATA TABEL =================

      const tableData = getDownloadData().map((d) => [
        d.no,
        d.nama,
        d.nis,
        d.guru,
        d.nig,
        d.kelas,
        d.jilid,
        d.halaman,
        d.progres,
        d.prestasi,
      ]);

      // ================= TABEL =================

      autoTable(doc, {
        startY,

        head: [
          [
            "No",
            "Nama Santri",
            "NIS",
            "Guru",
            "NIG",
            "Kelas",
            "Jilid",
            "Hal.",
            "Progres",
            "Prestasi",
          ],
        ],

        body: tableData,

        theme: "grid",

        // ================= STYLE =================

        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },

        // ================= LEBAR KOLOM =================

        columnStyles: {
          0: {
            cellWidth: 9,
            halign: "center",
          },

          1: {
            cellWidth: 35,
          },

          2: {
            cellWidth: 20,
          },

          3: {
            cellWidth: 35,
          },

          4: {
            cellWidth: 20,
          },

          5: {
            cellWidth: 20,
          },

          6: {
            cellWidth: 18,
            halign: "center",
          },

          7: {
            cellWidth: 15,
            halign: "center",
          },

          8: {
            cellWidth: 20,
            halign: "center",
          },

          9: {
            cellWidth: 22,
            halign: "center",
          },
        },

        // ================= POSISI TABEL =================

        margin: {
          left: 41.5,
          right: 41.5,
        },

        // ================= FOOTER =================

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
            `TPQ Hairunissa • Progres Iqra • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
            centerX,
            pageHeight - 7,
            {
              align: "center",
            },
          );
        },
      });

      // ================= NAMA FILE =================

      const namaFile = searchIqra.trim()
        ? "progres-iqra-hasil-pencarian.pdf"
        : "progres-iqra.pdf";

      doc.save(namaFile);

      // ================= TUTUP MENU =================

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF Iqra:", error);
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <BookOpen size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Progres Iqra</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Pantau jilid, halaman, dan progres belajar santri Iqra.
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
            placeholder="Cari santri / guru..."
            value={searchIqra}
            onChange={(e) => setSearchIqra(e.target.value)}
            className={`${inputCls} md:w-72`}
          />

          <select
            value={filterJilid}
            onChange={(e) => setFilterJilid(e.target.value)}
            className={`${inputCls} md:w-40`}
          >
            <option value="">Semua Jilid</option>
            <option value="Iqra 1">Iqra 1</option>
            <option value="Iqra 2">Iqra 2</option>
            <option value="Iqra 3">Iqra 3</option>
            <option value="Iqra 4">Iqra 4</option>
            <option value="Iqra 5">Iqra 5</option>
            <option value="Iqra 6">Iqra 6</option>
          </select>

          <select
            value={filterProgres}
            onChange={(e) => setFilterProgres(e.target.value)}
            className={`${inputCls} md:w-44`}
          >
            <option value="">Semua Progres</option>
            <option value="Lancar">Lancar</option>
            <option value="Belum">Belum</option>
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
        {/* MOBILE CARD */}
        <div className="w-full space-y-3 md:hidden">
          {currentSantri.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Tidak ada data progres iqra
            </div>
          ) : (
            currentSantri.map((s, i) => {
              const namaGuru = progresData[`guru_${s.nis}`] || "-";

              const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

              const progres = progresData[s.nis] || "-";

              const prestasi =
                progres === "Lancar"
                  ? "Di-Lanjut"
                  : progres === "Belum"
                    ? "Di-Ulang"
                    : "-";

              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="bg-purple-50 px-4 py-3 text-center">
                    <div className="font-semibold text-gray-900">
                      {s.nama?.toUpperCase()}
                    </div>

                    <div className="mt-0.5 text-xs text-gray-500">
                      NIS {s.nis} · Kelas {s.kelas || "-"}
                    </div>
                  </div>

                  <div className="space-y-2 p-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
                        {progresData[`jilid_${s.nis}`] || "-"}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
                        Hal. {progresData[`hal_${s.nis}`] || "-"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          progres === "Lancar"
                            ? "bg-green-100 text-green-700"
                            : progres === "Belum"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {progres}
                      </span>
                    </div>

                    <div>
                      Guru <span className="font-medium">{namaGuru}</span>
                      {dataGuru?.nig ? ` · NIG ${dataGuru.nig}` : ""}
                    </div>

                    <div>
                      Prestasi <span className="font-semibold">{prestasi}</span>
                    </div>

                    <div className="pt-1 text-xs text-purple-700">
                      Update tanggal{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Santri</th>
                <th className="px-4 py-3 font-semibold">NIS</th>
                <th className="px-4 py-3 font-semibold">Guru</th>
                <th className="px-4 py-3 font-semibold">NIG</th>
                <th className="px-4 py-3 font-semibold">Kelas</th>
                <th className="px-4 py-3 font-semibold">Jilid</th>
                <th className="px-4 py-3 font-semibold">Hal.</th>
                <th className="px-4 py-3 font-semibold">Progres</th>
                <th className="px-4 py-3 font-semibold">Prestasi</th>
                <th className="px-4 py-3 font-semibold">Update</th>
              </tr>
            </thead>

            <tbody>
              {currentSantri.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data progres iqra
                  </td>
                </tr>
              ) : (
                currentSantri.map((s, i) => {
                  const namaGuru = progresData[`guru_${s.nis}`] || "-";

                  const dataGuru = guru.find((g) => g.nama_guru === namaGuru);

                  const progres = progresData[s.nis] || "-";

                  const prestasi =
                    progres === "Lancar"
                      ? "Di-Lanjut"
                      : progres === "Belum"
                        ? "Di-Ulang"
                        : "-";

                  return (
                    <tr
                      key={i}
                      className="border-t border-gray-100 transition hover:bg-purple-50/40"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">{s.nama}</td>

                      <td className="px-4 py-3 whitespace-nowrap">{s.nis}</td>

                      <td className="px-4 py-3">{namaGuru}</td>

                      <td className="px-4 py-3 whitespace-nowrap">{dataGuru?.nig || "-"}</td>

                      <td className="px-4 py-3 whitespace-nowrap">{s.kelas || "-"}</td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {progresData[`jilid_${s.nis}`] || "-"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {progresData[`hal_${s.nis}`] || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            progres === "Lancar"
                              ? "bg-green-100 text-green-700"
                              : progres === "Belum"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {progres}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium">{prestasi}</td>

                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        </>
      )}

      {/* PAGINATION */}
        {santriIqra.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">{startIndex + 1}</span>{" "}
              –{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, santriIqra.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">{santriIqra.length}</span>{" "}
              santri
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

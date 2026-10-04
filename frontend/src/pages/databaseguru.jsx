import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText, UserRound } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";
import { SkeletonRows } from "../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

export default function DatabaseGuru() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDownload, setShowDownload] = useState(false);

  // =========================================================
  // PAGINATION SETTING
  // =========================================================

  const itemsPerPage = 10;

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    api
      .get("/master-data")
      .then((res) => {
        setData(res?.data?.data?.guru || []);
      })
      .catch((err) => {
        console.error("Gagal ambil data guru:", err);

        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // =========================================================
  // FILTER DATA
  // =========================================================

  const filteredData = data.filter((g) => {
    const keyword = search.toLowerCase();

    const semuaData = `
      ${g.nama_guru || ""}
      ${g.nig || ""}
      ${g.jenis_kelamin === "L" ? "laki laki" : "perempuan"}
      ${g.tanggal_lahir || ""}
      ${g.usia || ""}
      ${g.pendidikan || ""}
      ${g.pekerjaan || ""}
      ${g.kontak || ""}
    `.toLowerCase();

    return semuaData.includes(keyword);
  });

  // =========================================================
  // PAGINATION CALCULATION
  // =========================================================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);

    setCurrentPage(1);
  };

  // =========================================================
  // PAGINATION HANDLER
  // =========================================================

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data guru yang dapat di-download.",
      });
      return;
    }

    const excelData = filteredData.map((g, index) => ({
      No: index + 1,

      "Nama Guru": g.nama_guru || "-",

      NIG: g.nig || "-",

      "Jenis Kelamin": g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

      Usia: g.usia ?? "-",

      "Tanggal Lahir": g.tanggal_lahir || "-",

      Pendidikan: g.pendidikan || "-",

      Pekerjaan: g.pekerjaan || "-",

      Kontak: g.kontak || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // =======================================================
    // LEBAR KOLOM EXCEL
    // =======================================================

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 15 },
      { wch: 18 },
      { wch: 8 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");

    const namaFile = search.trim()
      ? "database-guru-hasil-pencarian.xlsx"
      : "database-guru.xlsx";

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
        message: "Tidak ada data guru yang dapat di-download.",
      });
      return;
    }

    try {
      // =====================================================
      // TANGGAL DOWNLOAD REALTIME
      // Dibuat saat tombol PDF diklik
      // =====================================================

      const sekarang = new Date();

      const tanggalDownload = sekarang.toLocaleDateString("id-ID", {
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
      // HEADER PDF
      // =====================================================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(16);

      doc.text("DATABASE GURU", centerX, 15, {
        align: "center",
      });

      // =====================================================
      // SUB HEADER
      // =====================================================

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text("TPQ Hairunissa Ternate", centerX, 21, {
        align: "center",
      });

      // =====================================================
      // INFORMASI PENCARIAN
      // =====================================================

      let tableStartY = 27;

      if (search.trim()) {
        doc.setFontSize(8);

        doc.setFont("helvetica", "normal");

        doc.text(`Hasil pencarian: "${search}"`, 41.5, 28);

        tableStartY = 33;
      }

      // =====================================================
      // DATA TABEL
      // =====================================================

      const tableData = filteredData.map((g, index) => [
        index + 1,

        g.nama_guru || "-",

        g.nig || "-",

        g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

        g.usia ?? "-",

        g.tanggal_lahir || "-",

        g.pendidikan || "-",

        g.pekerjaan || "-",

        g.kontak || "-",
      ]);

      // =====================================================
      // TABEL PDF
      // =====================================================

      autoTable(doc, {
        startY: tableStartY,

        head: [
          [
            "No",
            "Nama Guru",
            "NIG",
            "JK",
            "Usia",
            "Tanggal Lahir",
            "Pendidikan",
            "Pekerjaan",
            "Kontak",
          ],
        ],

        body: tableData,

        theme: "grid",

        // ===================================================
        // STYLE TABEL
        // ===================================================

        styles: {
          font: "helvetica",

          fontSize: 8,

          cellPadding: 2.5,

          overflow: "linebreak",

          valign: "middle",
        },

        headStyles: {
          fontSize: 8,

          fontStyle: "bold",

          halign: "center",

          valign: "middle",
        },

        // ===================================================
        // LEBAR KOLOM
        // ===================================================

        columnStyles: {
          0: {
            cellWidth: 9,

            halign: "center",
          },

          1: {
            cellWidth: 32,
          },

          2: {
            cellWidth: 20,
          },

          3: {
            cellWidth: 25,

            halign: "center",
          },

          4: {
            cellWidth: 12,

            halign: "center",
          },

          5: {
            cellWidth: 25,
          },

          6: {
            cellWidth: 32,
          },

          7: {
            cellWidth: 32,
          },

          8: {
            cellWidth: 27,
          },
        },

        // ===================================================
        // POSISI TABEL DI TENGAH
        // ===================================================

        margin: {
          left: 41.5,

          right: 41.5,
        },

        // ===================================================
        // FOOTER PDF
        // SATU BARIS UTUH
        // ===================================================

        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);

          doc.text(
            `TPQ Hairunissa • Database Guru • Update ${tanggalDownload} • Halaman ${nomorHalaman}`,
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
        ? "database-guru-hasil-pencarian.pdf"
        : "database-guru.pdf";

      doc.save(namaFile);

      // =====================================================
      // TUTUP MENU DOWNLOAD
      // =====================================================

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF guru:", error);
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserRound size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Data Guru</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Daftar lengkap guru TPQ Hairunissa beserta pendidikan dan kontak.
            </p>
          </div>
        </div>

        {/* SEARCH + DOWNLOAD */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Cari data guru..."
            value={search}
            onChange={handleSearch}
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
              <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-52">
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
        {loading ? (
        <SkeletonRows rows={6} cols={5} />
      ) : (
        <>
        {/* MOBILE */}
        <div className="space-y-4 md:hidden">
          {filteredData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Data tidak ditemukan</div>
          ) : (
            paginatedData.map((g, i) => (
              <div
                key={g.id || i}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* HEADER CARD */}
                <div className="flex flex-col items-center gap-1 bg-blue-50 p-4 text-center">
                  {g.foto_url ? (
                    <img
                      src={g.foto_url}
                      alt="foto"
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-xs text-gray-500 shadow">
                      No Foto
                    </div>
                  )}

                  <h2 className="mt-2 text-lg font-bold uppercase text-gray-900">
                    {g.nama_guru}
                  </h2>
                </div>

                {/* NARASI */}
                <div className="p-4 text-sm leading-relaxed text-gray-700 text-justify">
                  <p>
                    Adalah guru TPQ Khairunisa Ternate dengan nomor ID{" "}
                    <b>{g.nig}</b>. Berjenis kelamin{" "}
                    {g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} dan
                    berusia {g.usia} tahun. Lahir pada tanggal {g.tanggal_lahir}.
                    Memiliki latar belakang pendidikan{" "}
                    <b>{g.pendidikan || "-"}</b> dan bekerja sebagai{" "}
                    <b>{g.pekerjaan || "-"}</b>. Dapat dihubungi melalui nomor
                    kontak <b>{g.kontak || "-"}</b>.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Foto</th>
                <th className="px-4 py-3 text-left font-semibold">Nama / NIG</th>
                <th className="px-4 py-3 text-left font-semibold">JK, Usia / Kelahiran</th>
                <th className="px-4 py-3 text-left font-semibold">Pendidikan / Pekerjaan</th>
                <th className="px-4 py-3 text-left font-semibold">Kontak</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                paginatedData.map((d, i) => (
                  <tr
                    key={d.id || i}
                    className="border-t border-gray-100 align-top transition hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-3">
                      {d.foto_url ? (
                        <img
                          src={d.foto_url}
                          alt="foto"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{d.nama_guru}</div>
                      <div className="text-xs text-gray-500">{d.nig}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                        {d.usia} Th
                      </div>
                      <div className="text-xs text-gray-500">{d.tanggal_lahir}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{d.pendidikan || "-"}</div>
                      <div className="text-xs text-gray-500">{d.pekerjaan || "-"}</div>
                    </td>

                    <td className="px-4 py-3">{d.kontak || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </>
      )}

      {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={handlePreviousPage}
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
                      onClick={() => handlePageChange(page)}
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
                  onClick={handleNextPage}
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

import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";

export default function DatabaseGuru() {
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
      });
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
      alert("Tidak ada data guru yang dapat di-download.");

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
      alert("Tidak ada data guru yang dapat di-download.");

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

      doc.text("TPQ Khairunissa Ternate", centerX, 21, {
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
            `TPQ Khairunissa • Database Guru • Update ${tanggalDownload} • Halaman ${nomorHalaman}`,
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
      console.error("Gagal membuat PDF Database Guru:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-4 space-y-4">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* TITLE */}

        <h1 className="text-lg font-light text-black tracking-wide">
          DATA BASE GURU
        </h1>

        {/* SEARCH + DOWNLOAD */}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Cari data guru..."
            value={search}
            onChange={handleSearch}
            className="border p-2 rounded w-full sm:w-64"
          />

          {/* DOWNLOAD */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <Download size={17} />
              Download
            </button>

            {showDownload && (
              <div className="absolute right-0 mt-2 w-full sm:w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {/* =================================================
                    EXCEL
                ================================================= */}

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FileSpreadsheet size={18} className="text-green-600" />

                  <div className="text-left">
                    <div className="font-medium">Excel</div>

                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

                {/* =================================================
                    PDF
                ================================================= */}

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t"
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

      {/* =====================================================
          MOBILE
      ===================================================== */}

      <div className="block md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500">Data tidak ditemukan</div>
        ) : (
          paginatedData.map((g, i) => (
            <div
              key={g.id || i}
              className="overflow-hidden rounded-2xl shadow bg-white border"
            >
              {/* HEADER CARD */}

              <div className="bg-purple-600 p-2 mb-1 flex flex-col items-center space-y-0.5 text-center">
                {g.foto_url ? (
                  <img
                    src={g.foto_url}
                    alt="foto"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-xs">
                    No Foto
                  </div>
                )}

                <h2 className="mt-1 text-white font-bold text-lg uppercase">
                  {g.nama_guru}
                </h2>
              </div>

              {/* NARASI */}

              <div className="bg-gray-300 p-4 font-extralight text-sm text-gray-800 space-y-3 text-justify">
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

      {/* =====================================================
          DESKTOP
      ===================================================== */}

      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full text-xs font-medium">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="text-left p-2">Foto</th>

              <th className="text-left p-2">Nama / NIG</th>

              <th className="text-left p-2">JK, Usia / Kelahiran</th>

              <th className="text-left p-2">Pendidikan / Pekerjaan</th>

              <th className="text-left p-2">Kontak</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((d, i) => (
                <tr
                  key={d.id || i}
                  className="border-t hover:bg-gray-50 align-top"
                >
                  {/* FOTO */}

                  <td className="p-2">
                    {d.foto_url ? (
                      <img
                        src={d.foto_url}
                        alt="foto"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Img
                      </div>
                    )}
                  </td>

                  {/* NAMA / NIG */}

                  <td className="p-2">
                    <div className="font-medium">{d.nama_guru}</div>

                    <div className="text-gray-500 text-xs">{d.nig}</div>
                  </td>

                  {/* JK + USIA */}

                  <td className="p-2">
                    <div>
                      {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                      {d.usia} Th
                    </div>

                    <div className="text-gray-500 text-xs">
                      {d.tanggal_lahir}
                    </div>
                  </td>

                  {/* PENDIDIKAN / PEKERJAAN */}

                  <td className="p-2">
                    <div>{d.pendidikan || "-"}</div>

                    <div className="text-gray-500 text-xs">
                      {d.pekerjaan || "-"}
                    </div>
                  </td>

                  {/* KONTAK */}

                  <td className="p-2">
                    <div>{d.kontak || "-"}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {filteredData.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {/* INFO DATA */}

          <div className="text-xs text-gray-500">
            Menampilkan {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredData.length)} dari{" "}
            {filteredData.length} data
          </div>

          {/* BUTTON PAGINATION */}

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* SEBELUMNYA */}

              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sebelumnya
              </button>

              {/* NOMOR HALAMAN */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-xs rounded border ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* BERIKUTNYA */}

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs rounded border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

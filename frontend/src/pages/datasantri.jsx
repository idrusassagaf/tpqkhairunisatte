import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";

export default function DataSantri() {
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDownload, setShowDownload] = useState(false);

  // ================= PAGINATION SETTING =================

  const itemsPerPage = 10;

  // ================= FILTER DATA =================

  const filteredData = data.filter((d) => {
    const keyword = search.toLowerCase();

    const semuaData = `
      ${d.nama || ""}
      ${d.nis || ""}
      ${d.kelas || ""}
      ${d.jenis_kelamin === "L" ? "laki laki" : "perempuan"}
      ${d.tanggal_lahir || ""}
      ${d.usia || ""}
      ${d.alamat || ""}
      ${d.kontak || ""}
      ${d.orang_tua?.nama_ayah || ""}
      ${d.orang_tua?.nama_ibu || ""}
      ${d.orang_tua?.pekerjaan_ayah || ""}
      ${d.orang_tua?.pekerjaan_ibu || ""}
      ${d.status_orangtua || ""}
      ${d.status_anak || ""}
    `.toLowerCase();

    return semuaData.includes(keyword);
  });

  // ================= PAGINATION CALCULATION =================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ================= FETCH DATA =================

  const fetchSantri = async () => {
    try {
      const res = await api.get("/master-data");

      setData(res?.data?.data?.santri || []);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);

      setData([]);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchSantri();
  }, []);

  // ================= SEARCH =================

  const handleSearch = (e) => {
    setSearch(e.target.value);

    // Kembali ke halaman pertama ketika pencarian berubah

    setCurrentPage(1);
  };

  // ================= PAGINATION HANDLER =================

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

  const downloadExcel = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data santri untuk di-download.");

      return;
    }

    const excelData = filteredData.map((d, index) => ({
      No: index + 1,

      Nama: d.nama || "-",

      NIS: d.nis || "-",

      "Jenis Kelamin": d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

      Usia: d.usia ?? "-",

      "Tanggal Lahir": d.tanggal_lahir || "-",

      Kelas: d.kelas || "-",

      Alamat: d.alamat || "-",

      Kontak: d.kontak || "-",

      "Nama Ayah": d.orang_tua?.nama_ayah || "-",

      "Pekerjaan Ayah": d.orang_tua?.pekerjaan_ayah || "-",

      "Nama Ibu": d.orang_tua?.nama_ibu || "-",

      "Pekerjaan Ibu": d.orang_tua?.pekerjaan_ibu || "-",

      "Status Orang Tua": d.status_orangtua || "-",

      "Status Anak": d.status_anak || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Santri");

    // Lebar kolom

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 14 },
      { wch: 16 },
      { wch: 8 },
      { wch: 16 },
      { wch: 15 },
      { wch: 30 },
      { wch: 18 },
      { wch: 25 },
      { wch: 22 },
      { wch: 25 },
      { wch: 22 },
      { wch: 20 },
      { wch: 20 },
    ];

    const namaFile = search.trim()
      ? "data-santri-hasil-pencarian.xlsx"
      : "data-santri.xlsx";

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data santri untuk di-download.");

      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",

      unit: "mm",

      format: "a4",
    });

    // =====================================================
    // TANGGAL REALTIME
    // Diambil tepat saat tombol Download PDF ditekan
    // =====================================================

    const tanggalRealtime = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",

      month: "long",

      year: "numeric",
    });

    // ================= JUDUL =================

    doc.setFontSize(16);

    doc.setFont("helvetica", "bold");

    doc.text("DATA BASE SANTRI", 148, 15, {
      align: "center",
    });

    doc.setFontSize(10);

    doc.setFont("helvetica", "normal");

    doc.text("TPQ Khairunissa Ternate", 148, 21, {
      align: "center",
    });

    // ================= INFO PENCARIAN =================

    if (search.trim()) {
      doc.setFontSize(8);

      doc.text(`Hasil pencarian: "${search}"`, 14, 29);
    }

    // ================= DATA TABEL =================

    const rows = filteredData.map((d, index) => [
      index + 1,

      d.nama || "-",

      d.nis || "-",

      d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

      d.usia ?? "-",

      d.tanggal_lahir || "-",

      d.kelas || "-",

      d.alamat || "-",

      d.kontak || "-",

      d.orang_tua?.nama_ayah || "-",

      d.orang_tua?.nama_ibu || "-",

      d.status_orangtua || "-",

      d.status_anak || "-",
    ]);

    autoTable(doc, {
      startY: search.trim() ? 34 : 28,

      head: [
        [
          "No",

          "Nama",

          "NIS",

          "JK",

          "Usia",

          "Tgl Lahir",

          "Kelas",

          "Alamat",

          "Kontak",

          "Ayah",

          "Ibu",

          "Status Ortu",

          "Status Anak",
        ],
      ],

      body: rows,

      theme: "grid",

      styles: {
        fontSize: 7,

        cellPadding: 2,

        overflow: "linebreak",

        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: { cellWidth: 9 },

        1: { cellWidth: 30 },

        2: { cellWidth: 18 },

        3: { cellWidth: 20 },

        4: { cellWidth: 10 },

        5: { cellWidth: 20 },

        6: { cellWidth: 18 },

        7: { cellWidth: 32 },

        8: { cellWidth: 22 },

        9: { cellWidth: 28 },

        10: { cellWidth: 28 },

        11: { cellWidth: 23 },

        12: { cellWidth: 23 },
      },

      margin: {
        left: 8,

        right: 8,
      },

      // =====================================================
      // FOOTER PDF
      // TANGGAL REALTIME TGL-BULAN-TAHUN
      // =====================================================

      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(7);

        doc.setFont("helvetica", "normal");

        doc.text(
          `TPQ Khairunissa • Database Santri • Update ${tanggalRealtime} • Halaman ${doc.internal.getNumberOfPages()}`,
          148,
          pageHeight - 7,
          {
            align: "center",
          },
        );
      },
    });

    const namaFile = search.trim()
      ? "data-santri-hasil-pencarian.pdf"
      : "data-santri.pdf";

    doc.save(namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-4 space-y-4">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* TITLE */}

        <h1 className="text-lg font-light text-black tracking-wide">
          DATA BASE SANTRI
        </h1>

        {/* SEARCH + DOWNLOAD */}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Cari data santri..."
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
                <button
                  type="button"
                  onClick={downloadExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <FileSpreadsheet size={18} className="text-green-600" />

                  <div className="text-left">
                    <div className="font-medium">Excel</div>

                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={downloadPDF}
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

      {/* ================= MOBILE ================= */}

      <div className="block md:hidden space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500">Data tidak ditemukan</div>
        ) : (
          paginatedData.map((d, i) => (
            <div
              key={d.id || i}
              className="overflow-hidden rounded-2xl shadow bg-white border"
            >
              {/* HEADER CARD */}

              <div className="bg-purple-600 p-2 mb-1 flex flex-col items-center space-y-0.5 text-center">
                {d.foto ? (
                  <img
                    src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${d.foto}`}
                    alt="foto"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-xs">
                    No Foto
                  </div>
                )}

                <h2 className="mt-1 text-white font-bold text-lg uppercase">
                  {d.nama}
                </h2>

                <p className="text-white font-extralight text-sm">
                  {d.nis} | Kelas {d.kelas || "-"}
                </p>
              </div>

              {/* NARASI */}

              <div className="bg-gray-300 font-light p-4 text-sm text-gray-800 space-y-0 text-justify">
                <p>
                  Adalah santri TPQ Khairunisa Ternate dengan jenis kelamin{" "}
                  {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} berusia{" "}
                  {d.usia} tahun dan lahir pada tanggal {d.tanggal_lahir}.
                  Santri merupakan anak dari Ayah bernama{" "}
                  <b>{d.orang_tua?.nama_ayah || "-"}</b> dengan pekerjaan{" "}
                  {d.orang_tua?.pekerjaan_ayah || "-"} dan Ibu bernama{" "}
                  <b>{d.orang_tua?.nama_ibu || "-"}</b> dengan pekerjaan{" "}
                  {d.orang_tua?.pekerjaan_ibu || "-"}. Status orang tua adalah{" "}
                  <b>{d.status_orangtua || "-"}</b> dan santri termasuk{" "}
                  <b>{d.status_anak || "-"}</b>.
                </p>

                <p>
                  Santri berdomisili di Kelurahan {d.alamat || "-"} Kota
                  Ternate.
                  {d.kontak && ` Nomor kontak ${d.kontak}.`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP ================= */}

      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-medium">Foto</th>

              <th className="p-3 text-left font-medium">Nama - NIS</th>

              <th className="p-3 text-left font-medium">
                JK, Usia - Kelahiran
              </th>

              <th className="p-3 text-left font-medium">Alamat - Kontak</th>

              <th className="p-3 text-left font-medium">Ayah - Pekerjaan</th>

              <th className="p-3 text-left font-medium">Ibu - Pekerjaan</th>

              <th className="p-3 text-left font-medium">Status Ortu - Anak</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((d, i) => (
                <tr
                  key={d.id || i}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* FOTO */}

                  <td className="p-3">
                    {d.foto ? (
                      <img
                        src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${d.foto}`}
                        alt="foto"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Img
                      </div>
                    )}
                  </td>

                  {/* NAMA */}

                  <td className="p-3">
                    <div className="font-medium">{d.nama}</div>

                    <div className="text-xs text-gray-500">{d.nis}</div>
                  </td>

                  {/* JK + USIA */}

                  <td className="p-3">
                    <div>
                      {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                      {d.usia} Th
                    </div>

                    <div className="text-xs text-gray-500">
                      {d.tanggal_lahir}
                    </div>
                  </td>

                  {/* ALAMAT */}

                  <td className="p-3">
                    <div>{d.alamat}</div>

                    <div className="text-xs text-gray-500">
                      {d.kontak || "-"}
                    </div>
                  </td>

                  {/* AYAH */}

                  <td className="p-3">
                    <div>{d.orang_tua?.nama_ayah || "-"}</div>

                    <div className="text-xs text-gray-500">
                      {d.orang_tua?.pekerjaan_ayah || "-"}
                    </div>
                  </td>

                  {/* IBU */}

                  <td className="p-3">
                    <div>{d.orang_tua?.nama_ibu || "-"}</div>

                    <div className="text-xs text-gray-500">
                      {d.orang_tua?.pekerjaan_ibu || "-"}
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="p-3">
                    <div>{d.status_orangtua || "-"}</div>

                    <div className="text-xs text-gray-500">
                      {d.status_anak || "-"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}

      {filteredData.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {/* INFO JUMLAH DATA */}

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

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
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
                ),
              )}

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

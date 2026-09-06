import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { api } from "../api";

export default function ProgresQuran() {
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
      // Ambil data santri
      const res = await api.get("/master-data");

      const santri = res?.data?.data?.santri || [];

      // Ambil progres dari localStorage
      const saved = localStorage.getItem("tpq_progres_iqra");

      const progresData = saved ? JSON.parse(saved) : {};

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
      alert("Tidak ada data progres Al-Qur'an yang dapat di-download.");
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
      alert("Tidak ada data progres Al-Qur'an yang dapat di-download.");
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

      doc.text("TPQ Khairunissa Ternate", centerX, 21, {
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
            `TPQ Khairunissa • Progres Al'Quran • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
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
      console.error("Gagal membuat PDF Progres Al-Qur'an:", error);

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

        <h1 className="text-lg tracking-wider font-light text-black">
          PROGRES AL'QURAN
        </h1>

        {/* SEARCH + FILTER + DOWNLOAD */}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Cari santri / guru / surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded text-xs w-full sm:w-64"
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
                {/* EXCEL */}

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

                {/* PDF */}

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
          FILTER
      ===================================================== */}

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="mb-4 flex flex-wrap gap-2">
          {/* FILTER JUZ */}

          <select
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Semua Juz</option>

            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Juz {i + 1}
              </option>
            ))}
          </select>

          {/* FILTER SURAH */}

          <input
            type="text"
            placeholder="Filter Surah"
            value={filterSurah}
            onChange={(e) => setFilterSurah(e.target.value)}
            className="border p-2 rounded text-xs"
          />

          {/* FILTER PROGRES */}

          <select
            value={filterProgres}
            onChange={(e) => setFilterProgres(e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Semua Progres</option>

            <option value="Belum">Belum</option>

            <option value="Lancar">Lancar</option>
          </select>

          {/* FILTER PRESTASI */}

          <select
            value={filterPrestasi}
            onChange={(e) => setFilterPrestasi(e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Semua Prestasi</option>

            <option value="Di-Lanjut">Di-Lanjut</option>

            <option value="Di-Ulang">Di-Ulang</option>
          </select>
        </div>

        {/* =================================================
            DESKTOP
        ================================================= */}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nama Santri</th>

                <th className="p-2 border">NIS</th>

                <th className="p-2 border">Guru</th>

                <th className="p-2 border">Kelas</th>

                <th className="p-2 border">Juz</th>

                <th className="p-2 border">Surah</th>

                <th className="p-2 border">Ayat</th>

                <th className="p-2 border">Halaman</th>

                <th className="p-2 border">Progres</th>

                <th className="p-2 border">Prestasi</th>

                <th className="p-2 border">Update</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500">
                    Belum ada data progres Qur'an
                  </td>
                </tr>
              ) : (
                currentData.map((d, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 border font-semibold">{d.nama}</td>

                    <td className="p-2 border">{d.nis}</td>

                    <td className="p-2 border">{d.guru}</td>

                    <td className="p-2 border">{d.kelas}</td>

                    <td className="p-2 border">{d.juz}</td>

                    <td className="p-2 border">{d.surah}</td>

                    <td className="p-2 border">{d.ayat}</td>

                    <td className="p-2 border">{d.halaman}</td>

                    <td className="p-2 border">{d.progres}</td>

                    <td className="p-2 border">{d.prestasi}</td>

                    <td className="p-2 border text-xs text-gray-500">
                      {d.update}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="md:hidden space-y-4">
          {currentData.length === 0 ? (
            <div className="text-center text-gray-500">
              Belum ada data progres Qur'an
            </div>
          ) : (
            currentData.map((d, i) => (
              <div
                key={i}
                className="bg-gray-300 border rounded-2xl shadow overflow-hidden"
              >
                {/* HEADER */}

                <div className="bg-purple-600 text-white text-center font-bold py-3 px-3 text-sm leading-5">
                  {d.nama?.toUpperCase()}
                  <br />
                  NIS : {d.nis} | Kelas {d.kelas}
                </div>

                {/* BODY */}

                <div className="p-2 text-sm text-gray-700 space-y-1 text-center">
                  {/* SURAH */}

                  <div>
                    <b>SURAH : {(d.surah || "-").toUpperCase()}</b>
                  </div>

                  {/* JUZ / AYAT / HALAMAN */}

                  <div>
                    | Juz {d.juz} | Ayat {d.ayat || "-"} | Halaman {d.halaman} |
                  </div>

                  {/* GURU */}

                  <div>
                    Guru : <b>{d.guru || "-"}</b>
                  </div>

                  {/* PROGRES */}

                  <div>
                    Progres <b>{(d.progres || "-").toUpperCase()}</b> maka
                    prestasi belajar santri harus{" "}
                    <b>{(d.prestasi || "-").toUpperCase()}</b>
                  </div>

                  {/* UPDATE */}

                  <div className="text-[11px] text-purple-700 border-t pt-3">
                    Update tanggal {d.update}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
            {/* INFO DATA */}

            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">
                {filteredData.length}
              </span>{" "}
              santri
            </div>

            {/* BUTTON PAGINATION */}

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* SEBELUMNYA */}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sebelumnya
                </button>

                {/* NOMOR HALAMAN */}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-9 px-3 py-2 rounded-lg text-xs border ${
                      currentPage === page
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* BERIKUTNYA */}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
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

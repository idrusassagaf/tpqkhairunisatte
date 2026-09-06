import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProgresHafalan() {
  const [santri, setSantri] = useState([]);
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
      const res = await api.get("/master-data");

      const dataSantri = res?.data?.data?.santri || [];

      setSantri(dataSantri);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);
    }
  };

  // =========================================================
  // JUMLAH HAFALAN
  // =========================================================

  const getJumlahHafalan = (nis, status) => {
    const saved = localStorage.getItem(`hafalan_${nis}`);

    if (!saved) return 0;

    try {
      const data = JSON.parse(saved);

      return Object.values(data).filter((item) => item?.progres === status)
        .length;
    } catch (error) {
      console.error(`Gagal membaca hafalan ${nis}:`, error);

      return 0;
    }
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
      alert("Tidak ada data santri yang dapat di-download.");

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
      alert("Tidak ada data santri yang dapat di-download.");

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

      doc.text("TPQ Khairunissa Ternate", centerX, 21, {
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
            `TPQ Khairunissa • Progres Hafalan • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
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
      console.error("Gagal membuat PDF Progres Hafalan:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow p-0 overflow-x-auto">
        {/* =====================================================
            TITLE
        ===================================================== */}

        <h1 className="text-lg font-light tracking-wide text-black ml-2 mb-4">
          PROGRES HAFALAN
        </h1>

        {/* =====================================================
            SEARCH + DOWNLOAD
        ===================================================== */}

        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Cari nama / NIS / kelas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setCurrentPage(1);
            }}
            className="
              border rounded-lg px-3 py-2
              text-xs w-full md:w-72
              focus:outline-none focus:ring-2
              focus:ring-purple-300
            "
          />

          {/* DOWNLOAD */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="
                w-full sm:w-auto
                inline-flex items-center justify-center
                gap-2 px-4 py-2
                rounded-lg
                bg-blue-600
                text-white
                text-sm
                font-medium
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
                  left-0 sm:right-0 sm:left-auto
                  mt-2
                  w-full sm:w-52
                  bg-white
                  border border-gray-200
                  rounded-xl
                  shadow-lg
                  z-50
                  overflow-hidden
                "
              >
                {/* =================================================
                    EXCEL
                ================================================= */}

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-sm text-gray-700
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

                {/* =================================================
                    PDF
                ================================================= */}

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-sm text-gray-700
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

        {/* =====================================================
            DESKTOP TABLE
        ===================================================== */}

        <table className="hidden md:table w-full border text-xs text-black">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-1 border w-16">No.</th>

              <th className="p-1 border">Nama Santri</th>

              <th className="p-1 border">NIS</th>

              <th className="p-1 border">Kelas</th>

              <th className="p-1 border text-center">Sudah Lancar</th>

              <th className="p-1 border text-center">Belum Lancar</th>

              <th className="p-1 border text-center">Lihat Hafalan</th>
            </tr>
          </thead>

          <tbody>
            {santri.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  Data santri belum tersedia
                </td>
              </tr>
            ) : (
              paginatedSantri.map((s, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  {/* NO */}

                  <td className="p-1 border text-center">{i + 1}</td>

                  {/* NAMA */}

                  <td className="p-1 border font-medium">{s.nama}</td>

                  {/* NIS */}

                  <td className="p-1 border">{s.nis}</td>

                  {/* KELAS */}

                  <td className="p-1 border">{s.kelas}</td>

                  {/* LANCAR */}

                  <td className="p-1 border text-center font-medium text-green-700">
                    {getJumlahHafalan(s.nis, "Lancar")}
                    -Hafalan
                  </td>

                  {/* BELUM */}

                  <td className="p-1 border text-center font-medium text-red-700">
                    {getJumlahHafalan(s.nis, "Belum")}
                    -Hafalan
                  </td>

                  {/* LIHAT PROGRES */}

                  <td className="p-1 border text-center">
                    <button
                      onClick={() => navigate(`/progres-hafalan/${s.nis}`)}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        w-6 h-6
                        rounded-full
                        bg-purple-100
                        hover:bg-purple-200
                        text-purple-700
                        transition
                      "
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* =====================================================
            MOBILE CARD
        ===================================================== */}

        <div className="md:hidden space-y-3 mt-4">
          {paginatedSantri.map((s, i) => {
            let saved = {};

            try {
              saved =
                JSON.parse(localStorage.getItem(`hafalan_${s.nis}`)) || {};
            } catch (error) {
              saved = {};
            }

            const lancar = Object.values(saved).filter(
              (item) => item?.progres === "Lancar",
            ).length;

            const belum = Object.values(saved).filter(
              (item) => item?.progres === "Belum",
            ).length;

            return (
              <div
                key={i}
                className="
                  bg-white
                  border
                  rounded-2xl
                  shadow-sm
                  p-3
                "
              >
                {/* BARIS ATAS */}

                <div className="flex items-start justify-between gap-2">
                  {/* KIRI */}

                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2">
                      <span className="font-semibold text-black">{i + 1}.</span>

                      <span
                        className="
                          font-semibold
                          text-black
                          truncate
                        "
                      >
                        {s.nama}
                      </span>
                    </div>

                    <div
                      className="
                        text-xs
                        text-gray-600
                        mt-1
                        ml-6
                      "
                    >
                      NIS {s.nis} |K-{s.kelas}
                    </div>
                  </div>

                  {/* TENGAH */}

                  <div
                    className="
                      text-center
                      text-xs
                      font-semibold
                      min-w-[50px]
                    "
                  >
                    <div className="text-black mt-1">{lancar}- Lcr</div>

                    <div className="text-black mt-2">{belum}- Blm</div>
                  </div>

                  {/* KANAN */}

                  <button
                    onClick={() => navigate(`/progres-hafalan/${s.nis}`)}
                    className="
                      w-9 h-9
                      rounded-full
                      bg-purple-100
                      text-purple-700
                      flex items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {filteredSantri.length > 0 && (
          <div
            className="
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-3
            pt-4
          "
          >
            {/* INFO DATA */}

            <div className="text-xs text-gray-500">
              Menampilkan {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredSantri.length)} dari{" "}
              {filteredSantri.length} santri
            </div>

            {/* BUTTON PAGINATION */}

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* SEBELUMNYA */}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="
                    px-3 py-1.5
                    text-xs
                    rounded
                    border
                    bg-white
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    hover:bg-gray-50
                  "
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
                    type="button"
                    onClick={() => setCurrentPage(page)}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="
                    px-3 py-1.5
                    text-xs
                    rounded
                    border
                    bg-white
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    hover:bg-gray-50
                  "
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

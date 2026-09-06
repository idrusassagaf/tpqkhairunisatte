import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";

export default function ProgresIqra() {
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

  const STORAGE_KEY = "tpq_progres_iqra";

  // ================= DOWNLOAD =================
  const [showDownload, setShowDownload] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setProgresData(JSON.parse(saved));
    }
  }, []);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");

      setSantri(res?.data?.data?.santri || []);
      setGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error(err);
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
      alert("Tidak ada data progres Iqra yang dapat di-download.");
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
      alert("Tidak ada data progres Iqra yang dapat di-download.");
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

      doc.text("TPQ Khairunissa Ternate", centerX, 21, {
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
            `TPQ Khairunissa • Progres Iqra • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
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
      console.error("Gagal membuat PDF Progres Iqra:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-2 md:p-4 space-y-4">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* TITLE */}

        <h1 className="text-lg tracking-wider font-light text-black">
          PROGRES IQRA
        </h1>

        {/* SEARCH + DOWNLOAD */}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Cari santri / guru..."
            value={searchIqra}
            onChange={(e) => setSearchIqra(e.target.value)}
            className="border p-2 rounded w-full sm:w-64 text-sm"
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
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Cari santri / guru..."
            value={searchIqra}
            onChange={(e) => setSearchIqra(e.target.value)}
            className="border p-2 rounded w-full md:w-64 text-sm"
          />

          {/* FILTER JILID */}

          <select
            value={filterJilid}
            onChange={(e) => setFilterJilid(e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Semua Jilid</option>
            <option value="Iqra 1">Iqra 1</option>
            <option value="Iqra 2">Iqra 2</option>
            <option value="Iqra 3">Iqra 3</option>
            <option value="Iqra 4">Iqra 4</option>
            <option value="Iqra 5">Iqra 5</option>
            <option value="Iqra 6">Iqra 6</option>
          </select>

          {/* FILTER PROGRES */}

          <select
            value={filterProgres}
            onChange={(e) => setFilterProgres(e.target.value)}
            className="border p-2 rounded text-xs"
          >
            <option value="">Semua Progres</option>
            <option value="Lancar">Lancar</option>
            <option value="Belum">Belum</option>
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

        {/* ================= MOBILE CARD ================= */}

        <div className="md:hidden space-y-4">
          {currentSantri.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
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
                  className="bg-gray-200 border rounded-xl shadow overflow-hidden"
                >
                  {/* HEADER */}

                  <div className="bg-purple-600 text-white text-center font-bold py-2 px-3 text-sm">
                    {s.nama?.toUpperCase()}
                    <br />
                    NIS : {s.nis} | Kelas {s.kelas || "-"}
                  </div>

                  {/* BODY */}

                  <div className="p-2 mb-1 text-sm text-gray-700 space-y-1 text-center">
                    <div>
                      | Jilid {progresData[`jilid_${s.nis}`] || "-"} | Halaman{" "}
                      {progresData[`hal_${s.nis}`] || "-"} |
                    </div>

                    <div>
                      Guru : <b>{namaGuru}</b>
                    </div>

                    <div>| NIG : {dataGuru?.nig || "-"} |</div>

                    <div>
                      Progres <b>{progres.toUpperCase()}</b> maka prestasi
                      belajar santri harus <b>{prestasi.toUpperCase()}</b>
                    </div>

                    <div className="text-xs text-purple-700 pt-1">
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

        {/* ================= DESKTOP TABLE ================= */}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Nama Santri</th>
                <th className="p-2">NIS</th>
                <th className="p-2">Guru</th>
                <th className="p-2">NIG</th>
                <th className="p-2">Kelas</th>
                <th className="p-2">Jilid</th>
                <th className="p-2">Hal.</th>
                <th className="p-2">Progres</th>
                <th className="p-2">Prestasi</th>
                <th className="p-2">Update</th>
              </tr>
            </thead>

            <tbody>
              {currentSantri.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4">
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
                    <tr key={i} className="border-t">
                      <td className="p-2 font-semibold">{s.nama}</td>

                      <td className="p-2">{s.nis}</td>

                      <td className="p-2">{namaGuru}</td>

                      <td className="p-2">{dataGuru?.nig || "-"}</td>

                      <td className="p-2">{s.kelas || "-"}</td>

                      <td className="p-2">
                        {progresData[`jilid_${s.nis}`] || "-"}
                      </td>

                      <td className="p-2">
                        {progresData[`hal_${s.nis}`] || "-"}
                      </td>

                      <td className="p-2">{progres}</td>

                      <td className="p-2">{prestasi}</td>

                      <td className="p-2 text-xs text-gray-500">
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

        {/* ================= PAGINATION ================= */}

        {santriIqra.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, santriIqra.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">
                {santriIqra.length}
              </span>{" "}
              santri
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sebelumnya
                </button>

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

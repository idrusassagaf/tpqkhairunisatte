import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";

export default function StatusGuru() {
  const [guru, setGuru] = useState([]);
  const [search, setSearch] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [statusData, setStatusData] = useState({});
  const [showDownload, setShowDownload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const notify = window.__tpqNotify;

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ================= FORMAT PERIODE =================
  const getCurrentPeriode = () => {
    const now = new Date();

    const bulan = String(now.getMonth() + 1).padStart(2, "0");

    const tahun = now.getFullYear();

    return tahun + "-" + bulan;
  };

  // ================= NAMA BULAN =================
  const bulanList = [
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
  ];

  useEffect(() => {
    fetchData();

    // otomatis pilih bulan berjalan
    setFilterPeriode(getCurrentPeriode());

    const saved = localStorage.getItem("status_guru");

    if (saved) {
      setStatusData(JSON.parse(saved));
    }
  }, []);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const res = await api.get("/master-data");

      setGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (nig, field, value) => {
    const periodeAktif = filterPeriode || getCurrentPeriode();

    const updated = {
      ...statusData,

      [nig]: {
        ...statusData[nig],

        [periodeAktif]: {
          ...statusData[nig]?.[periodeAktif],

          [field]: value,

          update: new Date().toLocaleDateString("id-ID"),
        },
      },
    };

    setStatusData(updated);
  };

  // ================= SIMPAN =================
  const handleSave = () => {
    setSaving(true);
    window.__tpqLoading?.show("Menyimpan status guru...");

    try {
      localStorage.setItem("status_guru", JSON.stringify(statusData));
      notify?.toast({
        type: "success",
        title: "Data tersimpan",
        message: "Status guru berhasil disimpan.",
      });
    } catch (error) {
      console.error("Gagal menyimpan status guru:", error);
      notify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message: "Status guru gagal disimpan.",
      });
    } finally {
      setSaving(false);
      window.__tpqLoading?.hide();
    }
  };

  // ================= HITUNG GAJI =================
  const getGajiGuru = (status) => {
    const gajiPokok = 1000000;

    if (status === "Sangat Aktif") {
      return gajiPokok + gajiPokok * 0.1;
    }

    if (status === "Aktif") {
      return gajiPokok;
    }

    if (status === "Kurang Aktif") {
      return gajiPokok - gajiPokok * 0.2;
    }

    if (status === "Tidak Aktif") {
      return 0;
    }

    return 0;
  };

  // ================= FORMAT RUPIAH =================
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // ================= STATUS OTOMATIS =================
  const getStatusGuru = (kehadiran) => {
    if (kehadiran === "Hadir Penuh") {
      return "Sangat Aktif";
    }

    if (kehadiran === "Kurang 5 Hr") {
      return "Aktif";
    }

    if (kehadiran === "Kurang 10 Hr") {
      return "Kurang Aktif";
    }

    if (kehadiran === "Diatas 10 Hr") {
      return "Tidak Aktif";
    }

    return "-";
  };

  // ================= FILTER SEARCH =================
  const filteredGuru = guru.filter((g) => {
    const keyword = search.toLowerCase();

    return `
      ${g.nama_guru || ""}
      ${g.nig || ""}
    `
      .toLowerCase()
      .includes(keyword);
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedGuru = filteredGuru.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ================= RESET PAGINATION =================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage, filterPeriode]);

  // ================= TOTAL GAJI =================
  const totalGaji = filteredGuru.reduce((total, g) => {
    const dataPeriode = statusData[g.nig]?.[filterPeriode] || {};

    const kehadiran = dataPeriode.kehadiran || "";

    const status = getStatusGuru(kehadiran);

    return total + getGajiGuru(status);
  }, 0);

  // =========================================================
  // DOWNLOAD EXCEL STATUS GURU
  // =========================================================
  const downloadExcel = () => {
    if (filteredGuru.length === 0) {
      notify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data status guru untuk di-download.",
      });
      return;
    }

    setDownloading(true);
    window.__tpqLoading?.show("Membuat file Excel status guru...");

    try {
      const periodeAktif = filterPeriode || getCurrentPeriode();

      const [tahun, bulan] = periodeAktif.split("-");

      const excelData = filteredGuru.map((g, index) => {
        const dataPeriode = statusData[g.nig]?.[periodeAktif] || {};

        const kehadiran = dataPeriode.kehadiran || "";

        const status = getStatusGuru(kehadiran);

        const gaji = getGajiGuru(status);

        return {
          No: index + 1,

          "Nama Guru": g.nama_guru || "-",

          NIG: g.nig || "-",

          "Total Santri": dataPeriode.totalSantri || "-",

          "Kehadiran & Absensi": kehadiran || "-",

          Status: status,

          "Gaji Per-Guru": gaji,

          Update: dataPeriode.update || "-",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Status Guru");

      // ================= LEBAR KOLOM =================
      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 15 },
        { wch: 16 },
        { wch: 24 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
      ];

      const namaFile = search.trim()
        ? `status-guru-${tahun}-${bulan}-hasil-pencarian.xlsx`
        : `status-guru-${tahun}-${bulan}.xlsx`;

      XLSX.writeFile(workbook, namaFile);
      setShowDownload(false);
      notify?.toast({
        type: "success",
        title: "Excel siap diunduh",
        message: "File Excel status guru berhasil dibuat.",
      });
    } catch (error) {
      console.error("Gagal download Excel status guru:", error);
      notify?.toast({
        type: "error",
        title: "Download gagal",
        message: "Excel status guru gagal dibuat.",
      });
    } finally {
      setDownloading(false);
      window.__tpqLoading?.hide();
    }
  };

  // =========================================================
  // DOWNLOAD PDF STATUS GURU
  // =========================================================
  const downloadPDF = () => {
    if (filteredGuru.length === 0) {
      notify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data status guru untuk di-download.",
      });
      return;
    }

    setDownloading(true);
    window.__tpqLoading?.show("Membuat file PDF status guru...");

    try {
      const periodeAktif = filterPeriode || getCurrentPeriode();

      const [tahun, bulan] = periodeAktif.split("-");

      const namaBulan = bulanList[Number(bulan) - 1] || bulan;

      // =====================================================
      // TANGGAL REALTIME SAAT PDF DI-DOWNLOAD
      // =====================================================
      const tanggalDownload = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // =====================================================
      // PDF A4 LANDSCAPE
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

      // =====================================================
      // AREA KONTEN TENGAH
      // =====================================================
      const contentWidth = 270;

      const contentLeft = (pageWidth - contentWidth) / 2;

      const contentRight = pageWidth - contentLeft;

      const contentCenter = pageWidth / 2;

      // =====================================================
      // JUDUL
      // =====================================================
      doc.setFontSize(16);

      doc.setFont("helvetica", "bold");

      doc.text("STATUS DAN GAJI GURU", contentCenter, 15, {
        align: "center",
      });

      // =====================================================
      // SUB JUDUL
      // =====================================================
      doc.setFontSize(10);

      doc.setFont("helvetica", "normal");

      doc.text("TPQ Hairunissa Ternate", contentCenter, 21, {
        align: "center",
      });

      // =====================================================
      // PERIODE
      // =====================================================
      doc.setFontSize(9);

      doc.text(
        `Periode: ${namaBulan.toUpperCase()} ${tahun}`,
        contentCenter,
        27,
        {
          align: "center",
        },
      );

      // =====================================================
      // INFO PENCARIAN
      // =====================================================
      let tableStartY = 33;

      if (search.trim()) {
        doc.setFontSize(8);

        doc.text(`Hasil pencarian: "${search}"`, contentLeft, 32);

        tableStartY = 38;
      }

      // =====================================================
      // DATA TABEL
      // =====================================================
      const rows = filteredGuru.map((g, index) => {
        const dataPeriode = statusData[g.nig]?.[periodeAktif] || {};

        const kehadiran = dataPeriode.kehadiran || "";

        const status = getStatusGuru(kehadiran);

        const gaji = getGajiGuru(status);

        return [
          index + 1,

          g.nama_guru || "-",

          g.nig || "-",

          dataPeriode.totalSantri || "-",

          kehadiran || "-",

          status,

          formatRupiah(gaji),

          dataPeriode.update || "-",
        ];
      });

      // =====================================================
      // TABEL
      // =====================================================
      const tableWidth = 230;

      const tableLeft = (pageWidth - tableWidth) / 2;

      autoTable(doc, {
        startY: tableStartY,

        head: [
          [
            "No",
            "Nama Guru",
            "NIG",
            "Total Santri",
            "Kehadiran",
            "Status",
            "Gaji Per-Guru",
            "Update",
          ],
        ],

        body: rows,

        theme: "grid",

        tableWidth: tableWidth,

        margin: {
          left: tableLeft,
          right: tableLeft,
        },

        styles: {
          fontSize: 8,

          cellPadding: 2,

          overflow: "linebreak",

          valign: "middle",

          halign: "center",
        },

        headStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 10,
          },

          1: {
            cellWidth: 45,

            halign: "left",
          },

          2: {
            cellWidth: 25,
          },

          3: {
            cellWidth: 25,
          },

          4: {
            cellWidth: 35,
          },

          5: {
            cellWidth: 30,
          },

          6: {
            cellWidth: 35,
          },

          7: {
            cellWidth: 25,
          },
        },

        // ===================================================
        // FOOTER PDF
        // SATU BARIS PENUH
        // TANGGAL REALTIME SAAT DOWNLOAD
        // ===================================================
        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          const footerText = `TPQ Hairunissa • Progres Al'Quran • Update ${tanggalDownload} • Halaman ${nomorHalaman}`;

          doc.setFont("helvetica", "normal");

          doc.setFontSize(7);

          doc.text(footerText, contentCenter, pageHeight - 7, {
            align: "center",
          });
        },
      });

      // =====================================================
      // NAMA FILE
      // =====================================================
      const namaFile = search.trim()
        ? `status-guru-${tahun}-${bulan}-hasil-pencarian.pdf`
        : `status-guru-${tahun}-${bulan}.pdf`;

      doc.save(namaFile);
      setShowDownload(false);
      notify?.toast({
        type: "success",
        title: "PDF siap diunduh",
        message: "File PDF status guru berhasil dibuat.",
      });
    } catch (error) {
      console.error("Gagal download PDF status guru:", error);
      notify?.toast({
        type: "error",
        title: "Download gagal",
        message: "PDF status guru gagal dibuat.",
      });
    } finally {
      setDownloading(false);
      window.__tpqLoading?.hide();
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* ================= TITLE ================= */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-xl font-light tracking-wide text-black">
              STATUS DAN GAJI GURU
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Monitoring aktivitas kehadiran dan gaji guru per bulan.
            </p>
          </div>

          {/* TOTAL GAJI */}
          <div
            className="
              text-left md:text-right
              border border-gray-500
              bg-gray-100
              rounded-xl
              px-4 py-2
            "
          >
            <p className="text-xs text-gray-800 tracking-wide">
              Jumlah Total Gaji
            </p>

            <h2 className="text-lg font-bold text-green-700">
              {formatRupiah(totalGaji)}
            </h2>
          </div>
        </div>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Cari nama guru / NIG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              border rounded-xl
              px-4 py-2
              w-full md:w-72
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-purple-300
            "
          />

          {/* FILTER PERIODE */}
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="
              border rounded-xl
              px-4 py-2
              text-xs
              tracking-wide
              w-full md:w-56
              focus:outline-none
              focus:ring-2
              focus:ring-purple-300
            "
          >
            {bulanList.map((bulan, index) => {
              const nomor = String(index + 1).padStart(2, "0");

              const tahun = new Date().getFullYear();

              return (
                <option key={nomor} value={tahun + "-" + nomor}>
                  {bulan.toUpperCase().split("").join(" ")} - {tahun}
                </option>
              );
            })}
          </select>

          {/* ================= DOWNLOAD ================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="
                w-full md:w-auto
                inline-flex
                items-center
                justify-center
                gap-2
                px-4 py-2
                rounded-xl
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
                  right-0
                  mt-2
                  w-full md:w-52
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-lg
                  z-50
                  overflow-hidden
                "
              >
                {/* ================= EXCEL ================= */}
                <button
                  type="button"
                  onClick={downloadExcel}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4 py-3
                    text-sm
                    text-gray-700
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

                {/* ================= PDF ================= */}
                <button
                  type="button"
                  onClick={downloadPDF}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4 py-3
                    text-sm
                    text-gray-700
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
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:flex justify-center bg-white rounded shadow overflow-x-auto">
        <table className="w-[95%] border text-xs text-black">
          <thead className="bg-gray-200 text-black">
            <tr>
              <th className="px-2 py-2 border w-14">No</th>

              <th className="px-2 py-2 border text-left">Nama Guru</th>

              <th className="px-2 py-2 border">NIG</th>

              <th className="px-2 py-2 border">Total Santri</th>

              <th className="px-2 py-2 border">Kehadiran & Absensi</th>

              <th className="px-2 py-2 border">Status</th>

              <th className="px-2 py-2 border">Gaji Per-Guru</th>

              <th className="px-2 py-2 border">Aksi</th>

              <th className="px-2 py-2 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredGuru.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-6 text-gray-500">
                  Data guru belum tersedia
                </td>
              </tr>
            ) : (
              paginatedGuru.map((g, i) => {
                const dataPeriode = statusData[g.nig]?.[filterPeriode] || {};

                const kehadiran = dataPeriode.kehadiran || "";

                const status = getStatusGuru(kehadiran);

                const gaji = getGajiGuru(status);

                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    {/* NO */}
                    <td className="px-2 py-1 border text-center">
                      {startIndex + i + 1}
                    </td>

                    {/* NAMA */}
                    <td className="px-2 py-1 border font-medium">
                      {g.nama_guru}
                    </td>

                    {/* NIG */}
                    <td className="px-2 py-1 border text-center">
                      {g.nig || "-"}
                    </td>

                    {/* TOTAL SANTRI */}
                    <td className="px-2 py-1 border text-center">
                      <input
                        type="number"
                        value={dataPeriode.totalSantri || ""}
                        onChange={(e) =>
                          handleChange(g.nig, "totalSantri", e.target.value)
                        }
                        className="
                          border rounded
                          px-2 py-1
                          w-20 text-xs
                          text-center
                        "
                      />
                    </td>

                    {/* KEHADIRAN */}
                    <td className="px-2 py-1 border text-center">
                      <select
                        value={kehadiran}
                        onChange={(e) =>
                          handleChange(g.nig, "kehadiran", e.target.value)
                        }
                        className="
                          border rounded
                          px-2 py-1
                          text-xs
                        "
                      >
                        <option value="">Pilih</option>

                        <option value="Hadir Penuh">Hadir Penuh</option>

                        <option value="Kurang 5 Hr">Kurang 5 Hr</option>

                        <option value="Kurang 10 Hr">Kurang 10 Hr</option>

                        <option value="Diatas 10 Hr">Diatas 10 Hr</option>
                      </select>
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-1 border text-center">
                      <span
                        className={`
                          px-3 py-1 rounded-full
                          text-xs font-medium
                          ${
                            status === "Sangat Aktif"
                              ? "bg-green-100 text-green-700"
                              : status === "Aktif"
                                ? "bg-blue-100 text-blue-700"
                                : status === "Kurang Aktif"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : status === "Tidak Aktif"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {status}
                      </span>
                    </td>

                    {/* GAJI */}
                    <td className="px-2 py-1 border text-center">
                      <span className="font-semibold text-green-700">
                        {formatRupiah(gaji)}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td className="px-2 py-1 border text-center">
                      <button
                        onClick={handleSave}
                        className="
                          bg-purple-600
                          hover:bg-purple-700
                          text-white
                          px-3 py-1
                          rounded
                          text-xs
                        "
                      >
                        Simpan
                      </button>
                    </td>

                    {/* UPDATE */}
                    <td className="px-2 py-1 border text-center text-xs text-gray-500">
                      {dataPeriode.update || "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD ================= */}
      <div className="md:hidden space-y-3">
        {paginatedGuru.map((g, i) => {
          const dataPeriode = statusData[g.nig]?.[filterPeriode] || {};

          const kehadiran = dataPeriode.kehadiran || "";

          const status = getStatusGuru(kehadiran);

          return (
            <div
              key={i}
              className="
          w-full
          max-w-full
          bg-white
          border
          rounded-xl
          shadow-sm
          overflow-hidden
        "
            >
              {/* DATA GURU */}
              <div
                className="
            px-3
            py-3
            text-sm
            text-black
            leading-5
            space-y-1
          "
              >
                {/* NAMA */}
                <div className="bg-gray-300 -mx-3 -mt-3 px-3 py-2 font-semibold text-black">
                  {startIndex + i + 1}. {g.nama_guru}
                </div>

                {/* NIG + TOTAL SANTRI */}
                <div className="text-xs text-gray-700">
                  <span className="font-medium">NIG :</span> {g.nig || "-"}
                  <span className="mx-1">|</span>
                  <span className="font-medium">Total Santri :</span>{" "}
                  <input
                    type="number"
                    value={dataPeriode.totalSantri || ""}
                    onChange={(e) =>
                      handleChange(g.nig, "totalSantri", e.target.value)
                    }
                    className="
                inline-block
                w-12
                border-0
                border-b
                border-gray-300
                rounded-none
                px-1
                py-0
                text-xs
                text-center
                focus:outline-none
                focus:ring-0
              "
                  />
                </div>

                {/* KEHADIRAN */}
                <div className="flex items-center gap-1 text-xs min-w-0">
                  <span className="font-medium shrink-0">Kehadiran :</span>

                  <select
                    value={kehadiran}
                    onChange={(e) =>
                      handleChange(g.nig, "kehadiran", e.target.value)
                    }
                    className="
                flex-1
                min-w-0
                border-0
                bg-transparent
                px-1
                py-0
                text-xs
                font-medium
                text-black
                focus:outline-none
                focus:ring-0
              "
                  >
                    <option value="">Pilih</option>
                    <option value="Hadir Penuh">Hadir Penuh</option>
                    <option value="Kurang 5 Hr">Kurang 5 Hr</option>
                    <option value="Kurang 10 Hr">Kurang 10 Hr</option>
                    <option value="Diatas 10 Hr">Diatas 10 Hr</option>
                  </select>
                </div>

                {/* STATUS */}
                <div className="text-xs">
                  <span className="font-medium">Status :</span>{" "}
                  <span
                    className={`
                font-medium
                ${
                  status === "Sangat Aktif"
                    ? "text-green-700"
                    : status === "Aktif"
                      ? "text-blue-700"
                      : status === "Kurang Aktif"
                        ? "text-yellow-700"
                        : status === "Tidak Aktif"
                          ? "text-red-700"
                          : "text-gray-600"
                }
              `}
                  >
                    {status}
                  </span>
                </div>

                {/* GAJI */}
                <div className="text-xs">
                  <span className="font-medium">Gaji :</span>{" "}
                  <span className="font-bold text-green-700">
                    {formatRupiah(getGajiGuru(status))}
                  </span>
                </div>

                {/* UPDATE */}
                <div className="text-xs text-gray-500">
                  Update : {dataPeriode.update || "-"}
                </div>
              </div>

              {/* SIMPAN STATUS */}
              <div className="border-t border-b bg-gray-200 px-3 py-2">
                <button
                  onClick={handleSave}
                  className="
              w-full
              text-center
              text-xs
              font-medium
              text-purple-600
              hover:text-purple-700
            "
                >
                  Simpan Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      {filteredGuru.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* INFO DATA */}
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + itemsPerPage, filteredGuru.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">
                {filteredGuru.length}
              </span>{" "}
              guru
            </div>

            {/* JUMLAH DATA */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Tampilkan</span>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="
                  border rounded-lg
                  px-2 py-1
                  text-xs
                  focus:outline-none
                  focus:ring-2
                  focus:ring-purple-300
                "
              >
                <option value={5}>5</option>

                <option value={10}>10</option>

                <option value={20}>20</option>

                <option value={50}>50</option>
              </select>

              <span className="text-xs text-gray-500">data</span>
            </div>

            {/* NAVIGASI */}
            <div className="flex items-center gap-1">
              {/* PREVIOUS */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
                  px-3 py-1
                  border rounded-lg
                  text-xs
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-gray-100
                "
              >
                ‹
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
                  onClick={() => setCurrentPage(page)}
                  className={`
                    px-3 py-1
                    rounded-lg
                    text-xs
                    border
                    ${
                      currentPage === page
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {page}
                </button>
              ))}

              {/* NEXT */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="
                  px-3 py-1
                  border rounded-lg
                  text-xs
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-gray-100
                "
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

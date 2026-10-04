import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText, Wallet } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";
import { SkeletonRows } from "../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

export default function StatusGuru() {
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 overflow-x-hidden p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Wallet size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Status dan Gaji Guru</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Monitoring aktivitas kehadiran dan gaji guru per bulan.
            </p>
          </div>
        </div>

        {/* TOTAL GAJI */}
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-left md:text-right">
          <p className="text-xs font-medium text-gray-600">Jumlah Total Gaji</p>

          <h2 className="mt-0.5 text-lg font-bold text-green-700">
            {formatRupiah(totalGaji)}
          </h2>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* SEARCH + FILTER + DOWNLOAD */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Cari nama guru / NIG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} md:w-72`}
          />

          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className={`${inputCls} md:w-56`}
          >
            {bulanList.map((bulan, index) => {
              const nomor = String(index + 1).padStart(2, "0");

              const tahun = new Date().getFullYear();

              return (
                <option key={nomor} value={tahun + "-" + nomor}>
                  {bulan} {tahun}
                </option>
              );
            })}
          </select>

          <div className="relative md:ml-auto">
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
                  onClick={downloadExcel}
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
                  onClick={downloadPDF}
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

        {loading ? (
        <SkeletonRows rows={6} cols={5} />
      ) : (
        <>
        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-14 px-3 py-3 text-center font-semibold">No</th>
                <th className="px-3 py-3 text-left font-semibold">Nama Guru</th>
                <th className="px-3 py-3 text-center font-semibold">NIG</th>
                <th className="px-3 py-3 text-center font-semibold">Total Santri</th>
                <th className="px-3 py-3 text-center font-semibold">Kehadiran &amp; Absensi</th>
                <th className="px-3 py-3 text-center font-semibold">Status</th>
                <th className="px-3 py-3 text-center font-semibold">Gaji Per-Guru</th>
                <th className="px-3 py-3 text-center font-semibold">Aksi</th>
                <th className="px-3 py-3 text-center font-semibold">Update</th>
              </tr>
            </thead>

            <tbody>
              {filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
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
                    <tr
                      key={i}
                      className="border-t border-gray-100 transition hover:bg-amber-50/40"
                    >
                      <td className="px-3 py-2.5 text-center text-gray-500">
                        {startIndex + i + 1}
                      </td>

                      <td className="px-3 py-2.5 font-semibold text-gray-900">
                        {g.nama_guru}
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {g.nig || "-"}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          value={dataPeriode.totalSantri || ""}
                          onChange={(e) =>
                            handleChange(g.nig, "totalSantri", e.target.value)
                          }
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        />
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <select
                          value={kehadiran}
                          onChange={(e) =>
                            handleChange(g.nig, "kehadiran", e.target.value)
                          }
                          className="rounded-lg border border-gray-200 py-1.5 pl-2 pr-7 text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="">Pilih</option>
                          <option value="Hadir Penuh">Hadir Penuh</option>
                          <option value="Kurang 5 Hr">Kurang 5 Hr</option>
                          <option value="Kurang 10 Hr">Kurang 10 Hr</option>
                          <option value="Diatas 10 Hr">Diatas 10 Hr</option>
                        </select>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            status === "Sangat Aktif"
                              ? "bg-green-100 text-green-700"
                              : status === "Aktif"
                                ? "bg-blue-100 text-blue-700"
                                : status === "Kurang Aktif"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : status === "Tidak Aktif"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span className="font-semibold text-green-700">
                          {formatRupiah(gaji)}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-purple-700"
                        >
                          Simpan
                        </button>
                      </td>

                      <td className="px-3 py-2.5 text-center text-xs text-gray-500 whitespace-nowrap">
                        {dataPeriode.update || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD */}
        <div className="w-full space-y-3 md:hidden">
          {paginatedGuru.map((g, i) => {
            const dataPeriode = statusData[g.nig]?.[filterPeriode] || {};

            const kehadiran = dataPeriode.kehadiran || "";

            const status = getStatusGuru(kehadiran);

            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="bg-amber-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">
                    {startIndex + i + 1}. {g.nama_guru}
                  </div>

                  <div className="mt-0.5 text-xs text-gray-500">
                    NIG {g.nig || "-"}
                  </div>
                </div>

                <div className="space-y-3 p-4 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-gray-600">Total Santri</span>

                    <input
                      type="number"
                      value={dataPeriode.totalSantri || ""}
                      onChange={(e) =>
                        handleChange(g.nig, "totalSantri", e.target.value)
                      }
                      className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-gray-600">Kehadiran</span>

                    <select
                      value={kehadiran}
                      onChange={(e) =>
                        handleChange(g.nig, "kehadiran", e.target.value)
                      }
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 py-1.5 pl-2 pr-7 text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">Pilih</option>
                      <option value="Hadir Penuh">Hadir Penuh</option>
                      <option value="Kurang 5 Hr">Kurang 5 Hr</option>
                      <option value="Kurang 10 Hr">Kurang 10 Hr</option>
                      <option value="Diatas 10 Hr">Diatas 10 Hr</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-gray-600">Status</span>

                    <span
                      className={`rounded-full px-2.5 py-1 font-medium ${
                        status === "Sangat Aktif"
                          ? "bg-green-100 text-green-700"
                          : status === "Aktif"
                            ? "bg-blue-100 text-blue-700"
                            : status === "Kurang Aktif"
                              ? "bg-yellow-100 text-yellow-700"
                              : status === "Tidak Aktif"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-gray-600">Gaji</span>

                    <span className="font-bold text-green-700">
                      {formatRupiah(getGajiGuru(status))}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Update : {dataPeriode.update || "-"}
                  </div>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full text-center text-xs font-semibold text-purple-700 transition hover:text-purple-800"
                  >
                    Simpan Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        </>
      )}

      {/* PAGINATION */}
        {filteredGuru.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">{startIndex + 1}</span>{" "}
              –{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(startIndex + itemsPerPage, filteredGuru.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-gray-700">{filteredGuru.length}</span>{" "}
              guru
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Tampilkan</span>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 py-1.5 pl-2 pr-7 text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span className="text-xs text-gray-500">data</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
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
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

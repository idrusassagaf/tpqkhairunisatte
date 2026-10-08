import { tanggalHariIni, periodeSekarang, tahunSekarang } from "../utils/waktu";
import TableLoadingRow from "../components/TableLoadingRow";
import useSedangMemuat from "../hooks/useSedangMemuat";
import { notifySuccess } from "../toastStore";
import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../api";

const GAJI_PER_HARI = 50000;

export default function StatusGuru() {
  const sedangMemuat = useSedangMemuat();

  const [guru, setGuru] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [jadwal, setJadwal] = useState({});
  const [gajiPerHari, setGajiPerHari] = useState(GAJI_PER_HARI);
  const [search, setSearch] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [statusData, setStatusData] = useState({});
  const [showDownload, setShowDownload] = useState(false);

  // ================= PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ================= FORMAT PERIODE =================
  const getCurrentPeriode = () => {
    return periodeSekarang();
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

  // ================= JADWAL MENGAJI DARI KALENDER =================
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await api.get("/jadwal");

        setJadwal(res.data || {});
      } catch (err) {
        console.error("Gagal ambil jadwal kalender:", err);
        setJadwal({});
      }
    };

    fetchJadwal();
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

  // ================= GAJI PER HARI DARI PENGATURAN =================
  useEffect(() => {
    const fetchGaji = async () => {
      try {
        const res = await api.get("/pengaturan-sistem");
        const nilai = Number(res?.data?.data?.gaji_per_hari);

        if (!Number.isNaN(nilai)) {
          setGajiPerHari(nilai);
        }
      } catch (err) {
        console.error("Gagal ambil pengaturan gaji:", err);
      }
    };

    fetchGaji();
  }, []);

  // ================= FETCH ABSENSI GURU PER BULAN =================
  useEffect(() => {
    if (!filterPeriode) return;

    const fetchAbsensi = async () => {
      try {
        const res = await api.get("/absensi", {
          params: { tipe: "guru", bulan: filterPeriode },
        });

        setAbsensi(res?.data?.absensi || []);
      } catch (err) {
        console.error("Gagal ambil absensi guru:", err);
        setAbsensi([]);
      }
    };

    fetchAbsensi();
  }, [filterPeriode]);

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
    localStorage.setItem("status_guru", JSON.stringify(statusData));

    notifySuccess("Data berhasil disimpan");
  };

  // ================= HITUNG HARI HADIR & GAJI =================
  const getHariHadir = (guruId) => {
    return absensi.filter(
      (a) =>
        a.tipe === "guru" &&
        Number(a.person_id) === Number(guruId) &&
        a.status === "H" &&
        // Hanya hitung kalau tanggalnya masih "mengaji" di kalender.
        // Kalau diubah jadi libur, absensi H yang sudah ada tidak
        // ikut dihitung lagi.
        jadwal[String(a.tanggal).slice(0, 10)] === "mengaji",
    ).length;
  };

  const getGajiGuru = (guruId) => getHariHadir(guruId) * gajiPerHari;

  // ================= FORMAT RUPIAH =================
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
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
  const totalGaji = filteredGuru.reduce(
    (total, g) => total + getGajiGuru(g.id),
    0,
  );

  // =========================================================
  // DOWNLOAD EXCEL STATUS GURU
  // =========================================================
  const downloadExcel = () => {
    if (filteredGuru.length === 0) {
      alert("Tidak ada data status guru untuk di-download.");
      return;
    }

    const periodeAktif = filterPeriode || getCurrentPeriode();

    const [tahun, bulan] = periodeAktif.split("-");

    const excelData = filteredGuru.map((g, index) => {
      const dataPeriode = statusData[g.nig]?.[periodeAktif] || {};

      return {
        No: index + 1,

        "Nama Guru": g.nama_guru || "-",

        NIG: g.nig || "-",

        "Total Santri": dataPeriode.totalSantri || "-",

        "Hari Hadir": getHariHadir(g.id),

        "Gaji Per-Guru": getGajiGuru(g.id),

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
      { wch: 14 },
      { wch: 20 },
      { wch: 18 },
    ];

    const namaFile = search.trim()
      ? `status-guru-${tahun}-${bulan}-hasil-pencarian.xlsx`
      : `status-guru-${tahun}-${bulan}.xlsx`;

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF STATUS GURU
  // =========================================================
  const downloadPDF = () => {
    if (filteredGuru.length === 0) {
      alert("Tidak ada data status guru untuk di-download.");
      return;
    }

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

      return [
        index + 1,

        g.nama_guru || "-",

        g.nig || "-",

        dataPeriode.totalSantri || "-",

        getHariHadir(g.id),

        formatRupiah(getGajiGuru(g.id)),

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
          "Hari Hadir",
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
          cellWidth: 30,
        },

        5: {
          cellWidth: 45,
        },

        6: {
          cellWidth: 50,
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

              const tahun = tahunSekarang();

              return (
                <option key={nomor} value={tahun + "-" + nomor}>
                  {bulan.toUpperCase().split("").join(" ")} - {tahun}
                </option>
              );
            })}
          </select>

          {/* ================= SIMPAN ================= */}
          <button
            type="button"
            onClick={handleSave}
            className="
              inline-flex
              items-center
              justify-center
              px-4 py-2
              rounded-xl
              bg-purple-600
              text-white
              text-sm
              font-medium
              hover:bg-purple-700
              transition
            "
          >
            Simpan
          </button>

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

              <th className="px-2 py-2 border">Hari Hadir</th>

              <th className="px-2 py-2 border">Gaji Per-Guru</th>

              <th className="px-2 py-2 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {sedangMemuat ? (
              <TableLoadingRow colSpan={8} />
            ) : (
              <>
                {filteredGuru.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      Data guru belum tersedia
                    </td>
                  </tr>
                ) : (
                  paginatedGuru.map((g, i) => {
                    const dataPeriode =
                      statusData[g.nig]?.[filterPeriode] || {};

                    const hariHadir = getHariHadir(g.id);

                    const gaji = getGajiGuru(g.id);

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

                        {/* HARI HADIR (dari absensi) */}
                        <td className="px-2 py-1 border text-center">
                          <span
                            className={`
                          px-3 py-1 rounded-full
                          text-xs font-medium
                          ${
                            hariHadir > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                          >
                            {hariHadir} hari
                          </span>
                        </td>

                        {/* GAJI */}
                        <td className="px-2 py-1 border text-center">
                          <span className="font-semibold text-green-700">
                            {formatRupiah(gaji)}
                          </span>
                        </td>

                        {/* UPDATE */}
                        <td className="px-2 py-1 border text-center text-xs text-gray-500">
                          {dataPeriode.update || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD ================= */}
      <div className="md:hidden space-y-3">
        {paginatedGuru.map((g, i) => {
          const dataPeriode = statusData[g.nig]?.[filterPeriode] || {};

          const hariHadir = getHariHadir(g.id);

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

                {/* HARI HADIR (dari absensi) */}
                <div className="text-xs">
                  <span className="font-medium">Hari Hadir :</span>{" "}
                  <span className="font-medium">{hariHadir} hari</span>
                </div>

                {/* GAJI */}
                <div className="text-xs">
                  <span className="font-medium">Gaji :</span>{" "}
                  <span className="font-bold text-green-700">
                    {formatRupiah(getGajiGuru(g.id))}
                  </span>
                </div>

                {/* UPDATE */}
                <div className="text-xs text-gray-500">
                  Update : {dataPeriode.update || "-"}
                </div>
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

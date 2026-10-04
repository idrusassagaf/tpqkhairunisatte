import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Download,
  FileSpreadsheet,
  FileText,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { api } from "../api";
import { SkeletonRows } from "../components/Skeleton";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500";

export default function ProgresHafalanSantri() {
  const [loading, setLoading] = useState(true);

  const { nis } = useParams();

  const [guru, setGuru] = useState([]);
  const [santri, setSantri] = useState(null);
  const [dataHafalan, setDataHafalan] = useState({});
  const [showDownload, setShowDownload] = useState(false);

  const location = useLocation();

  const backLink = location.pathname.includes("master-hafalan")
    ? "/master-hafalan"
    : "/progres-hafalan";

  const isReadonly = location.pathname.includes("/progres-hafalan/");

  // ================= JENIS HAFALAN =================

  const jenisHafalan = [
    "Doa sebelum belajar mengaji",
    "Doa sesudah belajar mengaji",
    "Doa berwudhu",
    "Doa sesudah berwudhu",
    "Doa sesudah Azan",
    "Doa menjawab iqamah",
    "Niat shalat Dhuhur",
    "Niat shalat Ashar",
    "Niat shalat Maghrib",
    "Niat shalat Isya",
    "Niat shalat Subuh",
    "Doa Doa Iftitah",
    "Doa ketika ruku",
    "Doa ketika i'tidal",
    "Doa ketika sujud",
    "Doa duduk diantara dua sujud",
    "Doa tahyatul awal",
    "Doa tahyatul akhir",
    "Doa Qunut",
    "Doa sebelum tidur",
    "Doa bangun tidur",
    "Doa masuk kamar mandi",
    "Doa keluar kamar mandi",
    "Doa bersuci dari hadast kecil",
    "Doa mandi janabah",
    "Doa mandi hari jumat",
    "Doa ketika bercermin",
    "Doa ketika masuk rumah",
    "Doa keluar rumah",
    "Doa masuk masjid",
    "Doa keluar masjid",
    "Doa naik kendaraan bepergian",
    "Doa sebelum makan",
    "Doa sesudah makan",
    "Doa untuk orangtua",
    "Doa selamat dunia dan akhirat",
    "Doa memohon ampunan",
    "Doa syifa (kesembuhan)",
    "Niat berpuasa Ramadhan",
    "Niat membayar hutang puasa Ramadhan",
    "Doa berbuka puasa",
    "Ayat Kursi",
    "Niat shalat witir",
    "Niat shalat tarawih",
    "Dzikir tauhid",
    "Bacaan salam kepada Rasulullah SAW dan Keluarga",
  ];

  // =========================================================
  // NORMALISASI NAMA JENIS HAFALAN
  // =========================================================

  const normalizeJenis = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // NORMALISASI DATA LAMA LOCALSTORAGE
  // =========================================================

  const normalizeHafalanData = (savedData) => {
    if (!savedData || typeof savedData !== "object") {
      return {};
    }

    const entries = Object.entries(savedData);

    if (entries.length === 0) {
      return {};
    }

    const normalized = {};

    const hasZeroIndex = Object.prototype.hasOwnProperty.call(savedData, "0");

    const hasFortySixIndex = Object.prototype.hasOwnProperty.call(
      savedData,
      "46",
    );

    const isOneBased = !hasZeroIndex && hasFortySixIndex;

    entries.forEach(([key, item]) => {
      if (!item || typeof item !== "object") {
        return;
      }

      let targetIndex = -1;

      if (item.jenis) {
        const jenisItem = normalizeJenis(item.jenis);

        targetIndex = jenisHafalan.findIndex(
          (jenis) => normalizeJenis(jenis) === jenisItem,
        );
      }

      if (targetIndex === -1) {
        const numericKey = Number(key);

        if (Number.isInteger(numericKey)) {
          if (isOneBased) {
            targetIndex = numericKey - 1;
          } else {
            targetIndex = numericKey;
          }
        }
      }

      if (targetIndex < 0 || targetIndex >= jenisHafalan.length) {
        return;
      }

      normalized[targetIndex] = {
        ...item,
        jenis: jenisHafalan[targetIndex],
      };
    });

    return normalized;
  };

  // =========================================================
  // FORMAT TANGGAL DATABASE
  // =========================================================

  const formatTanggal = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("id-ID");
    } catch {
      return String(value);
    }
  };

  // =========================================================
  // HITUNG JUMLAH
  // =========================================================

  const getJumlah = (status) => {
    return Object.values(dataHafalan).filter((item) => item?.progres === status)
      .length;
  };

  // =========================================================
  // LOAD DATA DARI DATABASE
  //
  // DATABASE = SUMBER UTAMA
  //
  // Jika ada beberapa record untuk jenis hafalan yang sama,
  // data TERBARU yang dipakai.
  // =========================================================

  const loadHafalan = async () => {
    try {
      const [masterRes, hafalanRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/progres-hafalan"),
      ]);

      // -------------------------------------------------------
      // DATA GURU
      // -------------------------------------------------------

      const dataGuru = masterRes?.data?.data?.guru || [];

      setGuru(dataGuru);

      // -------------------------------------------------------
      // DATA SANTRI
      // -------------------------------------------------------

      const dataSantri = masterRes?.data?.data?.santri || [];

      const found = dataSantri.find((s) => String(s.nis) === String(nis));

      setSantri(found || null);

      // -------------------------------------------------------
      // DATA HAFALAN DARI DATABASE
      // -------------------------------------------------------

      const dataDatabase = hafalanRes?.data?.data || [];

      const normalizedDatabase = {};

      if (Array.isArray(dataDatabase)) {
        dataDatabase.forEach((item) => {
          if (String(item?.nis || "") !== String(nis || "")) {
            return;
          }

          const jenisDatabase = normalizeJenis(item?.jenis_hafalan);

          if (!jenisDatabase) {
            return;
          }

          const index = jenisHafalan.findIndex(
            (jenis) => normalizeJenis(jenis) === jenisDatabase,
          );

          if (index === -1) {
            return;
          }

          const existing = normalizedDatabase[index];

          // ---------------------------------------------------
          // Jika jenis hafalan belum ada, langsung simpan.
          // ---------------------------------------------------

          if (!existing) {
            normalizedDatabase[index] = {
              jenis: jenisHafalan[index],
              guru: item?.nama_guru || "",
              progres: item?.progres || "",
              prestasi: item?.prestasi || "",
              update: formatTanggal(item?.updated_at || item?.created_at),
              updated_at: item?.updated_at || "",
              record_id: item?.id || 0,
            };

            return;
          }

          // ---------------------------------------------------
          // Jika jenis sama muncul lebih dari sekali,
          // pilih record yang paling baru.
          // ---------------------------------------------------

          const existingDate = new Date(existing?.updated_at || 0).getTime();

          const currentDate = new Date(
            item?.updated_at || item?.created_at || 0,
          ).getTime();

          let useCurrent = false;

          if (!Number.isNaN(currentDate) && !Number.isNaN(existingDate)) {
            useCurrent = currentDate >= existingDate;
          } else {
            useCurrent =
              Number(item?.id || 0) >= Number(existing?.record_id || 0);
          }

          if (useCurrent) {
            normalizedDatabase[index] = {
              jenis: jenisHafalan[index],
              guru: item?.nama_guru || "",
              progres: item?.progres || "",
              prestasi: item?.prestasi || "",
              update: formatTanggal(item?.updated_at || item?.created_at),
              updated_at: item?.updated_at || "",
              record_id: item?.id || 0,
            };
          }
        });
      }

      // -------------------------------------------------------
      // DATA LOCALSTORAGE LAMA
      // -------------------------------------------------------

      let normalizedLocal = {};

      const saved = localStorage.getItem(`hafalan_${nis}`);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          normalizedLocal = normalizeHafalanData(parsed);
        } catch (error) {
          console.error("Data hafalan localStorage tidak valid:", error);
        }
      }

      // -------------------------------------------------------
      // GABUNGKAN DATA
      //
      // DATABASE MENANG.
      //
      // localStorage hanya dipakai jika jenis hafalan tersebut
      // belum mempunyai data di database.
      // -------------------------------------------------------

      const merged = {};

      for (let i = 0; i < jenisHafalan.length; i++) {
        if (normalizedDatabase[i]) {
          merged[i] = normalizedDatabase[i];
        } else if (normalizedLocal[i]) {
          merged[i] = {
            ...normalizedLocal[i],
            jenis: jenisHafalan[i],
          };
        }
      }

      setDataHafalan(merged);
    } catch (error) {
      console.error("Gagal mengambil data hafalan dari database:", error);

      // -------------------------------------------------------
      // FALLBACK LOCALSTORAGE
      // -------------------------------------------------------

      try {
        const saved = localStorage.getItem(`hafalan_${nis}`);

        if (saved) {
          const parsed = JSON.parse(saved);

          const normalized = normalizeHafalanData(parsed);

          setDataHafalan(normalized);
        } else {
          setDataHafalan({});
        }
      } catch (localError) {
        console.error("Gagal membaca fallback localStorage:", localError);

        setDataHafalan({});
      }
    }
  };

  // =========================================================
  // LOAD SEMUA DATA
  // =========================================================

  useEffect(() => {
    loadHafalan().finally(() => setLoading(false));
  }, [nis]);

  // =========================================================
  // REFRESH SAAT HALAMAN KEMBALI AKTIF
  // =========================================================

  useEffect(() => {
    const handleFocus = () => {
      loadHafalan();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [nis]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = async (index, field, value) => {
    const updated = {
      ...dataHafalan,

      [index]: {
        ...dataHafalan[index],

        jenis: jenisHafalan[index],

        [field]: value,

        update: new Date().toLocaleDateString("id-ID"),
      },
    };

    // -------------------------------------------------------
    // UPDATE UI SEGERA
    // -------------------------------------------------------

    setDataHafalan(updated);

    // -------------------------------------------------------
    // localStorage BACKUP
    // -------------------------------------------------------

    try {
      localStorage.setItem(`hafalan_${nis}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Gagal menyimpan backup localStorage:", error);
    }

    // -------------------------------------------------------
    // DATA UNTUK DATABASE
    // -------------------------------------------------------

    try {
      const item = updated[index];

      const namaGuru = String(item?.guru || "").trim();

      const progres = String(item?.progres || "").trim();

      if (!namaGuru) {
        if (field === "progres" && value) {
          window.__tpqNotify?.toast({
            type: "warning",
            title: "Guru belum dipilih",
            message: "Silakan pilih Guru terlebih dahulu.",
          });
        }
        return;
      }

      const dataGuru = guru.find((g) => {
        const nama = g.nama || g.nama_guru || g.name || "";

        return String(nama).trim().toLowerCase() === namaGuru.toLowerCase();
      });

      const prestasi =
        progres === "Lancar"
          ? "Di-Lanjut"
          : progres === "Belum"
            ? "Di-Ulang"
            : "";

      await api.post("/progres-hafalan", {
        nama_santri: santri?.nama || "",
        nis: santri?.nis || nis,
        nama_guru: namaGuru,
        nig: dataGuru?.nig || "",
        jenis_hafalan: jenisHafalan[index],
        progres,
        prestasi,
      });

      // -------------------------------------------------------
      // SETELAH BERHASIL, AMBIL ULANG DARI DATABASE
      // -------------------------------------------------------

      await loadHafalan();
    } catch (err) {
      console.error("Gagal simpan hafalan ke database:", err);

      await loadHafalan();
    }
  };

  // =========================================================
  // DATA UNTUK DOWNLOAD
  // =========================================================

  const getDownloadData = () => {
    return jenisHafalan.map((item, index) => {
      const progres = dataHafalan[index]?.progres || "-";

      const prestasi =
        progres === "Lancar"
          ? "Di-Lanjut"
          : progres === "Belum"
            ? "Di-Ulang"
            : "-";

      return {
        no: index + 1,
        jenis: item,
        guru: dataHafalan[index]?.guru || "-",
        progres,
        prestasi,
        update: dataHafalan[index]?.update || "-",
      };
    });
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const handleDownloadExcel = () => {
    if (!santri) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Data belum tersedia",
        message: "Data santri belum tersedia.",
      });
      return;
    }

    try {
      const downloadData = getDownloadData();

      const namaSantri = santri.nama || "Santri";

      const excelData = [
        ["PROGRES HAFALAN SANTRI"],
        ["TPQ Hairunissa Ternate"],
        [],
        [
          "Nama Santri",
          namaSantri,
          "|",
          "NIS",
          nis,
          "|",
          "Kelas",
          santri.kelas || "-",
        ],
        [
          "Sudah Lancar",
          `${getJumlah("Lancar")}-Hafalan`,
          "|",
          "Belum Lancar",
          `${getJumlah("Belum")}-Hafalan`,
        ],
        [],
        ["No", "Jenis Hafalan", "Guru", "Progres", "Prestasi", "Update"],
      ];

      downloadData.forEach((d) => {
        excelData.push([
          d.no,
          d.jenis,
          d.guru,
          d.progres,
          d.prestasi,
          d.update,
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 7 },
        { wch: 38 },
        { wch: 25 },
        { wch: 14 },
        { wch: 15 },
        { wch: 18 },
        { wch: 14 },
        { wch: 20 },
      ];

      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: 7 },
        },
        {
          s: { r: 1, c: 0 },
          e: { r: 1, c: 7 },
        },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Progres Hafalan");

      const fileName = `progres-hafalan-${nis}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat Excel:", error);

      alert("Excel gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = () => {
    if (!santri) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Data belum tersedia",
        message: "Data santri belum tersedia.",
      });
      return;
    }

    try {
      const downloadData = getDownloadData();

      const namaSantri = santri.nama || "-";

      const tanggalDownload = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      doc.setFont("helvetica", "bold");

      doc.setFontSize(16);

      doc.text("PROGRES HAFALAN SANTRI", centerX, 15, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text("TPQ Hairunissa Ternate", centerX, 21, {
        align: "center",
      });

      doc.setFontSize(9);

      const identitas =
        `Nama Santri : ${namaSantri} | ` +
        `NIS : ${nis} | ` +
        `Kelas : ${santri.kelas || "-"}`;

      doc.text(identitas, centerX, 28, {
        align: "center",
      });

      const jumlahHafalan =
        `Sudah Lancar : ${getJumlah("Lancar")}-Hafalan | ` +
        `Belum Lancar : ${getJumlah("Belum")}-Hafalan`;

      doc.text(jumlahHafalan, centerX, 34, {
        align: "center",
      });

      const tableData = downloadData.map((d) => [
        d.no,
        d.jenis,
        d.guru,
        d.progres,
        d.prestasi,
        d.update,
      ]);

      autoTable(doc, {
        startY: 40,

        head: [
          ["No", "Jenis Hafalan", "Guru", "Progres", "Prestasi", "Update"],
        ],

        body: tableData,

        theme: "grid",

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

        columnStyles: {
          0: {
            cellWidth: 10,

            halign: "center",
          },

          1: {
            cellWidth: 75,
          },

          2: {
            cellWidth: 45,
          },

          3: {
            cellWidth: 30,

            halign: "center",
          },

          4: {
            cellWidth: 30,

            halign: "center",
          },

          5: {
            cellWidth: 35,

            halign: "center",
          },
        },

        margin: {
          left: 36,

          right: 36,
        },

        didDrawPage: () => {
          const nomorHalaman = doc.internal.getNumberOfPages();

          doc.setFont("helvetica", "normal");

          doc.setFontSize(7);

          doc.text(
            `TPQ Hairunissa • Progres Hafalan Santri • Update ${tanggalDownload} • Halaman ${nomorHalaman}`,
            centerX,
            pageHeight - 7,
            {
              align: "center",
            },
          );
        },
      });

      const fileName = `progres-hafalan-${nis}.pdf`;

      doc.save(fileName);

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF hafalan santri:", error);
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
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <BookOpen size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">
              {santri?.nama || "Hafalan Santri"}
            </h1>

            <p className="mt-0.5 text-sm text-gray-500">
              NIS {nis} · Kelas {santri?.kelas || "-"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                Sudah Lancar: {getJumlah("Lancar")} Hafalan
              </span>

              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                Belum Lancar: {getJumlah("Belum")} Hafalan
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Download size={17} />
              Download
            </button>

            {showDownload && (
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
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

          <Link
            to={backLink}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-purple-700 transition hover:bg-purple-50"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>
      </div>

      {/* TABLE DESKTOP */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-14 px-4 py-3 text-center font-semibold">No</th>
              <th className="px-4 py-3 text-left font-semibold">Jenis Hafalan</th>
              <th className="px-4 py-3 text-left font-semibold">Guru</th>
              <th className="px-4 py-3 text-left font-semibold">Progres</th>
              <th className="px-4 py-3 text-center font-semibold">Prestasi</th>
              <th className="px-4 py-3 text-center font-semibold">Update</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-0">
                  <SkeletonRows rows={8} cols={4} />
                </td>
              </tr>
            ) : jenisHafalan.map((item, i) => {
              const progres = dataHafalan[i]?.progres || "";

              const prestasi =
                progres === "Belum"
                  ? "Di Ulang"
                  : progres === "Lancar"
                    ? "Di Lanjut"
                    : "-";

              return (
                <tr
                  key={i}
                  className="border-t border-gray-100 transition hover:bg-purple-50/40"
                >
                  <td className="px-4 py-3 text-center text-gray-500">{i + 1}</td>

                  <td className="px-4 py-3 font-medium text-gray-900">{item}</td>

                  <td className="px-4 py-3">
                    <select
                      disabled={isReadonly}
                      value={dataHafalan[i]?.guru || ""}
                      onChange={(e) => handleChange(i, "guru", e.target.value)}
                      className={`${inputCls} py-1.5 text-xs`}
                    >
                      <option value="">Pilih Guru</option>

                      {guru.map((g, idx) => {
                        const namaGuru =
                          g.nama || g.nama_guru || g.name || "Tanpa Nama";

                        return (
                          <option key={idx} value={namaGuru}>
                            {namaGuru}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      disabled={isReadonly}
                      value={progres}
                      onChange={(e) => handleChange(i, "progres", e.target.value)}
                      className={`${inputCls} py-1.5 text-xs`}
                    >
                      <option value="">Pilih</option>
                      <option value="Belum">Belum</option>
                      <option value="Lancar">Lancar</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {prestasi !== "-" ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          progres === "Lancar"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {prestasi}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {dataHafalan[i]?.update || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <SkeletonRows rows={5} cols={2} />
        ) : jenisHafalan.map((item, i) => {
          const progres = dataHafalan[i]?.progres || "";

          const prestasi =
            progres === "Belum"
              ? "Di Ulang"
              : progres === "Lancar"
                ? "Di Lanjut"
                : "-";

          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-start gap-3 bg-purple-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                  {i + 1}
                </span>

                <span className="text-sm font-semibold text-gray-900">{item}</span>
              </div>

              <div className="space-y-3 p-4 text-sm text-gray-700">
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Guru</div>

                  <select
                    disabled={isReadonly}
                    value={dataHafalan[i]?.guru || ""}
                    onChange={(e) => handleChange(i, "guru", e.target.value)}
                    className={`${inputCls} text-xs`}
                  >
                    <option value="">Pilih Guru</option>

                    {guru.map((g, idx) => {
                      const namaGuru =
                        g.nama || g.nama_guru || g.name || "Tanpa Nama";

                      return (
                        <option key={idx} value={namaGuru}>
                          {namaGuru}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Progres</div>

                  <select
                    disabled={isReadonly}
                    value={progres}
                    onChange={(e) => handleChange(i, "progres", e.target.value)}
                    className={`${inputCls} text-xs`}
                  >
                    <option value="">Pilih</option>
                    <option value="Belum">Belum</option>
                    <option value="Lancar">Lancar</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">Prestasi</span>

                  <span className="font-semibold text-gray-900">{prestasi}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Update: {dataHafalan[i]?.update || "-"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

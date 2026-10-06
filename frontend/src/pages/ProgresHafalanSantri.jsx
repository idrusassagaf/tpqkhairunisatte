import TableLoadingRow from "../components/TableLoadingRow";
import useSedangMemuat from "../hooks/useSedangMemuat";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { api } from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProgresHafalanSantri() {
  const sedangMemuat = useSedangMemuat();

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
    loadHafalan();
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
          alert("Silakan pilih Guru terlebih dahulu.");
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
      alert("Data santri belum tersedia.");
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
      alert("Data santri belum tersedia.");
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
      console.error("Gagal membuat PDF:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-4">
      {/* ================= HEADER ================= */}

      <div className="bg-gray-200 rounded-2xl shadow p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1
              className="
                hidden md:block
                text-lg
                font-light
                tracking-[3px]
                uppercase
                text-black
                mb-2
              "
            >
              HAFALAN SANTRI
            </h1>

            <div
              className="
                hidden md:flex
                flex-wrap
                items-center
                gap-2
                text-black
                font-light
                tracking-[2px]
                text-xs
              "
            >
              <span className="font-bold uppercase">{santri?.nama || "-"}</span>

              <span>|</span>

              <span>{nis}</span>

              <span>|</span>

              <span>Kelas {santri?.kelas || "-"}</span>

              <span>|</span>

              <span className="text-green-700">
                Sudah Lancar {getJumlah("Lancar")}-Hafalan
              </span>

              <span>|</span>

              <span className="text-red-600">
                Belum Lancar {getJumlah("Belum")}-Hafalan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDownload((prev) => !prev)}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2
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
                    right-0
                    mt-2
                    w-52
                    bg-white
                    border
                    border-gray-200
                    rounded-xl
                    shadow-lg
                    z-50
                    overflow-hidden
                  "
                >
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
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

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
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

            <Link
              to={backLink}
              className="
                text-sm
                font-medium
                text-purple-700
                hover:underline
                whitespace-nowrap
              "
            >
              ← Kembali
            </Link>
          </div>
        </div>

        {/* ================= MOBILE ================= */}

        <div className="md:hidden text-center text-black">
          <h1
            className="
              text-lg
              font-light
              tracking-[3px]
              uppercase
              mb-4
            "
          >
            HAFALAN SANTRI
          </h1>

          <div className="font-bold text-lg uppercase">
            {santri?.nama || "-"}
          </div>

          <div className="text-xs text-gray-700 mt-1">
            {nis} | Kelas {santri?.kelas || "-"}
          </div>

          <div className="text-xs text-green-700 mt-3">
            Sudah Lancar : {getJumlah("Lancar")}-Hafalan
          </div>

          <div className="text-xs text-red-600 mt-1">
            Belum Lancar : {getJumlah("Belum")}-Hafalan
          </div>

          <div className="relative flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2
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
                  top-full
                  mt-2
                  w-52
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-lg
                  z-50
                  overflow-hidden
                "
              >
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
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

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
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

      {/* ================= TABLE DESKTOP ================= */}

      <div className="hidden md:block bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full border text-xs text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border w-14">No</th>

              <th className="p-2 border text-left">Jenis Hafalan</th>

              <th className="p-2 border">Guru</th>

              <th className="p-2 border">Progres</th>

              <th className="p-2 border">Prestasi</th>

              <th className="p-2 border">Update</th>
            </tr>
          </thead>

          <tbody>
            {sedangMemuat ? (
              <TableLoadingRow colSpan={7} />
            ) : (
              <>
                {jenisHafalan.map((item, i) => {
                  const progres = dataHafalan[i]?.progres || "";

                  const prestasi =
                    progres === "Belum"
                      ? "Di Ulang"
                      : progres === "Lancar"
                        ? "Di Lanjut"
                        : "-";

                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 border text-center">{i + 1}</td>

                      <td className="p-2 border">{item}</td>

                      <td className="p-2 border">
                        <select
                          disabled={isReadonly}
                          value={dataHafalan[i]?.guru || ""}
                          onChange={(e) =>
                            handleChange(i, "guru", e.target.value)
                          }
                          className="
                        border rounded
                        px-2 py-1
                        w-full
                        text-xs
                      "
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

                      <td className="p-2 border">
                        <select
                          disabled={isReadonly}
                          value={progres}
                          onChange={(e) =>
                            handleChange(i, "progres", e.target.value)
                          }
                          className="
                        border rounded
                        px-2 py-1
                        w-full
                        text-xs
                      "
                        >
                          <option value="">Pilih</option>

                          <option value="Belum">Belum</option>

                          <option value="Lancar">Lancar</option>
                        </select>
                      </td>

                      <td className="p-2 border text-center font-medium">
                        {prestasi}
                      </td>

                      <td className="p-2 border text-center text-xs">
                        {dataHafalan[i]?.update || "-"}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD ================= */}

      <div className="md:hidden space-y-4">
        {jenisHafalan.map((item, i) => {
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
              className="
                bg-white
                rounded-2xl
                shadow
                border
                overflow-hidden
              "
            >
              <div
                className="
                  bg-purple-600
                  text-white
                  px-4 py-3
                  font-semibold
                  text-sm
                "
              >
                {i + 1}. {item}
              </div>

              <div className="p-4 space-y-4 text-sm text-black">
                <div>
                  <div className="mb-1 font-medium">Guru</div>

                  <select
                    disabled={isReadonly}
                    value={dataHafalan[i]?.guru || ""}
                    onChange={(e) => handleChange(i, "guru", e.target.value)}
                    className="
                      border rounded-lg
                      px-3 py-2
                      w-full
                      text-xs
                    "
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
                  <div className="mb-1 font-medium">Progres</div>

                  <select
                    disabled={isReadonly}
                    value={progres}
                    onChange={(e) => handleChange(i, "progres", e.target.value)}
                    className="
                      border rounded-lg
                      px-3 py-2
                      w-full
                      text-xs
                    "
                  >
                    <option value="">Pilih</option>

                    <option value="Belum">Belum</option>

                    <option value="Lancar">Lancar</option>
                  </select>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Prestasi :</span> {prestasi}
                </div>
              </div>

              <div className="bg-gray-100 px-4 py-2 border-t">
                <div className="text-xs text-gray-600">
                  Update : {dataHafalan[i]?.update || "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

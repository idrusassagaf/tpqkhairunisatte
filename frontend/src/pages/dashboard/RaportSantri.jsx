import { useEffect, useMemo, useState } from "react";

import { api } from "../../api";
import { Skeleton, SkeletonRows } from "../../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-green-400 focus:outline-none focus:ring-4 focus:ring-green-100";

import logoTPQ from "../../assets/logo-tpq.png";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  BookOpen,
  BookMarked,
  GraduationCap,
  UserRound,
  CalendarDays,
  ClipboardCheck,
  Award,
  FileText,
  Search,
  Download,
} from "lucide-react";

export default function RaportSantri() {
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [selectedNis, setSelectedNis] = useState("");
  const [searchSantri, setSearchSantri] = useState("");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [iqraData, setIqraData] = useState({});
  const [quranData, setQuranData] = useState({});
  const [hafalanData, setHafalanData] = useState([]);
  const [jumlahJenisHafalan, setJumlahJenisHafalan] = useState(0);
  const [catatanGuru, setCatatanGuru] = useState("");
  const [rekapKehadiran, setRekapKehadiran] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
  });

  // ============================================================
  // FORMAT TANGGAL INDONESIA
  // ============================================================

  const formatTanggalIndo = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const normalizeText = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeHafalanKey = (value) => {
    if (!value) return "";

    let text = normalizeText(value);

    text = text
      .replace(/\bselajar\b/g, "belajar")
      .replace(/\bengaji\b/g, "mengaji")
      .replace(
        /\bdoa\s+sesudah\s+belajar\s+mengaji\b/g,
        "doa sesudah belajar mengaji",
      )
      .replace(
        /\bdoa\s+sesudah\s+belajar\s+engaji\b/g,
        "doa sesudah belajar mengaji",
      )
      .replace(
        /\bdoa\s+sesudah\s+selajar\s+mengaji\b/g,
        "doa sesudah belajar mengaji",
      )
      .replace(
        /\bdoa\s+sesudah\s+selajar\s+engaji\b/g,
        "doa sesudah belajar mengaji",
      )
      .replace(/\s+/g, " ")
      .trim();

    return text;
  };

  const normalizeGuruKey = (value) => {
    if (!value) return "";

    return normalizeText(value)
      .replace(
        /\b(ust|ustad|ustadz|ustadzah|ustd|bu|ibu|pak|bapak|bpk|m|ma|s|si|sri|dr|prof|hr|h)\b/g,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
  };

  const dedupeHafalanRows = (rows = []) => {
    const map = new Map();

    rows.forEach((row) => {
      const key = `${normalizeHafalanKey(row?.jenis)}|${normalizeGuruKey(row?.guru)}`;

      if (!key || key === "|") return;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, { ...row });
        return;
      }

      map.set(key, {
        ...existing,
        ...row,
        jenis: existing?.jenis || row?.jenis || "",
        guru: existing?.guru || row?.guru || "",
        progres: row?.progres || existing?.progres || "",
        update: row?.update || existing?.update || "",
      });
    });

    return Array.from(map.values());
  };

  // ============================================================
  // NAMA BULAN
  // ============================================================

  const namaBulan = [
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

  // ============================================================
  // LOAD MASTER DATA
  // ============================================================

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError("");

      const [res, jenisRes] = await Promise.all([
        api.get("/master-data"),
        api.get("/master-hafalan"),
      ]);
      const data = res?.data?.data || {};

      setSantri(data.santri || []);
      setGuru(data.guru || []);
      setJumlahJenisHafalan((jenisRes?.data?.data || []).length);

      if (!selectedNis && data.santri?.length) {
        setSelectedNis(String(data.santri[0].nis));
      }
    } catch (err) {
      console.error("Gagal mengambil master data:", err);
      setError("Data santri belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HASIL PENCARIAN SANTRI
  // ============================================================

  const hasilPencarianSantri = useMemo(() => {
    const keyword = String(searchSantri || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return [];
    }

    return santri.filter((item) => {
      const nama = String(item?.nama || "").toLowerCase();
      const nis = String(item?.nis || "").toLowerCase();

      return nama.includes(keyword) || nis.includes(keyword);
    });
  }, [santri, searchSantri]);

  // ============================================================
  // PILIH SANTRI DARI HASIL PENCARIAN
  // ============================================================

  const handlePilihSantri = (item) => {
    setSelectedNis(String(item.nis));
    setSearchSantri("");
  };

  // ============================================================
  // SANTRI TERPILIH
  // ============================================================

  const selectedSantri = useMemo(() => {
    return santri.find((item) => String(item.nis) === String(selectedNis));
  }, [santri, selectedNis]);

  // ============================================================
  // LOAD DATA PROGRES
  // ============================================================

  useEffect(() => {
    if (!selectedNis) return;

    loadProgressData(selectedNis);
  }, [selectedNis, bulan, tahun]);

  const loadProgressData = async (nis) => {
    try {
      // --------------------------------------------------------
      // PROGRES IQRA + AL-QUR'AN + HAFALAN (DARI BACKEND)
      // --------------------------------------------------------

      const [iqraRes, quranRes, hafalanRes] = await Promise.all([
        api.get("/progres-iqra"),
        api.get("/progres-quran"),
        api.get("/progres-hafalan"),
      ]);

      const iqraRow = (iqraRes?.data?.data || []).find(
        (row) => String(row?.nis) === String(nis),
      );

      setIqraData({
        guru: iqraRow?.nama_guru || "",
        jilid: iqraRow?.jilid || "",
        hal: iqraRow?.halaman || "",
        progres: iqraRow?.progres || "",
      });

      const quranRow = (quranRes?.data?.data || []).find(
        (row) => String(row?.nis) === String(nis),
      );

      setQuranData({
        quran_guru: quranRow?.nama_guru || "",
        quran_juz: quranRow?.juz || "",
        quran_surah: quranRow?.surah || "",
        quran_ayat: quranRow?.ayat || "",
        quran_hal: quranRow?.halaman || "",
        quran_progres: quranRow?.progres || "",
      });

      const hafalanRows = dedupeHafalanRows(
        (hafalanRes?.data?.data || [])
          .filter((row) => String(row?.nis) === String(nis))
          .map((row) => ({
            jenis: row?.jenis_hafalan || "",
            guru: row?.nama_guru || "",
            progres: row?.progres || "",
            update: formatTanggalIndo(row?.updated_at || row?.created_at),
          })),
      );

      setHafalanData(hafalanRows);

      // --------------------------------------------------------
      // KEHADIRAN
      // --------------------------------------------------------

      try {
        const santriRow = santri.find(
          (item) => String(item.nis) === String(nis),
        );

        const bulanParam = `${tahun}-${String(bulan).padStart(2, "0")}`;

        const absensiRes = await api.get("/absensi", {
          params: { tipe: "santri", bulan: bulanParam },
        });

        const absensiRows = (absensiRes?.data?.absensi || []).filter(
          (row) => String(row?.person_id) === String(santriRow?.id),
        );

        setRekapKehadiran({
          hadir: absensiRows.filter((row) => row?.status === "H").length,
          izin: absensiRows.filter((row) => row?.status === "I").length,
          sakit: absensiRows.filter((row) => row?.status === "S").length,
          alpa: absensiRows.filter((row) => row?.status === "A").length,
        });
      } catch (absensiErr) {
        console.error("Gagal membaca data kehadiran:", absensiErr);

        setRekapKehadiran({ hadir: 0, izin: 0, sakit: 0, alpa: 0 });
      }

      // --------------------------------------------------------
      // CATATAN GURU
      // (belum ada tabel khusus di backend, tetap pakai localStorage)
      // --------------------------------------------------------

      const noteKey = `raport_catatan_${nis}_${tahun}_${bulan}`;
      const savedNote = localStorage.getItem(noteKey);

      setCatatanGuru(savedNote || "");
    } catch (err) {
      console.error("Gagal membaca data progres:", err);

      setIqraData({});
      setQuranData({});
      setHafalanData([]);
      setCatatanGuru("");
      setRekapKehadiran({ hadir: 0, izin: 0, sakit: 0, alpa: 0 });
    }
  };

  // ============================================================
  // SIMPAN CATATAN GURU
  // ============================================================

  const handleCatatanGuru = (value) => {
    setCatatanGuru(value);

    if (!selectedNis) return;

    const noteKey = `raport_catatan_${selectedNis}_${tahun}_${bulan}`;

    localStorage.setItem(noteKey, value);
  };

  // ============================================================
  // GURU IQRA
  // ============================================================

  const guruIqra = useMemo(() => {
    const namaGuru = iqraData?.guru || iqraData?.nama_guru || "";

    if (!namaGuru) return null;

    return (
      guru.find(
        (item) =>
          String(item.nama_guru || "")
            .trim()
            .toLowerCase() === String(namaGuru).trim().toLowerCase(),
      ) || null
    );
  }, [guru, iqraData]);

  // ============================================================
  // GURU QURAN
  // ============================================================

  const guruQuran = useMemo(() => {
    const namaGuru =
      quranData?.quran_guru || quranData?.guru || quranData?.nama_guru || "";

    if (!namaGuru) return null;

    return (
      guru.find(
        (item) =>
          String(item.nama_guru || "")
            .trim()
            .toLowerCase() === String(namaGuru).trim().toLowerCase(),
      ) || null
    );
  }, [guru, quranData]);

  // ============================================================
  // REKAP HAFALAN
  // ============================================================

  const rekapHafalan = useMemo(() => {
    const lancar = hafalanData.filter(
      (item) =>
        String(item?.progres || "")
          .trim()
          .toLowerCase() === "lancar",
    ).length;

    const belum = hafalanData.filter(
      (item) =>
        String(item?.progres || "")
          .trim()
          .toLowerCase() === "belum",
    ).length;

    const terisi = hafalanData.filter(
      (item) => String(item?.progres || "").trim() !== "",
    ).length;

    return {
      lancar,
      belum,
      terisi,
      total: hafalanData.length,
    };
  }, [hafalanData]);

  // ============================================================
  // PENCAPAIAN IQRA
  // ============================================================

  const pencapaianIqra = useMemo(() => {
    const progres = String(iqraData?.progres || "")
      .trim()
      .toLowerCase();

    if (progres === "lancar") {
      return "Lancar / Di-Lanjut";
    }

    if (progres === "belum") {
      return "Belum Lancar / Di-Ulang";
    }

    return "Belum ada data";
  }, [iqraData]);

  // ============================================================
  // PENCAPAIAN QURAN
  // ============================================================

  const pencapaianQuran = useMemo(() => {
    const progres = String(quranData?.quran_progres || "")
      .trim()
      .toLowerCase();

    if (progres === "lancar") {
      return "Lancar / Di-Lanjut";
    }

    if (progres === "belum") {
      return "Belum Lancar / Di-Ulang";
    }

    return "Belum ada data";
  }, [quranData]);

  // ============================================================
  // PENCAPAIAN BULANAN
  // ============================================================

  const pencapaianBulanan = useMemo(() => {
    const hasil = [];

    if (iqraData?.jilid || iqraData?.hal || iqraData?.progres) {
      hasil.push(
        `Iqra: ${pencapaianIqra}${
          iqraData?.jilid ? `, ${iqraData.jilid}` : ""
        }${iqraData?.hal ? ` halaman ${iqraData.hal}` : ""}.`,
      );
    }

    if (
      quranData?.quran_juz ||
      quranData?.quran_surah ||
      quranData?.quran_ayat ||
      quranData?.quran_hal ||
      quranData?.quran_progres
    ) {
      hasil.push(
        `Al-Qur'an: ${pencapaianQuran}${
          quranData?.quran_juz ? `, Juz ${quranData.quran_juz}` : ""
        }${quranData?.quran_surah ? `, Surah ${quranData.quran_surah}` : ""}${
          quranData?.quran_ayat ? `, Ayat ${quranData.quran_ayat}` : ""
        }${quranData?.quran_hal ? `, halaman ${quranData.quran_hal}` : ""}.`,
      );
    }

    if (hafalanData.length > 0) {
      hasil.push(
        `Hafalan: ${rekapHafalan.lancar} materi lancar dan ${rekapHafalan.belum} materi perlu diulang.`,
      );
    }

    if (hasil.length === 0) {
      return ["Belum terdapat data pembelajaran yang dapat dirangkum."];
    }

    return hasil;
  }, [
    iqraData,
    quranData,
    hafalanData,
    pencapaianIqra,
    pencapaianQuran,
    rekapHafalan,
  ]);

  // ============================================================
  // RINGKASAN KEHADIRAN
  // ============================================================

  const kehadiranText = useMemo(() => {
    const total =
      rekapKehadiran.hadir +
      rekapKehadiran.izin +
      rekapKehadiran.sakit +
      rekapKehadiran.alpa;

    if (total === 0) {
      return "Belum ada data kehadiran pada periode ini.";
    }

    return (
      `Hadir ${rekapKehadiran.hadir} hari, Izin ${rekapKehadiran.izin} hari, ` +
      `Sakit ${rekapKehadiran.sakit} hari, Alpa ${rekapKehadiran.alpa} hari ` +
      `dari total ${total} hari tercatat.`
    );
  }, [rekapKehadiran]);

  // ============================================================
  // FORMAT DATA
  // ============================================================

  const value = (data, fallback = "-") => {
    if (data === null || data === undefined || data === "") {
      return fallback;
    }

    return data;
  };

  // ============================================================
  // PDF - LOAD LOGO
  // ============================================================

  const getLogoDataUrl = async () => {
    const response = await fetch(logoTPQ);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  // ============================================================
  // PDF - DOWNLOAD RAPORT
  // ============================================================

  const handleDownloadPDF = async () => {
    if (!selectedSantri) {
      alert("Silakan pilih santri terlebih dahulu.");
      return;
    }

    if (downloading) return;

    try {
      setDownloading(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginLeft = 15;
      const marginRight = 15;
      const centerX = pageWidth / 2;

      const namaSantri = value(selectedSantri.nama);
      const nisSantri = value(selectedSantri.nis);
      const kelasSantri = value(selectedSantri.kelas);

      // ========================================================
      // LOGO
      // ========================================================

      try {
        const logoData = await getLogoDataUrl();

        doc.addImage(logoData, "PNG", centerX - 12, 10, 24, 24);
      } catch (logoError) {
        console.warn("Logo tidak dapat dimuat:", logoError);
      }

      // ========================================================
      // HEADER
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);

      doc.text("TPQ KHAIRUNNISSA TERNATE", centerX, 41, {
        align: "center",
      });

      doc.setFontSize(13);

      doc.text("RAPORT PERKEMBANGAN SANTRI", centerX, 48, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Periode ${namaBulan[bulan - 1]} ${tahun}`, centerX, 54, {
        align: "center",
      });

      doc.setDrawColor(60, 60, 60);

      doc.line(marginLeft, 59, pageWidth - marginRight, 59);

      let currentY = 67;

      // ========================================================
      // BIODATA
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("A. BIODATA SANTRI", marginLeft, currentY);

      currentY += 4;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 2.5,
          valign: "middle",
        },

        columnStyles: {
          0: {
            cellWidth: 32,
            fontStyle: "bold",
          },

          1: {
            cellWidth: 57,
          },

          2: {
            cellWidth: 32,
            fontStyle: "bold",
          },

          3: {
            cellWidth: 57,
          },
        },

        body: [
          ["Nama Santri", namaSantri, "NIS", nisSantri],

          [
            "Kelas",
            kelasSantri,
            "Jenis Kelamin",
            selectedSantri.jenis_kelamin === "L"
              ? "Laki-laki"
              : selectedSantri.jenis_kelamin === "P"
                ? "Perempuan"
                : value(selectedSantri.jenis_kelamin),
          ],

          [
            "Tanggal Lahir",
            value(selectedSantri.tanggal_lahir),
            "Usia",
            value(selectedSantri.usia),
          ],

          [
            "Nama Ayah",
            value(selectedSantri.orang_tua?.nama_ayah),
            "Nama Ibu",
            value(selectedSantri.orang_tua?.nama_ibu),
          ],

          [
            "Alamat",
            value(selectedSantri.alamat),
            "Status Santri",
            value(selectedSantri.status_anak || selectedSantri.status_orangtua),
          ],

          [
            "Kontak Orang Tua",
            value(selectedSantri.kontak || selectedSantri.orang_tua?.no_hp),
            "",
            "",
          ],
        ],
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // IQRA
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("B. PERKEMBANGAN IQRA", marginLeft, currentY);

      currentY += 4;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        head: [["Jilid", "Halaman", "Guru", "NIG", "Progres", "Pencapaian"]],

        body: [
          [
            value(iqraData?.jilid),
            value(iqraData?.hal),
            value(iqraData?.guru),
            value(guruIqra?.nig),
            value(iqraData?.progres),
            pencapaianIqra,
          ],
        ],

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2.3,
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            halign: "center",
          },

          1: {
            halign: "center",
          },

          3: {
            halign: "center",
          },

          4: {
            halign: "center",
          },
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // AL-QUR'AN
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("C. PERKEMBANGAN AL-QUR'AN", marginLeft, currentY);

      currentY += 4;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        head: [["Juz", "Surah", "Ayat", "Halaman", "Guru", "NIG", "Progres"]],

        body: [
          [
            value(quranData?.quran_juz),
            value(quranData?.quran_surah),
            value(quranData?.quran_ayat),
            value(quranData?.quran_hal),
            value(quranData?.quran_guru),
            value(guruQuran?.nig),
            value(quranData?.quran_progres),
          ],
        ],

        styles: {
          font: "helvetica",
          fontSize: 7.5,
          cellPadding: 2.2,
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            halign: "center",
          },

          2: {
            halign: "center",
          },

          3: {
            halign: "center",
          },

          5: {
            halign: "center",
          },

          6: {
            halign: "center",
          },
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // HAFALAN - RINGKASAN
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("D. PERKEMBANGAN HAFALAN", marginLeft, currentY);

      currentY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      doc.text(
        `Total materi adalah jumlah doa yang sedang dipelajari dari total ${jumlahJenisHafalan} kurikulum/jenis hafalan pada TPQ Khairunnissa.`,
        marginLeft,
        currentY,
        {
          maxWidth: pageWidth - marginLeft - marginRight,
        },
      );

      currentY += 8;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        head: [["Total Materi", "Lancar", "Perlu Diulang", "Belum Terisi"]],

        body: [
          [
            rekapHafalan.total || 0,
            rekapHafalan.lancar || 0,
            rekapHafalan.belum || 0,
            Math.max(0, jumlahJenisHafalan - rekapHafalan.terisi),
          ],
        ],

        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 2.5,
          halign: "center",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },
      });

      currentY = doc.lastAutoTable.finalY + 7;

      // ========================================================
      // DAFTAR HAFALAN
      // ========================================================

      const hafalanRows =
        hafalanData.length > 0
          ? hafalanData.map((item, index) => [
              index + 1,
              value(item?.jenis),
              value(item?.guru),
              value(item?.progres),

              String(item?.progres || "").toLowerCase() === "lancar"
                ? "Di-Lanjut"
                : String(item?.progres || "").toLowerCase() === "belum"
                  ? "Di-Ulang"
                  : "-",

              value(item?.update),
            ])
          : [["-", "Belum ada data hafalan.", "-", "-", "-", "-"]];

      // ========================================================
      // PERUBAHAN TABEL PDF PERKEMBANGAN HAFALAN
      // ========================================================

      autoTable(doc, {
        startY: currentY,

        tableWidth: 180,

        margin: {
          left: marginLeft,
          right: marginRight,
          bottom: 15,
        },

        theme: "grid",

        head: [
          ["No", "Materi Hafalan", "Guru", "Progres", "Pencapaian", "Update"],
        ],

        body: hafalanRows,

        styles: {
          font: "helvetica",
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 8,
            halign: "center",
          },

          1: {
            cellWidth: 60,
          },

          2: {
            cellWidth: 28,
          },

          3: {
            cellWidth: 27,
            halign: "center",
          },

          4: {
            cellWidth: 29,
            halign: "center",
          },

          5: {
            cellWidth: 28,
            halign: "center",
          },
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // KEHADIRAN
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("E. KEHADIRAN", marginLeft, currentY);

      currentY += 4;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        head: [["Hadir", "Izin", "Sakit", "Alpa"]],

        body: [
          [
            String(rekapKehadiran.hadir),
            String(rekapKehadiran.izin),
            String(rekapKehadiran.sakit),
            String(rekapKehadiran.alpa),
          ],
        ],

        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },
      });

      currentY = doc.lastAutoTable.finalY + 5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);

      doc.text(
        `Rekap kehadiran periode ${namaBulan[bulan - 1]} ${tahun}.`,
        marginLeft,
        currentY,
      );

      currentY += 8;

      // ========================================================
      // PRESTASI / PENCAPAIAN
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("F. PRESTASI / PENCAPAIAN BULANAN", marginLeft, currentY);

      currentY += 4;

      const pencapaianRows = pencapaianBulanan.map((item, index) => [
        index + 1,
        item,
      ]);

      pencapaianRows.push([
        pencapaianRows.length + 1,
        `Kehadiran: ${kehadiranText}`,
      ]);

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        head: [["No", "Pencapaian"]],

        body: pencapaianRows,

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2.5,
          valign: "top",
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 12,
            halign: "center",
          },
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // CATATAN GURU
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("G. CATATAN GURU", marginLeft, currentY);

      currentY += 4;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        body: [
          [catatanGuru.trim() ? catatanGuru.trim() : "Belum ada catatan guru."],
        ],

        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 4,
          minCellHeight: 22,
          valign: "top",
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // ========================================================
      // KESIMPULAN
      // ========================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("H. KESIMPULAN", marginLeft, currentY);

      currentY += 4;

      const kesimpulan =
        `Perkembangan santri pada periode ${namaBulan[bulan - 1]} ${tahun} ` +
        `ditampilkan berdasarkan data pembelajaran yang tersedia pada sistem, ` +
        `meliputi perkembangan Iqra, Al-Qur'an, hafalan, dan kehadiran. ` +
        `${kehadiranText}`;

      autoTable(doc, {
        startY: currentY,

        margin: {
          left: marginLeft,
          right: marginRight,
        },

        theme: "grid",

        body: [[kesimpulan]],

        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 4,
          valign: "top",
          overflow: "linebreak",
        },
      });

      currentY = doc.lastAutoTable.finalY + 18;

      // ========================================================
      // TANDA TANGAN
      // ========================================================

      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 25;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(
        `Ternate, ${new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`,
        pageWidth - marginRight,
        currentY,
        {
          align: "right",
        },
      );

      currentY += 7;

      const leftSignatureX = 55;
      const rightSignatureX = pageWidth - 55;

      doc.text("Guru/Pembimbing", leftSignatureX, currentY, {
        align: "center",
      });

      doc.text("Pengelola TPQ", rightSignatureX, currentY, {
        align: "center",
      });

      currentY += 25;

      doc.setFont("helvetica", "bold");

      doc.text("_____________________", leftSignatureX, currentY, {
        align: "center",
      });

      doc.text("_____________________", rightSignatureX, currentY, {
        align: "center",
      });

      currentY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text("Nama / NIG", leftSignatureX, currentY, {
        align: "center",
      });

      doc.text("Nama / NIG", rightSignatureX, currentY, {
        align: "center",
      });

      // ========================================================
      // FOOTER SEMUA HALAMAN
      // ========================================================

      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        drawFooter(doc, page, pageWidth, pageHeight, totalPages);
      }

      // ========================================================
      // NAMA FILE
      // ========================================================

      const safeNama = String(namaSantri)
        .replace(/[<>:"/\\|?*]+/g, "")
        .trim()
        .replace(/\s+/g, "-");

      const fileName = `raport-santri-${safeNama || nisSantri}-${bulan}-${tahun}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error("Gagal membuat PDF raport:", err);

      alert("Raport PDF gagal dibuat. Silakan cek Console browser.");
    } finally {
      setDownloading(false);
    }
  };

  // ============================================================
  // FOOTER PDF
  // ============================================================

  const drawFooter = (
    doc,
    pageNumber,
    pageWidth,
    pageHeight,
    totalPages = null,
  ) => {
    const footerText =
      `TPQ Khairunnissa Ternate • Raport Santri • ` +
      `Halaman ${pageNumber}` +
      (totalPages ? ` dari ${totalPages}` : "");

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.setTextColor(100, 100, 100);

    doc.text(footerText, pageWidth / 2, pageHeight - 7, {
      align: "center",
    });

    doc.setTextColor(0, 0, 0);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-5 p-3 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />

              <Skeleton className="h-3 w-64" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-11 w-full" />

            <Skeleton className="h-11 w-full" />

            <Skeleton className="h-11 w-full" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-5 w-48" />

          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between gap-4 border-b border-gray-100 pb-2"
              >
                <Skeleton className="h-4 w-28" />

                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <GraduationCap size={24} className="text-green-700" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Raport Santri
              </h1>

              <p className="text-sm text-gray-500">
                Perkembangan pembelajaran santri secara otomatis
              </p>
            </div>
          </div>

          {/* ====================================================
              PENCARIAN SANTRI + DOWNLOAD RAPORT
          ==================================================== */}

          <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
            {/* SEARCH SANTRI */}

            <div className="relative w-full sm:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama Santri
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchSantri}
                  onChange={(e) => setSearchSantri(e.target.value)}
                  placeholder="Cari nama santri..."
                  className={`${inputCls} pl-10`}
                />
              </div>

              {searchSantri.trim() !== "" && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {hasilPencarianSantri.length > 0 ? (
                    hasilPencarianSantri.map((item) => (
                      <button
                        type="button"
                        key={item.nis}
                        onClick={() => handlePilihSantri(item)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 border-b last:border-b-0 transition"
                      >
                        <div className="font-semibold text-gray-800">
                          {item.nama}
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5">
                          NIS {item.nis}
                          {item.kelas ? ` • Kelas ${item.kelas}` : ""}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">
                      Santri tidak ditemukan.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DOWNLOAD RAPORT */}

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!selectedSantri || downloading}
              className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition whitespace-nowrap"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Membuat Raport...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        {/* ====================================================
            FILTER RAPORT
        ==================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Santri
            </label>

            <select
              value={selectedNis}
              onChange={(e) => setSelectedNis(e.target.value)}
              className={inputCls}
            >
              {santri.map((item) => (
                <option key={item.nis} value={item.nis}>
                  {item.nama} — NIS {item.nis}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>

            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className={inputCls}
            >
              {namaBulan.map((nama, index) => (
                <option key={index + 1} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>

            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className={inputCls}
            >
              {[tahun - 1, tahun, tahun + 1].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================
          RAPORT
      ====================================================== */}

      {selectedSantri ? (
        <div className="space-y-5">
          {/* ==================================================
              IDENTITAS
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserRound size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">
                A. Biodata Santri
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Nama Santri</span>

                <span className="font-semibold text-right">
                  {value(selectedSantri.nama)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">NIS</span>

                <span className="font-semibold">
                  {value(selectedSantri.nis)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Kelas</span>

                <span className="font-semibold">
                  {value(selectedSantri.kelas)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Jenis Kelamin</span>

                <span className="font-semibold">
                  {selectedSantri.jenis_kelamin === "L"
                    ? "Laki-laki"
                    : selectedSantri.jenis_kelamin === "P"
                      ? "Perempuan"
                      : value(selectedSantri.jenis_kelamin)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Tanggal Lahir</span>

                <span className="font-semibold">
                  {value(selectedSantri.tanggal_lahir)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Usia</span>

                <span className="font-semibold">
                  {value(selectedSantri.usia)}
                </span>
              </div>

              <div className="md:col-span-2 flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Alamat</span>

                <span className="font-semibold text-right">
                  {value(selectedSantri.alamat)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Nama Ayah</span>

                <span className="font-semibold text-right">
                  {value(selectedSantri.orang_tua?.nama_ayah)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Nama Ibu</span>

                <span className="font-semibold text-right">
                  {value(selectedSantri.orang_tua?.nama_ibu)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Kontak Orang Tua</span>

                <span className="font-semibold">
                  {value(
                    selectedSantri.kontak || selectedSantri.orang_tua?.no_hp,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-gray-500">Status Santri</span>

                <span className="font-semibold">
                  {value(
                    selectedSantri.status_anak ||
                      selectedSantri.status_orangtua,
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* ==================================================
              PERIODE
          ================================================== */}

          <div className="bg-gray-400 text-white rounded-0xl p-5 flex items-center gap-3">
            <CalendarDays size={24} />

            <div>
              <p className="text-sm opacity-90">Periode Raport</p>

              <p className="font-extralight text-lg">
                {namaBulan[bulan - 1]} {tahun}
              </p>
            </div>
          </div>

          {/* ==================================================
              IQRA
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">
                B. Perkembangan Iqra
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left">Jilid</th>

                    <th className="border px-3 py-2 text-left">Halaman</th>

                    <th className="border px-3 py-2 text-left">Guru</th>

                    <th className="border px-3 py-2 text-left">NIG</th>

                    <th className="border px-3 py-2 text-left">Progres</th>

                    <th className="border px-3 py-2 text-left">Pencapaian</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border px-3 py-2">
                      {value(iqraData?.jilid)}
                    </td>

                    <td className="border px-3 py-2">{value(iqraData?.hal)}</td>

                    <td className="border px-3 py-2">
                      {value(iqraData?.guru)}
                    </td>

                    <td className="border px-3 py-2">{value(guruIqra?.nig)}</td>

                    <td className="border px-3 py-2">
                      {value(iqraData?.progres)}
                    </td>

                    <td className="border px-3 py-2">{pencapaianIqra}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================================================
              QURAN
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookMarked size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">
                C. Perkembangan Al-Qur'an
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left">Juz</th>

                    <th className="border px-3 py-2 text-left">Surah</th>

                    <th className="border px-3 py-2 text-left">Ayat</th>

                    <th className="border px-3 py-2 text-left">Halaman</th>

                    <th className="border px-3 py-2 text-left">Guru</th>

                    <th className="border px-3 py-2 text-left">NIG</th>

                    <th className="border px-3 py-2 text-left">Progres</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border px-3 py-2">
                      {value(quranData?.quran_juz)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(quranData?.quran_surah)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(quranData?.quran_ayat)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(quranData?.quran_hal)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(quranData?.quran_guru)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(guruQuran?.nig)}
                    </td>

                    <td className="border px-3 py-2">
                      {value(quranData?.quran_progres)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================================================
              HAFALAN
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">
                D. Perkembangan Hafalan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs text-gray-500">Total Materi</p>

                <p className="text-2xl font-bold text-green-700">
                  {rekapHafalan.total}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-gray-500">Lancar</p>

                <p className="text-2xl font-bold text-blue-700">
                  {rekapHafalan.lancar}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs text-gray-500">Perlu Diulang</p>

                <p className="text-2xl font-bold text-orange-700">
                  {rekapHafalan.belum}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-center">No</th>

                    <th className="border px-3 py-2 text-left">
                      Materi Hafalan
                    </th>

                    <th className="border px-3 py-2 text-left">Guru</th>

                    <th className="border px-3 py-2 text-left">Progres</th>

                    <th className="border px-3 py-2 text-left">Pencapaian</th>

                    <th className="border px-3 py-2 text-left">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {hafalanData.length > 0 ? (
                    hafalanData.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-3 py-2 text-center">
                          {index + 1}
                        </td>

                        <td className="border px-3 py-2">
                          {value(item?.jenis)}
                        </td>

                        <td className="border px-3 py-2">
                          {value(item?.guru)}
                        </td>

                        <td className="border px-3 py-2">
                          {value(item?.progres)}
                        </td>

                        <td className="border px-3 py-2">
                          {String(item?.progres || "").toLowerCase() ===
                          "lancar"
                            ? "Di-Lanjut"
                            : String(item?.progres || "").toLowerCase() ===
                                "belum"
                              ? "Di-Ulang"
                              : "-"}
                        </td>

                        <td className="border px-3 py-2">
                          {value(item?.update)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="border px-3 py-6 text-center text-gray-500"
                      >
                        Belum ada data hafalan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-6 text-justify">
              Total materi adalah jumlah doa yang sedang dipelajari dari total{" "}
              <strong>{jumlahJenisHafalan} kurikulum/jenis hafalan</strong> pada TPQ Khairunnissa.
            </p>
          </section>

          {/* ==================================================
              KEHADIRAN
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">E. Kehadiran</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Hadir", rekapKehadiran.hadir],
                ["Izin", rekapKehadiran.izin],
                ["Sakit", rekapKehadiran.sakit],
                ["Alpa", rekapKehadiran.alpa],
              ].map(([label, jumlah]) => (
                <div key={label} className="border rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">{label}</p>

                  <p className="text-2xl font-bold text-gray-700 mt-1">
                    {jumlah}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Rekap kehadiran periode {namaBulan[bulan - 1]} {tahun}.
            </p>
          </section>

          {/* ==================================================
              PRESTASI
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">
                F. Prestasi / Pencapaian Bulanan
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              {pencapaianBulanan.map((item, index) => (
                <div key={index} className="border rounded-xl p-4">
                  {item}
                </div>
              ))}

              <div className="border rounded-xl p-4">
                <span className="font-semibold">Kehadiran:</span>{" "}
                {kehadiranText}
              </div>
            </div>
          </section>

          {/* ==================================================
              CATATAN GURU
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-green-700" />

              <h2 className="font-extralight text-gray-800">G. Catatan Guru</h2>
            </div>

            <textarea
              value={catatanGuru}
              onChange={(e) => handleCatatanGuru(e.target.value)}
              placeholder="Tuliskan catatan atau perkembangan santri pada periode ini..."
              rows={5}
              className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />

            <p className="text-xs text-gray-400 mt-2">
              Catatan disimpan otomatis berdasarkan santri, bulan, dan tahun
              raport.
            </p>
          </section>

          {/* ==================================================
              KESIMPULAN
          ================================================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-extralight text-gray-800 mb-3">
              H. Kesimpulan
            </h2>

            <p className="text-sm text-gray-600 leading-7 text-justify">
              Perkembangan santri pada periode{" "}
              <strong>
                {namaBulan[bulan - 1]} {tahun}
              </strong>{" "}
              ditampilkan berdasarkan data pembelajaran yang tersedia pada
              sistem, meliputi perkembangan Iqra, Al-Qur'an, hafalan, dan
              kehadiran. {kehadiranText}
            </p>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
          Silakan pilih santri.
        </div>
      )}
    </div>
  );
}

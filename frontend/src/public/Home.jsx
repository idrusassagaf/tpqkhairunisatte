import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../api";

import heroImage from "../assets/hero-putih04.jpg";
import logoTPQ from "../assets/logo-tpq.png";

import {
  Users,
  BookOpen,
  BookMarked,
  GraduationCap,
  Download,
  FileText,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  const { language } = useOutletContext();
  const homeText = {
    id: {
      ahlan: "Ahlan wa sahlan",
      tagline: "Membentuk Generasi Qurani Berakhlak",
      register: "Pendaftaran Santri",
      contact: "Hubungi Kami",

      students: "Santri",
      iqraStudents: "Santri Iqra",
      quranStudents: "Santri Qur'an",
      teachers: "Guru",

      programTitle: "Program Belajar",
      programDescription: "Program unggulan",
      iqraProgram: "Program Iqra",
      quranProgram: "Program Al-Qur'an",
      tahfidzProgram: "Program Tahfidz",

      whyChoose: "Mengapa Memilih",
      whyChooseDescription:
        "Pendidikan Islami dengan pembelajaran gratis yang terarah dan menyenangkan",
      learningIqra: "Belajar Iqra & Al-Qur'an",
      worshipPractice: "Praktik Ibadah",
      characterDevelopment: "Pembinaan Akhlak",
      experiencedTeachers: "Guru Berpengalaman",

      registrationTitle: "Persyaratan Pendaftaran",
      registrationDescription:
        "Persiapkan dokumen berikut saat melakukan pendaftaran santri baru",
      freeRegistration: "Pendaftaran Gratis",
      registrationForm: "Mengisi Form Pendaftaran",
      familyCard: "Fotocopy Kartu Keluarga",
      parentIdCard: "Fotocopy KTP Orang Tua",
    },

    en: {
      ahlan: "Welcome",
      tagline: "Forming a Qur'anic Generation with Good Character",
      register: "Student Registration",
      contact: "Contact Us",

      students: "Students",
      iqraStudents: "Iqra Students",
      quranStudents: "Qur'an Students",
      teachers: "Teachers",

      programTitle: "Learning Programs",
      programDescription: "Featured programs of",
      iqraProgram: "Iqra Program",
      quranProgram: "Qur'an Program",
      tahfidzProgram: "Tahfidz Program",

      whyChoose: "Why Choose",
      whyChooseDescription:
        "Islamic education with free, structured, and enjoyable learning",
      learningIqra: "Learning Iqra & Qur'an",
      worshipPractice: "Worship Practice",
      characterDevelopment: "Character Development",
      experiencedTeachers: "Experienced Teachers",

      registrationTitle: "Registration Requirements",
      registrationDescription:
        "Prepare the following documents when registering a new student",
      freeRegistration: "Free Registration",
      registrationForm: "Complete the Registration Form",
      familyCard: "Copy of Family Card",
      parentIdCard: "Copy of Parent's ID Card",
    },

    ar: {
      ahlan: "أهلاً وسهلاً",
      tagline: "تكوين جيل قرآني حسن الأخلاق",
      register: "تسجيل الطلاب",
      contact: "اتصل بنا",

      students: "الطلاب",
      iqraStudents: "طلاب الإقراء",
      quranStudents: "طلاب القرآن",
      teachers: "المعلمون",

      programTitle: "برامج التعلم",
      programDescription: "البرامج المتميزة في",
      iqraProgram: "برنامج الإقراء",
      quranProgram: "برنامج القرآن الكريم",
      tahfidzProgram: "برنامج التحفيظ",

      whyChoose: "لماذا تختار",
      whyChooseDescription: "تعليم إسلامي بتعلّم مجاني ومنظم وممتع",
      learningIqra: "تعلم الإقراء والقرآن الكريم",
      worshipPractice: "تطبيق العبادات",
      characterDevelopment: "بناء الأخلاق",
      experiencedTeachers: "معلمون ذوو خبرة",

      registrationTitle: "متطلبات التسجيل",
      registrationDescription:
        "يرجى تجهيز المستندات التالية عند تسجيل طالب جديد",
      freeRegistration: "التسجيل مجاني",
      registrationForm: "تعبئة استمارة التسجيل",
      familyCard: "نسخة من بطاقة العائلة",
      parentIdCard: "نسخة من بطاقة هوية الوالدين",
    },
  };

  const t = homeText[language] || homeText.id;

  const programNarrative = {
    iqra: {
      en: "Basic learning to read Hijaiyah letters using the Iqra method progressively, starting from letter recognition and harakat, until students are able to read fluently and correctly.",
      ar: "تعليم أساسي لقراءة الحروف الهجائية باستخدام طريقة الإقراء بشكل تدريجي، بدءًا من التعرف على الحروف والحركات، حتى يتمكن الطلاب من القراءة بطلاقة وصحة.",
    },

    quran: {
      en: "Learning to read the Qur'an with attention to the rules of Tajwid and the correct pronunciation of Makharijul Huruf, enabling students to read the Qur'an fluently and with proper Tartil.",
      ar: "تعليم قراءة القرآن الكريم مع مراعاة أحكام التجويد ومخارج الحروف الصحيحة، حتى يتمكن الطلاب من قراءة القرآن الكريم بفصاحة وترتيل.",
    },

    tahfidz: {
      en: "A memorization program covering short surahs, daily prayers, and gradual Qur'an memorization development according to each student's ability.",
      ar: "برنامج لحفظ السور القصيرة والأدعية اليومية، بالإضافة إلى تنمية حفظ القرآن الكريم تدريجيًا وفقًا لقدرات كل طالب.",
    },
  };

  const keunggulanNarrative = {
    iqraQuran: {
      en: "Students are guided progressively from learning to read Iqra to the Qur'an, with attention to the correct rules of Tajwid and Makharijul Huruf.",
      ar: "يتم توجيه الطلاب تدريجيًا بدءًا من قراءة الإقراء حتى قراءة القرآن الكريم، مع مراعاة أحكام التجويد ومخارج الحروف الصحيحة.",
    },

    ibadah: {
      en: "Learning is not limited to theory, but also includes practical worship such as prayer, daily supplications, ablution, and developing Islamic manners in everyday life.",
      ar: "لا يقتصر التعليم على الجانب النظري، بل يشمل أيضًا تطبيق العبادات مثل الصلاة والأدعية اليومية والوضوء، بالإضافة إلى تعويد الطلاب على الآداب الإسلامية في الحياة اليومية.",
    },

    akhlak: {
      en: "Character development is an important part of the learning process, helping students grow into respectful, disciplined, responsible individuals with good Islamic character.",
      ar: "يُعد بناء الشخصية جزءًا مهمًا من عملية التعلم، حيث يُرجى أن ينشأ الطلاب بأخلاق حسنة، وأن يكونوا مهذبين ومنضبطين ومسؤولين وذوي أخلاق إسلامية كريمة.",
    },

    guru: {
      en: "The learning process is guided by experienced male and female Islamic teachers who are committed to educating and guiding the Qur'anic generation.",
      ar: "تتم عملية التعلم بإشراف معلمين ومعلمات ذوي خبرة، ملتزمين بتعليم وتوجيه الجيل القرآني.",
    },
  };

  // TAMBAHKAN DI SINI
  const syaratNarrative = {
    gratis: {
      en: "Registration is free of charge, and there are no fees throughout the student's learning period at TPQ.",
      ar: "التسجيل مجاني ولا تُفرض أي رسوم طوال فترة تعلم الطالب في المركز.",
    },

    form: {
      en: "The registration form is completed by the TPQ Admin based on the information provided by the student's parent or guardian.",
      ar: "يتم تعبئة استمارة التسجيل من قبل مسؤول الإدارة في المركز بناءً على البيانات التي يقدمها والد الطالب أو ولي أمره.",
    },

    kk: {
      en: "Bring a photocopy of the Family Card as supporting documentation for the registration administration.",
      ar: "إحضار نسخة من بطاقة العائلة كوثيقة داعمة لإجراءات التسجيل الإداري.",
    },

    ktp: {
      en: "Bring a photocopy of the parent's or student's guardian's ID card as supporting documentation for the registration administration.",
      ar: "إحضار نسخة من بطاقة هوية والد الطالب أو ولي أمره كوثيقة داعمة لإجراءات التسجيل الإداري.",
    },
  };

  const [santriStats, setSantriStats] = useState({
    total: 0,
    total_iqra: 0,
    total_quran: 0,
  });

  const [guru, setGuru] = useState([]);

  // =========================================================
  // PENGATURAN SISTEM
  // =========================================================

  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);

  // =========================================================
  // LOAD SEMUA DATA
  // =========================================================

  useEffect(() => {
    loadSantri();
    loadGuru();
    loadPengaturan();
  }, []);

  // =========================================================
  // LOAD DATA SANTRI
  // =========================================================

  const loadSantri = async () => {
    try {
      const res = await api.get("/santri/stats");

      setSantriStats(
        res.data.data || { total: 0, total_iqra: 0, total_quran: 0 },
      );
    } catch (err) {
      console.error("Gagal mengambil data santri:", err);
    }
  };

  // =========================================================
  // LOAD DATA GURU
  // =========================================================

  const loadGuru = async () => {
    try {
      const res = await api.get("/master-data");

      setGuru(res.data.data.guru || []);
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
    }
  };

  // =========================================================
  // LOAD PENGATURAN SISTEM
  // =========================================================

  const loadPengaturan = async () => {
    try {
      setLoadingPengaturan(true);

      const res = await api.get("/pengaturan-sistem");

      setPengaturan(res.data.data || null);
    } catch (err) {
      console.error("Gagal mengambil pengaturan sistem:", err);
      setPengaturan(null);
    } finally {
      setLoadingPengaturan(false);
    }
  };

  // =========================================================
  // JANGAN TAMPILKAN DATA LAMA / HARDCODE
  // SEBELUM DATA PENGATURAN SELESAI DIMUAT
  // =========================================================

  if (loadingPengaturan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6faf7]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-gray-500 text-sm">Memuat Home TPQ...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // JIKA DATA PENGATURAN GAGAL DIMUAT
  // =========================================================

  if (!pengaturan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6faf7] px-6">
        <div className="bg-white rounded-3xl shadow-md p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800">
            Informasi TPQ belum dapat dimuat
          </h2>

          <p className="text-gray-500 text-sm mt-3">
            Silakan refresh halaman atau coba beberapa saat lagi.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-sm"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // STATISTIK
  // =========================================================

  const totalSantri = santriStats.total;

  const totalIqra = santriStats.total_iqra;

  const totalQuran = santriStats.total_quran;

  const totalGuru = guru.length;

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    try {
      // =====================================================
      // TANGGAL REALTIME
      // =====================================================

      const sekarang = new Date();

      const tanggalUpdate = sekarang.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // =====================================================
      // DATA DINAMIS
      // =====================================================

      const namaTPQ = pengaturan.nama_tpq || "TPQ Khairunissa";

      const profil = pengaturan.profil || "";

      const visi = pengaturan.visi || "";

      const misi = pengaturan.misi || "";

      // =====================================================
      // BUAT PDF A4 PORTRAIT
      // =====================================================

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // =====================================================
      // HEADER SETIAP HALAMAN
      // =====================================================

      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);

        doc.text(String(namaTPQ).toUpperCase(), centerX, 15, {
          align: "center",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text("Membentuk Generasi Qurani Berakhlak", centerX, 21, {
          align: "center",
        });

        doc.setDrawColor(180, 180, 180);

        doc.line(20, 25, pageWidth - 20, 25);
      };

      // =====================================================
      // FOOTER REALTIME
      // =====================================================

      const drawFooter = () => {
        const nomorHalaman = doc.internal.getNumberOfPages();

        doc.setFont("helvetica", "normal");

        doc.setFontSize(7);

        doc.setTextColor(100, 100, 100);

        doc.text(
          `${namaTPQ} • Laporan Profil • Update ${tanggalUpdate} • Halaman ${nomorHalaman}`,
          centerX,
          pageHeight - 7,
          {
            align: "center",
          },
        );

        doc.setTextColor(0, 0, 0);
      };

      // =====================================================
      // HALAMAN 1
      // PROFIL + LOGO + STATISTIK
      // =====================================================

      drawHeader();

      // =====================================================
      // AHLAN WA SAHLAN
      // =====================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text(`Ahlan wa sahlan di ${namaTPQ}`, centerX, 37, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("Membentuk Generasi Qurani Berakhlak", centerX, 44, {
        align: "center",
      });

      // =====================================================
      // LOGO TPQ
      // =====================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text(`Logo ${namaTPQ}`, centerX, 54, {
        align: "center",
      });

      try {
        doc.addImage(logoTPQ, "PNG", centerX - 20, 59, 40, 40);
      } catch (logoError) {
        console.error("Logo gagal dimasukkan ke PDF:", logoError);
      }

      // =====================================================
      // PROFIL
      // =====================================================

      let profilY = 105;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("PROFIL TPQ", centerX, profilY, {
        align: "center",
      });

      profilY += 7;

      if (profil) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const profilLines = doc.splitTextToSize(String(profil), 165);

        doc.text(profilLines, 22, profilY);

        profilY += profilLines.length * 4.5 + 8;
      }

      // =====================================================
      // VISI
      // =====================================================

      if (visi) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text("VISI", 22, profilY);

        profilY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const visiLines = doc.splitTextToSize(String(visi), 165);

        doc.text(visiLines, 22, profilY);

        profilY += visiLines.length * 4.5 + 6;
      }

      // =====================================================
      // MISI
      // =====================================================

      if (misi) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        doc.text("MISI", 22, profilY);

        profilY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const misiLines = doc.splitTextToSize(String(misi), 165);

        doc.text(misiLines, 22, profilY);

        profilY += misiLines.length * 4.5 + 8;
      }

      // =====================================================
      // LAPORAN STATISTIK
      // =====================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text("LAPORAN STATISTIK", centerX, profilY, {
        align: "center",
      });

      profilY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(`Data statistik ${namaTPQ}`, centerX, profilY, {
        align: "center",
      });

      profilY += 8;

      // =====================================================
      // TABEL STATISTIK
      // =====================================================

      autoTable(doc, {
        startY: profilY,

        head: [["No", "Kategori", "Jumlah"]],

        body: [
          ["1", "Jumlah Santri", totalSantri],

          ["2", "Santri Iqra", totalIqra],

          ["3", "Santri Al-Qur'an", totalQuran],

          ["4", "Jumlah Guru", totalGuru],
        ],

        theme: "grid",

        tableWidth: 150,

        margin: {
          left: (pageWidth - 150) / 2,
          right: (pageWidth - 150) / 2,
        },

        styles: {
          fontSize: 9,
          cellPadding: 4,
          valign: "middle",
          halign: "center",
        },

        headStyles: {
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 20,
            halign: "center",
          },

          1: {
            cellWidth: 95,
            halign: "left",
          },

          2: {
            cellWidth: 35,
            halign: "center",
          },
        },
      });

      // =====================================================
      // RINGKASAN
      // =====================================================

      let statistikY = doc.lastAutoTable.finalY + 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("Ringkasan", 30, statistikY);

      statistikY += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const ringkasan = [
        `Jumlah seluruh santri: ${totalSantri} orang.`,
        `Santri yang mengikuti program Iqra: ${totalIqra} orang.`,
        `Santri yang mengikuti program Al-Qur'an: ${totalQuran} orang.`,
        `Jumlah guru/ustadz dan ustadzah: ${totalGuru} orang.`,
      ];

      ringkasan.forEach((text) => {
        doc.text(`• ${text}`, 35, statistikY);

        statistikY += 6;
      });

      drawFooter();

      // =====================================================
      // HALAMAN 2
      // PROGRAM + KEUNGGULAN
      // =====================================================

      doc.addPage();

      drawHeader();

      // =====================================================
      // PROGRAM PEMBELAJARAN
      // =====================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text("PROGRAM PEMBELAJARAN", centerX, 36, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      doc.text(
        `Program unggulan ${namaTPQ} dalam membentuk Generasi Qurani`,
        centerX,
        42,
        {
          align: "center",
        },
      );

      autoTable(doc, {
        startY: 49,

        head: [["No", "Program", "Keterangan"]],

        body: [
          ["1", "Program Iqra", pengaturan.program_iqra || ""],

          ["2", "Program Al-Qur'an", pengaturan.program_quran || ""],

          ["3", "Program Tahfidz", pengaturan.program_tahfidz || ""],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "top",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 40,
            halign: "left",
          },

          2: {
            cellWidth: 115,
            halign: "justify",
          },
        },
      });

      // =====================================================
      // KEUNGGULAN
      // =====================================================

      let keunggulanY = doc.lastAutoTable.finalY + 14;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text(
        `KEUNGGULAN ${String(namaTPQ).toUpperCase()}`,
        centerX,
        keunggulanY,
        {
          align: "center",
        },
      );

      keunggulanY += 7;

      autoTable(doc, {
        startY: keunggulanY,

        head: [["No", "Keunggulan", "Keterangan"]],

        body: [
          [
            "1",
            "Belajar Iqra & Al-Qur'an",
            pengaturan.keunggulan_iqra_quran || "",
          ],

          ["2", "Praktik Ibadah", pengaturan.keunggulan_ibadah || ""],

          ["3", "Pembinaan Akhlak", pengaturan.keunggulan_akhlak || ""],

          ["4", "Guru Berpengalaman", pengaturan.keunggulan_guru || ""],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          valign: "top",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 45,
            halign: "left",
          },

          2: {
            cellWidth: 110,
            halign: "justify",
          },
        },
      });

      drawFooter();

      // =====================================================
      // HALAMAN 3
      // PERSYARATAN PENDAFTARAN
      // =====================================================

      doc.addPage();

      drawHeader();

      // =====================================================
      // JUDUL
      // =====================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      doc.text("PERSYARATAN PENDAFTARAN SANTRI", centerX, 37, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      doc.text(
        "Persiapkan dokumen berikut saat melakukan pendaftaran santri baru",
        centerX,
        44,
        {
          align: "center",
        },
      );

      // =====================================================
      // TABEL PERSYARATAN
      // =====================================================

      autoTable(doc, {
        startY: 51,

        head: [["No", "Persyaratan", "Keterangan"]],

        body: [
          ["1", "Pendaftaran Gratis", pengaturan.syarat_gratis || ""],

          ["2", "Mengisi Form Pendaftaran", pengaturan.syarat_form || ""],

          ["3", "Fotocopy Kartu Keluarga", pengaturan.syarat_kk || ""],

          ["4", "Fotocopy KTP Orang Tua", pengaturan.syarat_ktp || ""],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          fontSize: 9,
          cellPadding: 4,
          valign: "middle",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 60,
            halign: "left",
          },

          2: {
            cellWidth: 95,
            halign: "justify",
          },
        },
      });

      // =====================================================
      // CATATAN
      // =====================================================

      let catatanY = doc.lastAutoTable.finalY + 15;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.text("Catatan", 25, catatanY);

      catatanY += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      doc.text(
        `Dokumen persyaratan digunakan sebagai data pendukung administrasi pendaftaran santri di ${namaTPQ}.`,
        25,
        catatanY,
      );

      catatanY += 6;

      doc.text(
        `Untuk informasi lebih lanjut, silakan menghubungi ${namaTPQ}.`,
        25,
        catatanY,
      );

      drawFooter();

      // =====================================================
      // NAMA FILE
      // =====================================================

      const namaFile = `profil-${String(namaTPQ)
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")}-${sekarang.getFullYear()}-${String(
        sekarang.getMonth() + 1,
      ).padStart(2, "0")}-${String(sekarang.getDate()).padStart(2, "0")}.pdf`;

      doc.save(namaFile);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="relative min-h-screen flex items-center text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:py-40 w-full min-h-screen flex flex-col justify-center -translate-y-4 md:translate-y-0">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[3px] text-xs md:text-base text-gray-800 mb-4">
              {t.ahlan}
            </p>

            <h1 className="text-4xl md:text-5xl font-extralight leading-tight">
              {pengaturan.nama_tpq}
            </h1>

            <p className="mt-4 text-lg md:text-2xl font-extralight text-green-700">
              {t.tagline}
            </p>

            <div className="flex flex-wrap gap-4 mt-12 md:mt-28 justify-center md:justify-start">
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 px-5 md:px-8 py-3 md:py-4 rounded-xl font-extralight inline-flex items-center"
              >
                {t.register}
              </Link>

              <Link
                to="/kontak"
                className="bg-green-600 hover:bg-green-700 px-5 md:px-8 py-3 md:py-4 rounded-xl font-extralight inline-flex items-center"
              >
                {t.contact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTIK
      ===================================================== */}

      <section className="py-14 bg-[#f6faf7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* SANTRI */}

            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <Users
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalSantri}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-xs md:text-base text-gray-600 font-medium">
                {t.students}
              </p>
            </div>

            {/* IQRA */}

            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <BookOpen
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalIqra}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-xs md:text-base text-gray-600 font-medium">
                {t.iqraStudents}
              </p>
            </div>

            {/* QURAN */}

            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <BookMarked
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalQuran}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-xs md:text-base text-gray-600 font-medium">
                {t.quranStudents}
              </p>
            </div>

            {/* GURU */}

            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <GraduationCap
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalGuru}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-xs md:text-base text-gray-600 font-medium">
                {t.teachers}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROGRAM
      ===================================================== */}

      <section className="bg-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extralight text-gray-800">
              {t.programTitle}
            </h2>

            <p className="text-green-600 text-sm mt-3">
              {t.programDescription} {pengaturan.nama_tpq}{" "}
              {language === "id"
                ? "dalam membentuk Generasi Qurani"
                : language === "en"
                  ? "in nurturing a Qur'anic generation"
                  : "لتكوين جيل قرآني"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* IQRA */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                {t.iqraProgram}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.program_iqra
                  : programNarrative.iqra[language]}
              </p>
            </div>

            {/* AL-QURAN */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                {t.quranProgram}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.program_quran
                  : programNarrative.quran[language]}
              </p>
            </div>

            {/* TAHFIDZ */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                {t.tahfidzProgram}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.program_tahfidz
                  : programNarrative.tahfidz[language]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          KEUNGGULAN
      ===================================================== */}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extralight text-gray-800">
              {t.whyChoose} {pengaturan.nama_tpq}?
            </h2>

            <p className="text-green-600 mt-1">{t.whyChooseDescription}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* CARD 1 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                {t.learningIqra}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.keunggulan_iqra_quran
                  : keunggulanNarrative.iqraQuran[language]}
              </p>
            </div>

            {/* CARD 2 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                {t.worshipPractice}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.keunggulan_ibadah
                  : keunggulanNarrative.ibadah[language]}
              </p>
            </div>

            {/* CARD 3 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                {t.characterDevelopment}
              </h3>

              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.keunggulan_akhlak
                  : keunggulanNarrative.akhlak[language]}
              </p>
            </div>

            {/* CARD 4 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                {t.experiencedTeachers}
              </h3>
              <p
                className="text-gray-600 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.keunggulan_guru
                  : keunggulanNarrative.guru[language]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
    PERSYARATAN PENDAFTARAN
===================================================== */}

      <section className="py-16 bg-[#f6faf7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extralight text-gray-800">
              {t.registrationTitle}
            </h2>

            <p className="text-green-600 mt-3">{t.registrationDescription}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD 1 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                {t.freeRegistration}
              </h3>

              <p
                className="text-gray-600 mt-3 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.syarat_gratis
                  : language === "en"
                    ? syaratNarrative.gratis.en
                    : syaratNarrative.gratis.ar}
              </p>
            </div>

            {/* CARD 2 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                {t.registrationForm}
              </h3>

              <p
                className="text-gray-600 mt-3 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.syarat_form
                  : language === "en"
                    ? syaratNarrative.form.en
                    : syaratNarrative.form.ar}
              </p>
            </div>

            {/* CARD 3 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                {t.familyCard}
              </h3>

              <p
                className="text-gray-600 mt-3 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.syarat_kk
                  : language === "en"
                    ? syaratNarrative.kk.en
                    : syaratNarrative.kk.ar}
              </p>
            </div>

            {/* CARD 4 */}

            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                {t.parentIdCard}
              </h3>
              <p
                className="text-gray-600 mt-3 text-justify leading-4 md:leading-6"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                {language === "id"
                  ? pengaturan.syarat_ktp
                  : language === "en"
                    ? syaratNarrative.ktp.en
                    : syaratNarrative.ktp.ar}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DOWNLOAD PDF
      ===================================================== */}

      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={downloadPDF}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-blue-600
                text-white
                text-sm
                font-medium
                shadow-md
                hover:bg-blue-700
                hover:shadow-lg
                transition-all
                duration-300
              "
            >
              <Download size={18} />

              <span>Download PDF</span>

              <FileText size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

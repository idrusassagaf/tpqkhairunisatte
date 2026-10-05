import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";

import heroImage from "../../assets/hero-putih04.jpg";
import logoTPQ from "../../assets/logo-tpq.png";

import {
  Users,
  BookOpen,
  BookMarked,
  GraduationCap,
  Download,
  FileText,
  ArrowRight,
  Heart,
  Sparkles,
  Award,
  CheckCircle2,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dejaVuSansRegular from "../../assets/DejaVuSans.ttf";
import dejaVuSansBold from "../../assets/DejaVuSans-Bold.ttf";

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
  const [loadingSantri, setLoadingSantri] = useState(true);
  const [loadingGuru, setLoadingGuru] = useState(true);

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
    } finally {
      setLoadingSantri(false);
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
    } finally {
      setLoadingGuru(false);
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
      <div className="bg-[#f6faf7] min-h-screen">
        <div className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-green-900/80" />

          <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-6 pb-40 pt-28">
            <Skeleton className="h-6 w-40 rounded-full bg-white/20" />

            <Skeleton className="mt-6 h-12 w-3/4 max-w-xl bg-white/20" />

            <Skeleton className="mt-4 h-6 w-1/2 max-w-md bg-white/20" />

            <div className="mt-10 flex gap-3">
              <Skeleton className="h-12 w-40 rounded-xl bg-white/30" />

              <Skeleton className="h-12 w-32 rounded-xl bg-white/20" />
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-24 px-6 md:-mt-28">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-white bg-white p-5 shadow-xl">
                <Skeleton className="mx-auto h-12 w-12 rounded-2xl" />

                <Skeleton className="mx-auto mt-4 h-8 w-16" />

                <Skeleton className="mx-auto mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-6 px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <Skeleton className="h-12 w-12 rounded-2xl" />

                <Skeleton className="mt-5 h-5 w-1/2" />

                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-full" />

                  <Skeleton className="h-3 w-11/12" />

                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
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

  const downloadPDF = async () => {
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

      const namaTPQ = pengaturan.nama_tpq || "TPQ Hairunissa";

      // =====================================================
      // PROFIL/VISI/MISI SESUAI BAHASA YANG DIPILIH
      //
      // Sudah diterjemahkan & disimpan backend saat admin
      // menyimpan Pengaturan Sistem -- tinggal dibaca, tanpa
      // panggilan AI di sini.
      // =====================================================

      const profilTranslated = pengaturan.translations?.[language];

      const profil =
        (language !== "id" && profilTranslated?.profil) ||
        pengaturan.profil ||
        "";

      const visi =
        (language !== "id" && profilTranslated?.visi) ||
        pengaturan.visi ||
        "";

      const misi =
        (language !== "id" && profilTranslated?.misi) ||
        pengaturan.misi ||
        "";

      // =====================================================
      // PILIH TEKS SESUAI BAHASA
      //
      // Urutan: terjemahan asli dari backend (translations,
      // hasil translate teks Admin) -> narasi generik hardcode
      // (fallback) -> teks Indonesia asli.
      // =====================================================

      const pilihBahasa = (teksId, translationKey, narrative) => {
        if (language === "id") return teksId || "";

        const dariBackend = profilTranslated?.[translationKey];

        if (dariBackend) return dariBackend;

        if (language === "en") return narrative?.en || teksId || "";

        return narrative?.ar || teksId || "";
      };

      // =====================================================
      // BUAT PDF A4 PORTRAIT
      // =====================================================

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // =====================================================
      // FONT ARABIC
      //
      // Font bawaan jsPDF (helvetica) tidak punya huruf Arab --
      // teks Arab akan tampil berantakan tanpa font Unicode ini.
      //
      // Pakai DejaVu Sans (bukan NotoNaskhArabic) karena DejaVu
      // Sans punya glyph Arab MAUPUN Latin dalam satu font. Ini
      // penting karena banyak label di PDF ini masih Latin (nama
      // TPQ, label kolom tabel, dll) -- kalau pakai font yang cuma
      // punya huruf Arab, semua teks Latin itu hilang total (tidak
      // tampil sama sekali, bukan cuma kotak-kotak).
      // =====================================================

      const muatFontTtf = async (url, filename, style) => {
        const fontResponse = await fetch(url);

        if (!fontResponse.ok) {
          throw new Error(`Font gagal dimuat (${style}): HTTP ${fontResponse.status}`);
        }

        const fontArrayBuffer = await fontResponse.arrayBuffer();

        const fontBytes = new Uint8Array(fontArrayBuffer);

        let binary = "";

        const chunkSize = 0x8000;

        for (let i = 0; i < fontBytes.length; i += chunkSize) {
          const chunk = fontBytes.subarray(
            i,
            Math.min(i + chunkSize, fontBytes.length),
          );

          binary += String.fromCharCode(...chunk);
        }

        const fontBase64 = btoa(binary);

        doc.addFileToVFS(filename, fontBase64);
        doc.addFont(filename, "DejaVuSans", style);
      };

      if (language === "ar") {
        try {
          await muatFontTtf(dejaVuSansRegular, "DejaVuSans.ttf", "normal");
          await muatFontTtf(dejaVuSansBold, "DejaVuSans-Bold.ttf", "bold");
        } catch (fontError) {
          console.error("Font Arabic gagal dimuat untuk PDF Profil:", fontError);
        }
      }

      // Dipakai di styles/headStyles autoTable supaya tabel juga
      // pakai font Arab+Latin (bukan cuma pemanggilan doc.text()
      // manual).
      const fontStylesTabel =
        language === "ar" ? { font: "DejaVuSans" } : {};

      // Ganti "doc.setFont('helvetica', style)" dengan ini supaya
      // otomatis pakai DejaVu Sans (Arab+Latin) saat bahasa Arab.
      const aturFont = (style = "normal") => {
        if (language === "ar") {
          doc.setFont("DejaVuSans", style);
        } else {
          doc.setFont("helvetica", style);
        }
      };

      const pageWidth = doc.internal.pageSize.getWidth();

      const pageHeight = doc.internal.pageSize.getHeight();

      const centerX = pageWidth / 2;

      // =====================================================
      // POSISI TEKS UNTUK RTL (ARAB)
      //
      // Teks Latin/Indonesia rata kiri dari margin kiri (x).
      // Teks Arab dicerminkan: rata kanan dari margin yang sama,
      // diukur dari tepi kanan halaman.
      // =====================================================

      const posisiX = (xKiri) =>
        language === "ar" ? pageWidth - xKiri : xKiri;

      const opsiAlign = language === "ar" ? { align: "right" } : {};

      // =====================================================
      // HEADER SETIAP HALAMAN
      // =====================================================

      const drawHeader = () => {
        aturFont("bold");
        doc.setFontSize(16);

        doc.text(String(namaTPQ).toUpperCase(), centerX, 15, {
          align: "center",
        });

        aturFont("normal");
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

        aturFont("normal");

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
      // PASTIKAN RUANG CUKUP SEBELUM MENULIS BLOK BARU
      //
      // Dipakai untuk konten yang ditulis manual lewat doc.text()
      // (bukan autoTable, yang sudah bisa paginasi sendiri).
      // Kalau sisa ruang di halaman tidak cukup, tutup halaman
      // berjalan dengan footer, lalu mulai halaman baru.
      // =====================================================

      const ensureSpace = (currentY, neededHeight) => {
        if (currentY + neededHeight > pageHeight - 20) {
          drawFooter();
          doc.addPage();
          drawHeader();

          return 36;
        }

        return currentY;
      };

      // =====================================================
      // HALAMAN 1
      // PROFIL + LOGO + STATISTIK
      // =====================================================

      drawHeader();

      // =====================================================
      // AHLAN WA SAHLAN
      // =====================================================

      aturFont("bold");
      doc.setFontSize(13);

      doc.text(`Ahlan wa sahlan di ${namaTPQ}`, centerX, 37, {
        align: "center",
      });

      aturFont("normal");
      doc.setFontSize(9);

      doc.text("Membentuk Generasi Qurani Berakhlak", centerX, 44, {
        align: "center",
      });

      // =====================================================
      // LOGO TPQ
      // =====================================================

      aturFont("bold");
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

      aturFont("bold");
      doc.setFontSize(12);

      doc.text("PROFIL TPQ", centerX, profilY, {
        align: "center",
      });

      profilY += 7;

      if (profil) {
        aturFont("normal");
        doc.setFontSize(8.5);

        const profilLines = doc.splitTextToSize(String(profil), 165);

        doc.text(profilLines, posisiX(22), profilY, opsiAlign);

        profilY += profilLines.length * 4.5 + 8;
      }

      // =====================================================
      // VISI
      // =====================================================

      if (visi) {
        const visiLinesPreview = doc.splitTextToSize(String(visi), 165);

        profilY = ensureSpace(
          profilY,
          5 + visiLinesPreview.length * 4.5 + 6,
        );

        aturFont("bold");
        doc.setFontSize(10);

        doc.text("VISI", posisiX(22), profilY, opsiAlign);

        profilY += 5;

        aturFont("normal");
        doc.setFontSize(8.5);

        const visiLines = doc.splitTextToSize(String(visi), 165);

        doc.text(visiLines, posisiX(22), profilY, opsiAlign);

        profilY += visiLines.length * 4.5 + 6;
      }

      // =====================================================
      // MISI
      // =====================================================

      if (misi) {
        const misiLinesPreview = doc.splitTextToSize(String(misi), 165);

        profilY = ensureSpace(
          profilY,
          5 + misiLinesPreview.length * 4.5 + 8,
        );

        aturFont("bold");
        doc.setFontSize(10);

        doc.text("MISI", posisiX(22), profilY, opsiAlign);

        profilY += 5;

        aturFont("normal");
        doc.setFontSize(8.5);

        const misiLines = doc.splitTextToSize(String(misi), 165);

        doc.text(misiLines, posisiX(22), profilY, opsiAlign);

        profilY += misiLines.length * 4.5 + 8;
      }

      // =====================================================
      // LAPORAN STATISTIK
      // =====================================================

      profilY = ensureSpace(profilY, 14 + 4 * 11 + 20);

      aturFont("bold");
      doc.setFontSize(14);

      doc.text("LAPORAN STATISTIK", centerX, profilY, {
        align: "center",
      });

      profilY += 6;

      aturFont("normal");
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
          ...fontStylesTabel,
          fontSize: 9,
          cellPadding: 4,
          valign: "middle",
          halign: "center",
        },

        headStyles: {
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
          ...fontStylesTabel,
        },

        columnStyles: {
          0: {
            cellWidth: 20,
            halign: "center",
          },

          1: {
            cellWidth: 95,
            halign: language === "ar" ? "right" : "left",
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

      statistikY = ensureSpace(statistikY, 7 + 4 * 6);

      aturFont("bold");
      doc.setFontSize(11);

      doc.text("Ringkasan", posisiX(30), statistikY, opsiAlign);

      statistikY += 7;

      aturFont("normal");
      doc.setFontSize(9);

      const ringkasan = [
        `Jumlah seluruh santri: ${totalSantri} orang.`,
        `Santri yang mengikuti program Iqra: ${totalIqra} orang.`,
        `Santri yang mengikuti program Al-Qur'an: ${totalQuran} orang.`,
        `Jumlah guru/ustadz dan ustadzah: ${totalGuru} orang.`,
      ];

      ringkasan.forEach((text) => {
        doc.text(`• ${text}`, posisiX(35), statistikY, opsiAlign);

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

      aturFont("bold");
      doc.setFontSize(14);

      doc.text("PROGRAM PEMBELAJARAN", centerX, 36, {
        align: "center",
      });

      aturFont("normal");
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
          [
            "1",
            "Program Iqra",
            pilihBahasa(
              pengaturan.program_iqra,
              "program_iqra",
              programNarrative.iqra,
            ),
          ],

          [
            "2",
            "Program Al-Qur'an",
            pilihBahasa(
              pengaturan.program_quran,
              "program_quran",
              programNarrative.quran,
            ),
          ],

          [
            "3",
            "Program Tahfidz",
            pilihBahasa(
              pengaturan.program_tahfidz,
              "program_tahfidz",
              programNarrative.tahfidz,
            ),
          ],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          ...fontStylesTabel,
          fontSize: 8,
          cellPadding: 3,
          valign: "top",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
          ...fontStylesTabel,
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 40,
            halign: language === "ar" ? "right" : "left",
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

      aturFont("bold");
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
            pilihBahasa(
              pengaturan.keunggulan_iqra_quran,
              "keunggulan_iqra_quran",
              keunggulanNarrative.iqraQuran,
            ),
          ],

          [
            "2",
            "Praktik Ibadah",
            pilihBahasa(
              pengaturan.keunggulan_ibadah,
              "keunggulan_ibadah",
              keunggulanNarrative.ibadah,
            ),
          ],

          [
            "3",
            "Pembinaan Akhlak",
            pilihBahasa(
              pengaturan.keunggulan_akhlak,
              "keunggulan_akhlak",
              keunggulanNarrative.akhlak,
            ),
          ],

          [
            "4",
            "Guru Berpengalaman",
            pilihBahasa(
              pengaturan.keunggulan_guru,
              "keunggulan_guru",
              keunggulanNarrative.guru,
            ),
          ],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          ...fontStylesTabel,
          fontSize: 7.5,
          cellPadding: 3,
          valign: "top",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
          ...fontStylesTabel,
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 45,
            halign: language === "ar" ? "right" : "left",
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

      aturFont("bold");
      doc.setFontSize(14);

      doc.text("PERSYARATAN PENDAFTARAN SANTRI", centerX, 37, {
        align: "center",
      });

      aturFont("normal");
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
          [
            "1",
            "Pendaftaran Gratis",
            pilihBahasa(
              pengaturan.syarat_gratis,
              "syarat_gratis",
              syaratNarrative.gratis,
            ),
          ],

          [
            "2",
            "Mengisi Form Pendaftaran",
            pilihBahasa(
              pengaturan.syarat_form,
              "syarat_form",
              syaratNarrative.form,
            ),
          ],

          [
            "3",
            "Fotocopy Kartu Keluarga",
            pilihBahasa(pengaturan.syarat_kk, "syarat_kk", syaratNarrative.kk),
          ],

          [
            "4",
            "Fotocopy KTP Orang Tua",
            pilihBahasa(
              pengaturan.syarat_ktp,
              "syarat_ktp",
              syaratNarrative.ktp,
            ),
          ],
        ],

        theme: "grid",

        tableWidth: 170,

        margin: {
          left: 20,
          right: 20,
        },

        styles: {
          ...fontStylesTabel,
          fontSize: 9,
          cellPadding: 4,
          valign: "middle",
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
          ...fontStylesTabel,
        },

        columnStyles: {
          0: {
            cellWidth: 15,
            halign: "center",
          },

          1: {
            cellWidth: 60,
            halign: language === "ar" ? "right" : "left",
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

      aturFont("bold");
      doc.setFontSize(10);

      doc.text("Catatan", posisiX(25), catatanY, opsiAlign);

      catatanY += 7;

      aturFont("normal");
      doc.setFontSize(8.5);

      doc.text(
        `Dokumen persyaratan digunakan sebagai data pendukung administrasi pendaftaran santri di ${namaTPQ}.`,
        posisiX(25),
        catatanY,
        opsiAlign,
      );

      catatanY += 6;

      doc.text(
        `Untuk informasi lebih lanjut, silakan menghubungi ${namaTPQ}.`,
        posisiX(25),
        catatanY,
        opsiAlign,
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

  // =========================================================
  // RENDER
  // =========================================================

  const statCards = [
    { value: totalSantri, label: t.students, icon: Users },
    { value: totalIqra, label: t.iqraStudents, icon: BookOpen },
    { value: totalQuran, label: t.quranStudents, icon: BookMarked },
    { value: totalGuru, label: t.teachers, icon: GraduationCap },
  ];

  const programCards = [
    {
      title: t.iqraProgram,
      text:
        language === "id"
          ? pengaturan.program_iqra
          : programNarrative.iqra[language],
      icon: BookOpen,
    },
    {
      title: t.quranProgram,
      text:
        language === "id"
          ? pengaturan.program_quran
          : programNarrative.quran[language],
      icon: BookMarked,
    },
    {
      title: t.tahfidzProgram,
      text:
        language === "id"
          ? pengaturan.program_tahfidz
          : programNarrative.tahfidz[language],
      icon: Award,
    },
  ];

  const keunggulanCards = [
    {
      title: t.learningIqra,
      text:
        language === "id"
          ? pengaturan.keunggulan_iqra_quran
          : keunggulanNarrative.iqraQuran[language],
      icon: BookOpen,
    },
    {
      title: t.worshipPractice,
      text:
        language === "id"
          ? pengaturan.keunggulan_ibadah
          : keunggulanNarrative.ibadah[language],
      icon: Heart,
    },
    {
      title: t.characterDevelopment,
      text:
        language === "id"
          ? pengaturan.keunggulan_akhlak
          : keunggulanNarrative.akhlak[language],
      icon: Sparkles,
    },
    {
      title: t.experiencedTeachers,
      text:
        language === "id"
          ? pengaturan.keunggulan_guru
          : keunggulanNarrative.guru[language],
      icon: GraduationCap,
    },
  ];

  const syaratCards = [
    {
      title: t.freeRegistration,
      text:
        language === "id"
          ? pengaturan.syarat_gratis
          : language === "en"
            ? syaratNarrative.gratis.en
            : syaratNarrative.gratis.ar,
    },
    {
      title: t.registrationForm,
      text:
        language === "id"
          ? pengaturan.syarat_form
          : language === "en"
            ? syaratNarrative.form.en
            : syaratNarrative.form.ar,
    },
    {
      title: t.familyCard,
      text:
        language === "id"
          ? pengaturan.syarat_kk
          : language === "en"
            ? syaratNarrative.kk.en
            : syaratNarrative.kk.ar,
    },
    {
      title: t.parentIdCard,
      text:
        language === "id"
          ? pengaturan.syarat_ktp
          : language === "en"
            ? syaratNarrative.ktp.en
            : syaratNarrative.ktp.ar,
    },
  ];

  const isRtl = language === "ar";

  return (
    <div className="bg-[#f6faf7] text-gray-800" dir={isRtl ? "rtl" : "ltr"}>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-950/90 via-green-900/75 to-emerald-700/50" />

        <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-6 pb-40 pt-28 md:min-h-[90vh] md:pb-48">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-green-100 backdrop-blur-sm">
            <Sparkles size={14} />
            {t.ahlan}
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            {pengaturan.nama_tpq}
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-green-100 md:text-2xl">
            {t.tagline}
          </p>

          <div className="mt-10 flex w-full flex-row flex-nowrap items-center justify-center gap-2 md:gap-3">
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-3 text-sm font-semibold text-green-800 md:px-6 md:py-3.5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t.register}
              <ArrowRight size={17} className={isRtl ? "rotate-180" : ""} />
            </Link>

            <Link
              to="/kontak"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm md:px-6 md:py-3.5 transition hover:bg-white/20"
            >
              {t.contact}
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTIK (mengambang di bawah hero)
      ===================================================== */}

      <section className="relative z-10 -mt-24 px-6 md:-mt-28">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {statCards.map(({ value, label, icon: Icon }, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white bg-white/90 p-5 text-center shadow-xl shadow-green-900/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
                <Icon size={22} strokeWidth={1.75} />
              </div>

              <div className="mt-4 flex h-10 items-center justify-center">
                {loadingSantri || loadingGuru ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <span className="text-3xl font-bold text-green-800 md:text-4xl">
                    {value}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-gray-600 md:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          PROGRAM
      ===================================================== */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
              {t.programTitle}
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-gray-900 md:text-4xl">
              {t.programDescription} {pengaturan.nama_tpq}
            </h2>

            <p className="mt-3 text-gray-500">
              {language === "id"
                ? "dalam membentuk Generasi Qurani"
                : language === "en"
                  ? "in nurturing a Qur'anic generation"
                  : "لتكوين جيل قرآني"}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {programCards.map(({ title, text, icon: Icon }, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-50 transition group-hover:scale-125" />

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md shadow-green-600/30">
                  <Icon size={22} strokeWidth={1.75} />
                </div>

                <h3 className="relative mt-5 text-lg font-semibold text-gray-900">
                  {title}
                </h3>

                <p
                  className="relative mt-3 text-sm leading-7 text-gray-600 text-justify"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          KEUNGGULAN
      ===================================================== */}

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
              {t.whyChoose}
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-gray-900 md:text-4xl">
              {pengaturan.nama_tpq}
            </h2>

            <p className="mt-3 text-gray-500">{t.whyChooseDescription}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {keunggulanCards.map(({ title, text, icon: Icon }, i) => (
              <div
                key={i}
                className="rounded-3xl border border-green-100 bg-[#f6faf7] p-6 transition duration-300 hover:bg-white hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                  <Icon size={20} strokeWidth={1.75} />
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>

                <p
                  className="mt-2 text-sm leading-6 text-gray-600 text-justify"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PERSYARATAN PENDAFTARAN
      ===================================================== */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">
              {t.registrationTitle}
            </h2>

            <p className="mt-3 text-gray-500">{t.registrationDescription}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {syaratCards.map(({ title, text }, i) => (
              <div
                key={i}
                className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CheckCircle2 size={24} className="text-green-600" />

                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>

                <p
                  className="mt-2 flex-1 text-sm leading-6 text-gray-600 text-justify"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DOWNLOAD PDF
      ===================================================== */}

      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-green-700 to-emerald-600 p-8 text-center text-white shadow-xl md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-xl font-semibold text-white">{pengaturan.nama_tpq}</h3>

            <p className="mt-1 text-sm text-white">
              {t.registrationDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-green-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Download size={18} />
            <span>Download PDF</span>
            <FileText size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}

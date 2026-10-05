import { useEffect, useState } from "react";
import heroImage from "../../assets/hero-putih04.jpg";
import { useOutletContext } from "react-router-dom";
import { Download, FileText, Loader2 } from "lucide-react";

import { api } from "../../api";
import PdfFlipbook from "../../components/PdfFlipbook";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function LaporanPublic() {
  const { language } = useOutletContext();

  const translations = {
    id: {
      arsip: "Arsip Dokumen",
      title: "Laporan TPQ",
      description:
        "Halaman ini berisi berbagai laporan resmi TPQ Hairunnisa, meliputi laporan kegiatan, laporan tahunan, laporan administrasi, serta dokumen lainnya.",
      daftar: "Daftar Dokumen",
      laporan: "Laporan TPQ Hairunnisa",
      laporanDescription:
        "Laporan resmi Sistem Informasi Manajemen TPQ Hairunnisa yang diperbarui secara otomatis berdasarkan data terbaru.",
      format: "Format : PDF",
      preview: "Preview PDF",
      download: "Download PDF",
    },

    en: {
      arsip: "Document Archive",
      title: "TPQ Reports",
      description:
        "This page contains various official reports of TPQ Hairunnisa, including activity reports, annual reports, administrative reports, and other documents.",
      daftar: "Document List",
      laporan: "TPQ Hairunnisa Report",
      laporanDescription:
        "Official report of the TPQ Hairunnisa Management Information System, automatically updated based on the latest data.",
      format: "Format: PDF",
      preview: "Preview PDF",
      download: "Download PDF",
    },

    ar: {
      arsip: "أرشيف الوثائق",
      title: "تقارير TPQ",
      description:
        "تحتوي هذه الصفحة على مختلف التقارير الرسمية لـ TPQ Hairunnisa، بما في ذلك تقارير الأنشطة والتقارير السنوية والتقارير الإدارية والوثائق الأخرى.",
      daftar: "قائمة الوثائق",
      laporan: "تقرير TPQ Hairunnisa",
      laporanDescription:
        "التقرير الرسمي لنظام المعلومات الإدارية لـ TPQ Hairunnisa، والذي يتم تحديثه تلقائيًا بناءً على أحدث البيانات.",
      format: "التنسيق: PDF",
      preview: "معاينة PDF",
      download: "تنزيل PDF",
    },
  };

  const t = translations[language] || translations.id;

  // Bahasa yang dikirim ke backend PDF.
  const pdfLanguage = language === "en" || language === "ar" ? language : "id";

  const [pdfData, setPdfData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState("");

  // Muat PDF dari backend begitu halaman dibuka, lalu langsung tampilkan sebagai flipbook
  useEffect(() => {
    let batal = false;

    const muat = async () => {
      setLoadingPreview(true);
      setErrorPreview("");
      setPdfData(null);

      try {
        const res = await api.get("/laporan-ringkas/view", {
          params: { language: pdfLanguage },
          responseType: "arraybuffer",
        });

        if (!batal) setPdfData(res.data);
      } catch (err) {
        console.error("Gagal memuat PDF:", err);

        if (!batal) setErrorPreview("Pratinjau tidak dapat dimuat. Silakan muat ulang halaman.");
      } finally {
        if (!batal) setLoadingPreview(false);
      }
    };

    muat();

    return () => {
      batal = true;
    };
  }, [pdfLanguage]);

  return (
    <div
      className="min-h-screen bg-[#f6faf7] text-gray-800"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <section
        className="relative overflow-hidden px-4 pb-20 pt-8 md:px-6 md:pt-14"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]" />

        <div className="relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <header className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
              {t.arsip}
            </span>

            <h1 className="mt-4 text-3xl font-semibold text-gray-900 md:text-5xl">
              {t.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
              {t.description}
            </p>
          </header>

          {/* KARTU DOKUMEN */}
          <div className="mt-12 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <FileText size={30} strokeWidth={1.6} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t.laporan}</h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                    {t.laporanDescription}
                  </p>

                  <p className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                    {t.format}
                  </p>
                </div>
              </div>

              <a
                href={`${API_BASE_URL}/laporan-ringkas/pdf?language=${pdfLanguage}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-green-700"
              >
                <Download size={18} />
                {t.download}
              </a>
            </div>

            <div className="mt-8">
              {loadingPreview && (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
                  <Loader2 size={24} className="mr-2 animate-spin text-green-600" />
                  Memuat dokumen...
                </div>
              )}

              {pdfData && <PdfFlipbook data={pdfData} />}
            </div>

            {errorPreview && (
              <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorPreview}
              </p>
            )}
          </div>
        </div>
        </div>
      </section>

    </div>
  );
}

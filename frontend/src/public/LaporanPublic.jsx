import { useOutletContext } from "react-router-dom";

import heroImage from "../assets/hero-putih04.jpg";
import { ChevronDown, FileText } from "lucide-react";

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
    },
  };

  const t = translations[language] || translations.id;

  const scrollToDokumen = () => {
    document.getElementById("daftar-laporan")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      className="bg-[#f8faf8] min-h-screen"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* HERO */}

      <section
        className="
        relative
        overflow-hidden
        pt-3
        pb-10
        md:pt-10
        md:pb-16
        "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
          <div
            className="
            bg-white/20
            backdrop-blur-xs
            border
            border-white
            rounded-3xl
            overflow-hidden
            shadow-xl
            "
          >
            <div className="grid md:grid-cols-2">
              {/* ICON */}

              <div className="flex items-center justify-center p-10">
                <div
                  className="
                  w-52
                  h-52
                  md:w-72
                  md:h-72
                  rounded-full
                  bg-white/70
                  flex
                  items-center
                  justify-center
                  shadow-xl
                  "
                >
                  <FileText
                    size={120}
                    className="text-green-700 md:w-40 md:h-40"
                  />
                </div>
              </div>

              {/* INFO */}

              <div
                className="
                p-6
                md:p-10
                flex
                flex-col
                justify-center
                "
              >
                <span
                  className="
                  text-xs
                  px-3
                  py-1
                  rounded-full
                  bg-gray-200
                  w-fit
                  "
                >
                  {t.arsip}
                </span>

                <h1
                  className="
                  mt-4
                  text-2xl
                  md:text-5xl
                  font-bold
                  text-green-800
                  "
                >
                  {t.title}
                </h1>

                <p
                  className="
                  mt-5
                  text-gray-700
                  leading-5
                  md:leading-8
                  text-justify
                  "
                >
                  {t.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOMBOL SCROLL */}

      <div
        className="
        flex
        justify-center
        -mt-8
        md:-mt-12
        mb-3
        md:mb-6
        relative
        z-30
        "
      >
        <button
          onClick={scrollToDokumen}
          className="
          animate-bounce
          bg-green-600
          text-white
          rounded-full
          p-3
          shadow-xl
          hover:bg-green-700
          transition
          "
        >
          <ChevronDown size={28} />
        </button>
      </div>

      {/* DAFTAR DOKUMEN */}

      <section
        id="daftar-laporan"
        className="
        max-w-7xl
        mx-auto
        px-4
        md:px-6
        scroll-mt-24
        md:scroll-mt-28
        pt-4
        md:pt-18
        pb-14
        "
      >
        <div className="bg-transparent md:bg-white md:rounded-3xl md:shadow-lg p-0 md:p-8">
          <h2 className="text-2xl text-center font-extralight text-green-700 mb-6">
            {t.daftar}
          </h2>

          <div
            className="
            border-2
            border-dashed
            border-green-200
            rounded-2xl
            p-12
            text-center
            "
          >
            <div className="flex items-center justify-center gap-5">
              <div className="text-left">
                <h3 className="text-1xl font-extralight text-green-600">
                  {t.laporan}
                </h3>

                <p className="text-gray-600 mt-2 text-justify">
                  {t.laporanDescription}
                </p>

                <p className="text-sm text-gray-400 mt-2">{t.format}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import heroImage from "../assets/hero-putih04.jpg";
import { ChevronDown, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

export default function LaporanPublic() {
  const scrollToDokumen = () => {
    document.getElementById("daftar-laporan")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const previewPdf = `${API_URL}/api/laporan-ringkas/view`;
  const downloadPdf = `${API_URL}/api/laporan-ringkas/pdf`;

  return (
    <div>
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
                  Arsip Dokumen
                </span>

                <h1
                  className="
                    mt-4
                    text-3xl
                    md:text-5xl
                    font-bold
                    text-green-800
                  "
                >
                  Laporan TPQ
                </h1>

                <p
                  className="
                    mt-5
                    text-gray-700
                    leading-8
                    text-justify
                  "
                >
                  Halaman ini berisi berbagai laporan resmi TPQ Khairunnisa,
                  meliputi laporan kegiatan, laporan tahunan, laporan
                  administrasi, serta dokumen lainnya
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
        <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-6">
          Daftar Dokumen
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <FileText size={60} className="text-green-600" />

              <div className="text-left">
                <h3 className="text-2xl font-bold text-green-500">
                  Laporan Ringkas TPQ Khairunissa
                </h3>

                <p className="text-gray-600 mt-2">
                  Laporan resmi Sistem Informasi Manajemen TPQ Khairunissa yang
                  diperbarui secara otomatis berdasarkan data terbaru.
                </p>

                <p className="text-sm text-gray-400 mt-2">Format : PDF</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={previewPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
              >
                Preview PDF
              </a>

              <a
                href={downloadPdf}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

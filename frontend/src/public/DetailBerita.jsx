import { useEffect, useRef, useState } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";

const API_ROOT_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/api\/?$/, "");

const FRONTEND_URL = (
  import.meta.env.VITE_FRONTEND_URL ||
  window.location.origin ||
  "http://localhost:5173"
).replace(/\/$/, "");
import {
  User,
  CalendarDays,
  Eye,
  ArrowLeft,
  ChevronDown,
  Share2,
  MoreHorizontal,
  X,
} from "lucide-react";

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.15.3-.347.449-.52.15-.174.2-.3.3-.498.099-.198.05-.374-.05-.523-.099-.149-.57-1.378-.783-1.885-.207-.496-.418-.43-.573-.438-.149-.008-.32-.01-.49-.01-.172 0-.448.064-.681.313-.238.248-1.237 1.209-1.237 2.952s1.265 3.433 1.44 3.67c.173.236 2.427 3.709 5.885 5.057 3.456 1.347 3.456.898 4.08.84.625-.057 2.03-.826 2.317-1.627.287-.8.287-1.487.198-1.627-.09-.139-.336-.2-.633-.35" />
    <path d="M12.04 2c-5.526 0-10.004 4.478-10.004 10.004 0 1.767.46 3.427 1.265 4.868L2 22l5.29-1.388a9.95 9.95 0 0 0 4.75 1.206h.004c5.526 0 10.004-4.478 10.004-10.004S17.566 2 12.04 2zm0 18.28h-.003a8.26 8.26 0 0 1-4.207-1.152l-.302-.18-3.14.823.838-3.06-.197-.314a8.25 8.25 0 0 1-1.265-4.393c0-4.567 3.716-8.283 8.28-8.283 2.212 0 4.29.862 5.853 2.428a8.22 8.22 0 0 1 2.425 5.858c0 4.566-3.715 8.273-8.282 8.273z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.774-1.63 1.567v1.882h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function DetailBerita() {
  const { id } = useParams();
  const { language } = useOutletContext();

  const [berita, setBerita] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const isArabic = language === "ar";

  // Mencegah hitungan dibaca dobel akibat React Strict Mode.
  // Tetap memungkinkan berita berbeda dihitung saat navigasi tanpa reload.
  const countedBeritaId = useRef(null);

  const scrollToIsiBerita = () => {
    document.getElementById("isi-berita")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // CATAT BERITA DIBACA
  useEffect(() => {
    if (!id) return;

    if (countedBeritaId.current === String(id)) {
      return;
    }

    countedBeritaId.current = String(id);

    api
      .post(`/berita/${id}/dibaca`)
      .then((res) => {
        console.log("Jumlah pembaca diperbarui:", res.data?.views);
      })
      .catch((err) => {
        console.error("Gagal mencatat berita dibaca:", err);
      });
  }, [id]);

  // LOAD BERITA
  useEffect(() => {
    let mounted = true;

    api
      .get("/berita")
      .then((res) => {
        if (!mounted) return;

        const data = res.data.data || res.data;
        const item = data.find((b) => String(b.id) === String(id));

        setBerita(item || null);
      })
      .catch((err) => {
        if (!mounted) return;

        console.error(err);
        setBerita(null);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  // =========================================================
  // TERJEMAHAN
  //
  // Sudah diterjemahkan & disimpan backend saat Admin menyimpan
  // berita (lihat BeritaController). Di sini tinggal dibaca,
  // tidak ada panggilan AI lagi.
  // =========================================================

  const translatedBerita =
    berita && language !== "id" && berita.translations?.[language]
      ? {
          ...berita,
          judul: berita.translations[language].judul,
          isi: berita.translations[language].isi,
        }
      : berita;

  const texts = {
    id: {
      information: "Informasi TPQ",
      description: "Informasi terbaru kegiatan TPQ Hairunnisa.",
      back: "Kembali ke Berita",
      share: "Bagikan",
      shareTitle: "Bagikan Berita",
      chooseApp: "Pilih aplikasi",
      other: "Lainnya",
      noPhoto: "Tidak ada foto",
      notFound: "Berita tidak ditemukan",
      translating: "Menerjemahkan berita...",
      admin: "Admin",
      read: "Dibaca",
      unavailable: "Fitur Bagikan tidak tersedia di browser ini.",
    },

    en: {
      information: "TPQ Information",
      description: "Latest information about TPQ Hairunnisa activities.",
      back: "Back to News",
      share: "Share",
      shareTitle: "Share News",
      chooseApp: "Choose an application",
      other: "Other",
      noPhoto: "No photo",
      notFound: "News not found",
      translating: "Translating news...",
      admin: "Admin",
      read: "Read",
      unavailable: "The Share feature is not available in this browser.",
    },

    ar: {
      information: "معلومات TPQ",
      description: "أحدث المعلومات حول أنشطة TPQ Hairunnisa.",
      back: "العودة إلى الأخبار",
      share: "مشاركة",
      shareTitle: "مشاركة الخبر",
      chooseApp: "اختر التطبيق",
      other: "أخرى",
      noPhoto: "لا توجد صورة",
      notFound: "الخبر غير موجود",
      translating: "جاري ترجمة الخبر...",
      admin: "المسؤول",
      read: "قراءة",
      unavailable: "ميزة المشاركة غير متاحة في هذا المتصفح.",
    },
  };

  const t = texts[language] || texts.id;

  const displayBerita = language === "id" ? berita : translatedBerita;

  const getBeritaUrl = () => {
    if (!berita) return "";

    return `${FRONTEND_URL}/berita/${berita.id}`;
  };

  const getShareText = () => {
    if (!displayBerita) return "";

    const locale =
      language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";

    const tanggal = new Date(displayBerita?.created_at).toLocaleDateString(
      locale,
    );

    const penulis = displayBerita.penulis || t.admin;

    return `${displayBerita.judul}
${displayBerita.isi}

${
  language === "en" ? "Author" : language === "ar" ? "الكاتب" : "Penulis"
}: ${penulis}

${
  language === "en" ? "Date" : language === "ar" ? "التاريخ" : "Tanggal"
}: ${tanggal}

${
  language === "en"
    ? "Read more"
    : language === "ar"
      ? "اقرأ المزيد"
      : "Baca selengkapnya"
}:

${getBeritaUrl()}`;
  };

  const shareWhatsApp = () => {
    const text = getShareText();

    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(text);

    window.open(whatsappUrl, "_blank");

    setShowShare(false);
  };

  const shareFacebook = () => {
    const url = getBeritaUrl();

    const facebookUrl =
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);

    window.open(facebookUrl, "_blank");

    setShowShare(false);
  };

  const shareInstagram = () => {
    window.open("https://www.instagram.com/", "_blank");

    setShowShare(false);
  };

  const shareOther = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayBerita?.judul,
          text: getShareText(),
          url: getBeritaUrl(),
        });
      } else {
        alert(t.unavailable);
      }
    } catch {
      console.log("Bagikan dibatalkan.");
    }

    setShowShare(false);
  };

  if (!berita) {
    return (
      <div className="p-10 text-center" dir={isArabic ? "rtl" : "ltr"}>
        {t.notFound}
      </div>
    );
  }

  return (
    <div className="bg-[#f8faf8] min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      <section
        className="
          relative
          overflow-hidden
          pt-3
          pb-6
          md:pt-10
          md:pb-16
        "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10" />

        <div
          className="
            relative
            z-10
            max-w-6xl
            mx-auto
            px-4
            md:px-6
          "
        >
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
              <div>
                {berita.foto ? (
                  <img
                    src={`${api.defaults.baseURL.replace(
                      /\/api\/?$/,
                      "",
                    )}/storage/${berita.foto}`}
                    alt={displayBerita?.judul}
                    className="
                      w-full
                      h-48
                      md:h-[380px]
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      h-64
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {t.noPhoto}
                  </div>
                )}
              </div>

              <div
                className="
                  p-4
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
                  {t.information}
                </span>

                <h1
                  className="
                    mt-4
                    text-1xl
                    md:text-3xl
                    font-bold
                    text-green-800
                  "
                >
                  {displayBerita?.judul}
                </h1>

                <p
                  className="
                    mt-3
                    text-gray-600
                    text-sm
                    md:text-base
                  "
                >
                  {t.description}
                </p>

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-5
                    text-gray-600
                  "
                >
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    {displayBerita?.penulis || t.admin}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />

                    {new Date(displayBerita?.created_at).toLocaleDateString(
                      language === "en"
                        ? "en-US"
                        : language === "ar"
                          ? "ar-SA"
                          : "id-ID",
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye size={18} />
                    {displayBerita?.views ?? 0} {t.read}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/berita"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-5
                      py-1
                      rounded-full
                      bg-green-600
                      text-white
                      font-semibold
                      hover:bg-green-700
                      transition
                      w-fit
                    "
                  >
                    <ArrowLeft size={18} />
                    {t.back}
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-5
                      py-1
                      rounded-full
                      bg-blue-600
                      text-white
                      font-semibold
                      hover:bg-blue-700
                      transition
                    "
                  >
                    <Share2 size={18} />
                    {t.share}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="
          flex
          justify-center
          mt-5
          md:-mt-16
          mb-4
          relative
          z-30
        "
      >
        <button
          type="button"
          onClick={scrollToIsiBerita}
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

      <section
        id="isi-berita"
        className="
          max-w-5xl
          mx-auto
          px-4
          md:px-6
          pt-3
          pb-14
        "
      >
        <div className="bg-white rounded-3xl shadow-md p-5 md:p-8">
          <div
            className="
              text-black
              text-justify
              leading-5
              md:leading-8
              whitespace-pre-line
              text-sm
              md:text-base
            "
          >
            {displayBerita?.isi}
          </div>
        </div>
      </section>

      {showShare && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
          onClick={() => setShowShare(false)}
        >
          <div
            className="
              relative
              w-full
              max-w-md
              bg-white
              rounded-3xl
              shadow-2xl
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowShare(false)}
              className="
                absolute
                right-4
                top-4
                p-2
                rounded-full
                text-gray-500
                hover:bg-gray-100
              "
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="text-xl font-bold text-gray-800">
                {t.shareTitle}
              </div>

              <div className="text-sm text-gray-500 mt-1">{t.chooseApp}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  p-5
                  rounded-2xl
                  bg-green-50
                  text-green-700
                  hover:bg-green-100
                  transition
                "
              >
                <WhatsAppIcon className="w-9 h-9" />
                <span className="font-semibold">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={shareFacebook}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  p-5
                  rounded-2xl
                  bg-blue-50
                  text-blue-700
                  hover:bg-blue-100
                  transition
                "
              >
                <FacebookIcon className="w-9 h-9" />
                <span className="font-semibold">Facebook</span>
              </button>

              <button
                type="button"
                onClick={shareInstagram}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  p-5
                  rounded-2xl
                  bg-pink-50
                  text-pink-700
                  hover:bg-pink-100
                  transition
                "
              >
                <InstagramIcon className="w-9 h-9" />
                <span className="font-semibold">Instagram</span>
              </button>

              <button
                type="button"
                onClick={shareOther}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  p-5
                  rounded-2xl
                  bg-gray-50
                  text-gray-700
                  hover:bg-gray-100
                  transition
                "
              >
                <MoreHorizontal className="w-9 h-9" />
                <span className="font-semibold">{t.other}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

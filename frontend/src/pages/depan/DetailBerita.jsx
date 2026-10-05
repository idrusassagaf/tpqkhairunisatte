import { useEffect, useRef, useState } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";
import { isHtmlContent, isiToPlainText } from "../../utils/berita";
import heroImage from "../../assets/hero-putih04.jpg";

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
  const [loadingBerita, setLoadingBerita] = useState(true);
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
      })
      .finally(() => {
        if (mounted) setLoadingBerita(false);
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
${isiToPlainText(displayBerita.isi)}

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

  useEffect(() => {
    if (!berita || !displayBerita) return;

    const baseUrl = window.location.origin;
    const pageUrl = `${baseUrl}/berita/${berita.id}`;
    const imageUrl = berita.foto
      ? `${baseUrl}/storage/${berita.foto}`
      : `${baseUrl}/logo-tpq.png`;
    const title = displayBerita.judul || "Berita TPQ Hairunnisa";
    const description = isiToPlainText(displayBerita.isi);

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[property="og:title"]', "property", "og:title");
    setMeta('meta[property="og:title"]', "content", title);

    setMeta('meta[property="og:description"]', "property", "og:description");
    setMeta(
      'meta[property="og:description"]',
      "content",
      description.slice(0, 200) + (description.length > 200 ? "..." : ""),
    );

    setMeta('meta[property="og:url"]', "property", "og:url");
    setMeta('meta[property="og:url"]', "content", pageUrl);

    setMeta('meta[property="og:image"]', "property", "og:image");
    setMeta('meta[property="og:image"]', "content", imageUrl);

    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt");
    setMeta('meta[property="og:image:alt"]', "content", title);

    setMeta('meta[name="twitter:title"]', "name", "twitter:title");
    setMeta('meta[name="twitter:title"]', "content", title);

    setMeta('meta[name="twitter:description"]', "name", "twitter:description");
    setMeta(
      'meta[name="twitter:description"]',
      "content",
      description.slice(0, 200) + (description.length > 200 ? "..." : ""),
    );

    setMeta('meta[name="twitter:image"]', "name", "twitter:image");
    setMeta('meta[name="twitter:image"]', "content", imageUrl);

    document.title = title;
  }, [berita, displayBerita]);

  if (loadingBerita) {
    return (
      <div className="bg-[#f8faf8] min-h-screen p-6 md:p-10" dir={isArabic ? "rtl" : "ltr"}>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-2/3" />

          <Skeleton className="h-4 w-1/3" />

          <Skeleton className="mt-6 h-72 w-full rounded-2xl" />

          <div className="space-y-2 pt-4">
            <Skeleton className="h-3 w-full" />

            <Skeleton className="h-3 w-11/12" />

            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="p-10 text-center" dir={isArabic ? "rtl" : "ltr"}>
        {t.notFound}
      </div>
    );
  }

  const metaTanggal = new Date(displayBerita?.created_at).toLocaleDateString(
    language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const fotoUrl = berita.foto
    ? `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${berita.foto}`
    : null;

  return (
    <div className="min-h-screen bg-[#f6faf7]" dir={isArabic ? "rtl" : "ltr"}>
      <article className="mx-auto max-w-4xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
        {/* NAVIGASI KEMBALI */}
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm ring-1 ring-gray-100 transition hover:bg-green-50"
        >
          <ArrowLeft size={16} className={isArabic ? "rotate-180" : ""} />
          {t.back}
        </Link>

        {/* JUDUL + META */}
        <header className="mt-6">
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
            {t.information}
          </span>

          <h1 className="mt-4 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
            {displayBerita?.judul}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-100">
              <User size={15} className="text-green-600" />
              {displayBerita?.penulis || t.admin}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-100">
              <CalendarDays size={15} className="text-green-600" />
              {metaTanggal}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-100">
              <Eye size={15} className="text-green-600" />
              {displayBerita?.views ?? 0} {t.read}
            </span>

            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              <Share2 size={16} />
              {t.share}
            </button>
          </div>
        </header>

        {/* FOTO */}
        <figure className="mt-8 overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={displayBerita?.judul}
              className="max-h-[480px] w-full object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-gray-400">
              {t.noPhoto}
            </div>
          )}
        </figure>

        {/* DESKRIPSI SINGKAT */}
        <p className="mt-6 text-base leading-7 text-gray-600 md:text-lg">
          {t.description}
        </p>

        {/* ISI BERITA */}
        <section
          id="isi-berita"
          className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-10"
        >
          {isHtmlContent(displayBerita?.isi) ? (
            <div
              className="isi-berita mx-auto max-w-prose text-justify text-base leading-8 text-gray-800"
              dangerouslySetInnerHTML={{ __html: displayBerita.isi }}
            />
          ) : (
            <div className="mx-auto max-w-prose whitespace-pre-line text-justify text-base leading-8 text-gray-800">
              {displayBerita?.isi}
            </div>
          )}
        </section>

        {/* KEMBALI KE DAFTAR */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
          >
            <ArrowLeft size={16} className={isArabic ? "rotate-180" : ""} />
            {t.back}
          </Link>
        </div>
      </article>

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

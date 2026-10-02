import { useEffect, useRef, useState } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import {
  User,
  CalendarDays,
  Eye,
  ArrowLeft,
  ChevronDown,
  Share2,
  X,
} from "lucide-react";

export default function DetailBerita() {
  const { id } = useParams();
  const { language } = useOutletContext();

  const [berita, setBerita] = useState(null);
  const [translatedBerita, setTranslatedBerita] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

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

        if (item && language === "id") {
          setTranslatedBerita(item);
        }
      })
      .catch((err) => {
        if (!mounted) return;

        console.error(err);
        setBerita(null);
      });

    return () => {
      mounted = false;
    };
  }, [id, language]);

  // TRANSLATE BERITA
  const translateBeritaItem = async (item) => {
    const cacheKey = `tpq_berita_translation_${item.id}_${language}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);

        if (parsed?.judul && parsed?.isi !== undefined) {
          return {
            ...item,
            judul: parsed.judul,
            isi: parsed.isi,
          };
        }
      }
    } catch {
      sessionStorage.removeItem(cacheKey);
    }

    const response = await api.post("/berita/translate", {
      judul: item.judul || "",
      isi: item.isi || "",
      language,
    });

    if (!response.data?.success || !response.data?.data) {
      throw new Error("Hasil terjemahan berita tidak valid.");
    }

    const translated = {
      judul: response.data.data.judul || item.judul,
      isi: response.data.data.isi || item.isi,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(translated));
    } catch {
      console.warn("Cache terjemahan berita tidak dapat disimpan.");
    }

    return {
      ...item,
      judul: translated.judul,
      isi: translated.isi,
    };
  };

  useEffect(() => {
    if (!berita) return;

    if (language === "id") {
      setTranslatedBerita(berita);
      setLoadingTranslation(false);
      return;
    }

    let cancelled = false;

    const translateBerita = async () => {
      setLoadingTranslation(true);
      setTranslatedBerita(null);

      try {
        const translatedItem = await translateBeritaItem(berita);

        if (cancelled) return;

        setTranslatedBerita(translatedItem);
      } catch (err) {
        if (!cancelled) {
          console.error("Gagal menerjemahkan berita:", err);

          setTranslatedBerita({
            ...berita,
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingTranslation(false);
        }
      }
    };

    translateBerita();

    return () => {
      cancelled = true;
    };
  }, [language, berita, id]);

  const texts = {
    id: {
      information: "Informasi TPQ",
      description: "Informasi terbaru kegiatan TPQ Khairunnisa.",
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
      description: "Latest information about TPQ Khairunnisa activities.",
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
      description:
        "أحدث المعلومات حول أنشطة TPQ Khairunnisa.",
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
      unavailable:
        "ميزة المشاركة غير متاحة في هذا المتصفح.",
    },
  };

  const t = texts[language] || texts.id;

  const displayBerita = language === "id" ? berita : translatedBerita;

  const getBeritaUrl = () => {
    if (!berita) return "";

    return "http://127.0.0.1:8000/share/berita/" + berita.id;
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

  if (language !== "id" && loadingTranslation && !translatedBerita) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-10 text-center"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="text-green-700 font-semibold">{t.translating}</div>
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
                <div className="text-4xl">🟢</div>
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
                <div className="text-4xl font-bold">f</div>
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
                <div className="text-4xl">◎</div>
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
                <div className="text-4xl">⋯</div>
                <span className="font-semibold">{t.other}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

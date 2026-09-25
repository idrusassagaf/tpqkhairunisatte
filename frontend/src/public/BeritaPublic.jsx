import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useOutletContext } from "react-router-dom";
import heroImage from "../assets/hero-putih04.jpg";
import { ChevronRight, User, CalendarDays } from "lucide-react";

export default function BeritaPublic() {
  const { language } = useOutletContext();

  const [berita, setBerita] = useState([]);
  const [translatedBerita, setTranslatedBerita] = useState([]);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  useEffect(() => {
    const loadBerita = async () => {
      try {
        const res = await api.get("/berita");
        const data = res.data.data || [];
        setBerita(data);
      } catch (err) {
        console.error("Gagal mengambil berita:", err);
        setBerita([]);
      }
    };

    loadBerita();
  }, []);

  const translateBeritaItem = async (item, targetLanguage) => {
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
    if (language === "id") {
      setTranslatedBerita([]);
      setLoadingTranslation(false);
      return;
    }

    if (berita.length === 0) {
      return;
    }

    let cancelled = false;

    const translateBerita = async () => {
      setLoadingTranslation(true);

      try {
        const targetLanguage = language === "en" ? "English" : "Arabic";

        const hasil = [];

        for (const item of berita) {
          if (cancelled) return;

          try {
            const translatedItem = await translateBeritaItem(
              item,
              targetLanguage,
            );

            hasil.push(translatedItem);
          } catch (err) {
            console.error(`Gagal menerjemahkan berita ID ${item.id}:`, err);

            hasil.push({
              ...item,
              judul: item.judul,
              isi: item.isi,
            });
          }
        }

        if (!cancelled) {
          setTranslatedBerita(hasil);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Gagal menerjemahkan berita:", err);
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
  }, [language, berita]);

  const displayBerita = language === "id" ? berita : translatedBerita;

  const translations = {
    id: {
      title: "Berita TPQ Khairunnisa",
      description:
        "Informasi, kegiatan dan dokumentasi terbaru seputar TPQ Khairunnisa.",
      mainNews: "Berita Utama",
      previousNews: "Berita Sebelumnya",
      readMore: "Baca Selengkapnya",
      read: "Baca",
      admin: "Admin TPQ",
      adminShort: "Admin",
      noNews: "Belum ada berita tersedia.",
      translating: "Menerjemahkan berita...",
    },

    en: {
      title: "TPQ Khairunnisa News",
      description:
        "Latest information, activities, and documentation about TPQ Khairunnisa.",
      mainNews: "Featured News",
      previousNews: "Previous News",
      readMore: "Read More",
      read: "Read",
      admin: "TPQ Admin",
      adminShort: "Admin",
      noNews: "No news available.",
      translating: "Translating news...",
    },

    ar: {
      title: "أخبار TPQ Khairunnisa",
      description: "أحدث المعلومات والأنشطة والتوثيق حول TPQ Khairunnisa.",
      mainNews: "الخبر الرئيسي",
      previousNews: "الأخبار السابقة",
      readMore: "اقرأ المزيد",
      read: "اقرأ",
      admin: "مسؤول TPQ",
      adminShort: "المسؤول",
      noNews: "لا توجد أخبار متاحة.",
      translating: "جارٍ ترجمة الأخبار...",
    },
  };

  const t = translations[language] || translations.id;

  const formatDate = (date) => {
    const locale =
      language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";

    return new Date(date).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-[#f8faf8] min-h-screen ${
        language === "ar" ? "text-right" : ""
      }`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <section
        className="relative overflow-hidden pt-2 md:pt-8 pb-18 md:pb-16"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-5">
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-2">
              {t.title}
            </h1>

            <p className="mt-1 text-xs md:text-sm text-gray-700 max-w-xl mx-auto">
              {t.description}
            </p>
          </div>

          {loadingTranslation && (
            <div className="mb-4 text-center text-sm text-green-700 font-medium">
              {t.translating}
            </div>
          )}

          {displayBerita.length === 0 ? (
            <div className="bg-white/35 backdrop-blur-md border border-white/30 rounded-3xl shadow-lg p-10 text-center">
              {t.noNews}
            </div>
          ) : (
            <>
              <Link
                to={`/web/berita/${displayBerita[0].id}`}
                className="block bg-white/20 backdrop-blur-xs border border-white rounded-3xl overflow-hidden shadow-lg hover:bg-white/30 transition"
              >
                <div className="grid md:grid-cols-2">
                  <img
                    src={
                      displayBerita[0].foto
                        ? `${api.defaults.baseURL.replace(
                            /\/api\/?$/,
                            "",
                          )}/storage/${displayBerita[0].foto}`
                        : ""
                    }
                    alt={displayBerita[0].judul}
                    className="w-full h-52 md:h-80 object-cover"
                  />

                  <div className="p-5 md:p-7 flex flex-col justify-center">
                    <span className="inline-block w-fit text-xs px-3 py-1 rounded-full bg-gray-200">
                      {t.mainNews}
                    </span>

                    <h2 className="mt-3 text-xl md:text-3xl font-bold text-green-800">
                      {displayBerita[0].judul}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {displayBerita[0].penulis || t.admin}
                      </div>

                      <div className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatDate(displayBerita[0].created_at)}
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700 text-sm md:text-base leading-5 md:leading-6 text-justify">
                      {displayBerita[0].isi?.substring(0, 300)}
                      ...
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-green-700 font-semibold">
                      {t.readMore}

                      <ChevronRight
                        size={18}
                        className={language === "ar" ? "rotate-180" : ""}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>

      {displayBerita.length > 1 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-5">
              <h3 className="text-lg md:text-2xl font-bold text-green-800">
                {t.previousNews}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayBerita.slice(1).map((item) => (
                <Link
                  key={item.id}
                  to={`/web/berita/${item.id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition"
                >
                  {item.foto && (
                    <img
                      src={`${api.defaults.baseURL.replace(
                        /\/api\/?$/,
                        "",
                      )}/storage/${item.foto}`}
                      alt={item.judul}
                      className="w-full h-36 md:h-44 object-cover"
                    />
                  )}

                  <div className="p-3 space-y-0">
                    <h2 className="text-sm md:text-base font-bold text-green-700 line-clamp-2 leading-5">
                      {item.judul}
                    </h2>

                    <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] md:text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={11} />
                        {item.penulis || t.adminShort}
                      </div>

                      <div className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(item.created_at)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-700">
                      {t.read}

                      <ChevronRight
                        size={14}
                        className={language === "ar" ? "rotate-180" : ""}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

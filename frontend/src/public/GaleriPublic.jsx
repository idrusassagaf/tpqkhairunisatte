import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { api } from "../api";

import heroImage from "../assets/hero-putih04.jpg";

import { ChevronDown } from "lucide-react";

export default function GaleriPublic() {
  const { language } = useOutletContext();

  const [data, setData] = useState([]);
  const [translatedData, setTranslatedData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const translations = {
    id: {
      dokumentasi: "Dokumentasi Kegiatan",
      title: "Galeri Santri TPQ",
      description:
        "Dokumentasi berbagai kegiatan santri TPQ Khairunnisa yang berisi aktivitas belajar, mengaji, perlombaan dan momen kebersamaan dalam membentuk generasi Qurani yang berakhlak mulia.",
      preview: "Preview",
    },

    en: {
      dokumentasi: "Activity Documentation",
      title: "TPQ Santri Gallery",
      description:
        "Documentation of various activities of TPQ Khairunnisa students, including learning activities, Quran recitation, competitions, and moments of togetherness in building a Qur'anic generation with noble character.",
      preview: "Preview",
    },

    ar: {
      dokumentasi: "توثيق الأنشطة",
      title: "معرض طلاب TPQ",
      description:
        "توثيق مختلف أنشطة طلاب TPQ Khairunnisa، بما في ذلك أنشطة التعلم وتلاوة القرآن والمسابقات ولحظات التآلف في بناء جيل قرآني ذي أخلاق كريمة.",
      preview: "معاينة",
    },
  };

  const t = translations[language] || translations.id;

  useEffect(() => {
    loadGaleri();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      translateGaleri();
    } else {
      setTranslatedData([]);
    }
  }, [data, language]);

  const scrollToGaleri = () => {
    document.getElementById("grid-galeri")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const loadGaleri = async () => {
    try {
      const res = await api.get("/galeri");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const translateGaleri = async () => {
    if (language === "id") {
      setTranslatedData(data);
      return;
    }

    const hasil = [];

    for (const item of data) {
      const cacheKey = `tpq_galeri_translation_${item.id}_${language}`;

      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);

          hasil.push({
            ...item,
            judul: cachedData.judul || item.judul,
          });

          continue;
        } catch (error) {
          sessionStorage.removeItem(cacheKey);
        }
      }

      try {
        const response = await api.post("/galeri/translate", {
          judul: item.judul,
          language,
        });

        const translatedTitle = response.data?.data?.judul || item.judul;

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            judul: translatedTitle,
          }),
        );

        hasil.push({
          ...item,
          judul: translatedTitle,
        });
      } catch (error) {
        console.error(`Gagal menerjemahkan judul galeri ID ${item.id}:`, error);

        hasil.push({
          ...item,
          judul: item.judul,
        });
      }
    }

    setTranslatedData(hasil);
  };

  const getImageUrl = (foto) => {
    return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${foto}`;
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
          pt-1
          md:pt-16
          pb-10
        "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-4
            md:px-6
          "
        >
          {translatedData.length > 0 && (
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
                {/* FOTO UTAMA */}
                <div>
                  <img
                    src={getImageUrl(translatedData[0].foto)}
                    alt={translatedData[0].judul}
                    onClick={() =>
                      setSelectedImage(getImageUrl(translatedData[0].foto))
                    }
                    className="
                      w-full
                      h-56
                      md:h-[380px]
                      object-cover
                      cursor-pointer
                    "
                  />
                </div>

                {/* INFORMASI */}
                <div
                  className="
                    p-5
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
                    {t.dokumentasi}
                  </span>

                  <h1
                    className="
                      mt-4
                      text-2xl
                      md:text-4xl
                      font-bold
                      text-green-800
                    "
                  >
                    {t.title}
                  </h1>

                  <h2
                    className="
                      mt-4
                      text-lg
                      md:text-2xl
                      font-semibold
                      text-green-700
                    "
                  >
                    {translatedData[0].judul}
                  </h2>

                  <p
                    className="
                      mt-4
                      text-justify
                      text-gray-700
                      text-sm
                      leading-5
                      md:text-base
                      md:leading-7
                    "
                  >
                    {t.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TOMBOL SCROLL */}
      <div
        className="
          flex
          justify-center
          -mt-5
          md:-mt-12
          mb-5
          relative
          z-30
        "
      >
        <button
          onClick={scrollToGaleri}
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
          aria-label="Scroll to gallery"
        >
          <ChevronDown size={28} />
        </button>
      </div>

      {/* GALERI FOTO */}
      <section
        id="grid-galeri"
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          pt-8
          md:pt-16
          pb-14
        "
      >
        {translatedData.length > 1 && (
          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              lg:grid-cols-5
              gap-4
            "
          >
            {translatedData.slice(1).map((item) => (
              <div
                key={item.id}
                className="
                  bg-white
                  rounded-2xl
                  shadow-md
                  overflow-hidden
                  hover:-translate-y-1
                  hover:shadow-xl
                  transition
                "
              >
                <img
                  src={getImageUrl(item.foto)}
                  alt={item.judul}
                  onClick={() => setSelectedImage(getImageUrl(item.foto))}
                  className="
                    w-full
                    h-40
                    md:h-44
                    object-cover
                    cursor-pointer
                    hover:scale-105
                    transition
                    duration-300
                  "
                />

                <div className="p-3">
                  <h3
                    className="
                      text-xs
                      font-medium
                      text-green-700
                      text-center
                      line-clamp-2
                    "
                  >
                    {item.judul}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {selectedImage && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/90
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() => setSelectedImage(null)}
          dir="ltr"
        >
          <img
            src={selectedImage}
            alt={t.preview}
            className="
              max-w-[95vw]
              max-h-[90vh]
              object-contain
              rounded-3xl
            "
          />

          <button
            className="
              absolute
              top-5
              right-5
              text-white
              text-4xl
              font-bold
            "
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

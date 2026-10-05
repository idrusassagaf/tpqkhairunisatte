import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../../api";
import { SkeletonCard } from "../../components/Skeleton";
import { isiToPlainText } from "../../utils/berita";
import heroImage from "../../assets/hero-putih04.jpg";
import { ChevronRight, Pin } from "lucide-react";

export default function PengumumanPublic() {
  const [loading, setLoading] = useState(true);

  const { language } = useOutletContext();

  const translations = {
    id: {
      title: "Pengumuman TPQ Hairunnisa",
      subtitle:
        "Informasi dan pemberitahuan resmi untuk santri, guru dan wali santri.",
      readMore: "Baca Selengkapnya",
      empty: "Belum ada pengumuman tersedia.",
    },
    en: {
      title: "TPQ Hairunnisa Announcements",
      subtitle:
        "Official information and announcements for students, teachers, and students' parents.",
      readMore: "Read More",
      empty: "No announcements available yet.",
    },
    ar: {
      title: "إعلانات TPQ Hairunnisa",
      subtitle:
        "المعلومات والإعلانات الرسمية للطلاب والمعلمين وأولياء أمور الطلاب.",
      readMore: "اقرأ المزيد",
      empty: "لا توجد إعلانات متاحة حاليًا.",
    },
  };

  const t = translations[language] || translations.id;

  const [pengumuman, setPengumuman] = useState([]);
  useEffect(() => {
    loadPengumuman();
  }, []);

  const loadPengumuman = async () => {
    try {
      const res = await api.get("/pengumuman");

      const data = res.data.data || res.data;

      const aktif = data.filter((item) => item.status === "Aktif");

      setPengumuman(aktif);
    } catch (err) {
      console.error("Gagal mengambil pengumuman:", err);
      setPengumuman([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TERJEMAHAN
  //
  // Sudah diterjemahkan & disimpan backend saat Admin menyimpan
  // pengumuman (lihat PengumumanController). Di sini tinggal
  // dibaca, tidak ada panggilan AI per item lagi.
  // =========================================================

  const displayPengumuman =
    language === "id"
      ? pengumuman
      : pengumuman.map((item) => {
          const translated = item.translations?.[language];

          return translated
            ? { ...item, judul: translated.judul, isi: translated.isi }
            : item;
        });

  return (
    <div className="bg-[#f8faf8]">
      {/* HEADER */}

      <section
        className="relative overflow-hidden pt-8 md:pt-16 pb-12"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Judul */}

          <div className="text-center mb-14">
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-8">
              {t.title}
            </h1>

            <p className="mt-2 text-xs md:text-sm text-gray-700 max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* List */}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard withImage={false} />

              <SkeletonCard withImage={false} />
            </div>
          ) : displayPengumuman.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <p className="text-gray-500">{t.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPengumuman.map((item) => (
                <Link
                  key={item.id}
                  to={`/pengumuman/${item.id}`}
                  className="
bg-white/35
backdrop-blur-xs
border
border-white/30
rounded-3xl
shadow-lg
p-5
md:p-7
flex
flex-col
justify-between
hover:bg-white/45
transition
"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="
                    w-9
                    h-9
                    rounded-full
                    bg-white/60
                    backdrop-blur-sm
                    flex
                    items-center
                    justify-center
                    "
                      >
                        <Pin size={20} className="text-green-700" />
                      </div>

                      <h2 className="text-lg md:text-2xl font-bold text-green-700">
                        {item.judul}
                      </h2>
                    </div>

                    <p
                      className="
                    text-gray-600
                    text-sm
                    md:text-base
                    text-justify
                    leading-5
                    md:leading-7
                    "
                    >
                      {isiToPlainText(item.isi).length > 180
                        ? isiToPlainText(item.isi).substring(0, 180) + "..."
                        : isiToPlainText(item.isi)}
                    </p>
                  </div>

                  {/* Tombol */}

                  <div
                    className="
                  mt-4
                  flex
                  items-center
                  text-green-700
                  font-semibold
                  gap-2
                  "
                  >
                    {t.readMore}
                    <ChevronRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

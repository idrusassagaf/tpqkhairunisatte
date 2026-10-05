import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { api } from "../../api";
import { Skeleton, SkeletonCard } from "../../components/Skeleton";

import heroImage from "../../assets/hero-putih04.jpg";

import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";

export default function GaleriPublic() {
  const [loading, setLoading] = useState(true);

  const { language } = useOutletContext();

  const [data, setData] = useState([]);
  // Indeks foto yang sedang dibuka di lightbox (null = tertutup)
  const [aktif, setAktif] = useState(null);
  const sentuhRef = useRef(null);

  const translations = {
    id: {
      dokumentasi: "Dokumentasi Kegiatan",
      title: "Galeri Santri TPQ",
      description:
        "Dokumentasi berbagai kegiatan santri TPQ Hairunnisa yang berisi aktivitas belajar, mengaji, perlombaan dan momen kebersamaan dalam membentuk generasi Qurani yang berakhlak mulia.",
      preview: "Preview",
    },

    en: {
      dokumentasi: "Activity Documentation",
      title: "TPQ Santri Gallery",
      description:
        "Documentation of various activities of TPQ Hairunnisa students, including learning activities, Quran recitation, competitions, and moments of togetherness in building a Qur'anic generation with noble character.",
      preview: "Preview",
    },

    ar: {
      dokumentasi: "توثيق الأنشطة",
      title: "معرض طلاب TPQ",
      description:
        "توثيق مختلف أنشطة طلاب TPQ Hairunnisa، بما في ذلك أنشطة التعلم وتلاوة القرآن والمسابقات ولحظات التآلف في بناء جيل قرآني ذي أخلاق كريمة.",
      preview: "معاينة",
    },
  };

  const t = translations[language] || translations.id;

  useEffect(() => {
    loadGaleri();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TERJEMAHAN
  //
  // Sudah diterjemahkan & disimpan backend saat Admin menyimpan
  // foto galeri (lihat GaleriController). Di sini tinggal
  // dibaca, tidak ada panggilan AI per item lagi.
  // =========================================================

  const translatedData =
    language === "id"
      ? data
      : data.map((item) => {
          const translated = item.translations?.[language];

          return translated
            ? { ...item, judul: translated.judul }
            : item;
        });

  const getImageUrl = (foto) => {
    return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${foto}`;
  };

  const jumlah = translatedData.length;

  const buka = (i) => setAktif(i);
  const tutup = () => setAktif(null);
  const sebelumnya = () => setAktif((i) => (i === null ? i : (i - 1 + jumlah) % jumlah));
  const berikutnya = () => setAktif((i) => (i === null ? i : (i + 1) % jumlah));

  // Navigasi keyboard di lightbox
  useEffect(() => {
    if (aktif === null) return;

    const onKey = (e) => {
      if (e.key === "Escape") tutup();
      if (e.key === "ArrowLeft") sebelumnya();
      if (e.key === "ArrowRight") berikutnya();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [aktif, jumlah]);

  // Geser di layar sentuh
  const onTouchStart = (e) => {
    sentuhRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (sentuhRef.current === null) return;

    const selisih = e.changedTouches[0].clientX - sentuhRef.current;

    sentuhRef.current = null;

    if (Math.abs(selisih) < 40) return;

    if (selisih < 0) berikutnya();
    else sebelumnya();
  };

  const fotoAktif = aktif !== null ? translatedData[aktif] : null;

  return (
    <div className="min-h-screen bg-[#f6faf7] text-gray-800">
      {/* HEADER DENGAN FOTO LATAR */}
      <section
        className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pt-14"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
            {t.dokumentasi}
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-gray-900 md:text-5xl">
            {t.title}
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
            {t.description}
          </p>
        </div>
      </section>

      {/* GRID FOTO */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        ) : jumlah === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-sm">
            <ImageOff size={36} className="text-gray-300" />

            <p className="text-sm">Belum ada foto di galeri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {translatedData.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => buka(i)}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 text-left shadow-sm ring-1 ring-gray-100 transition hover:shadow-xl"
              >
                <img
                  src={getImageUrl(item.foto)}
                  alt={item.judul}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-10">
                  <p className="line-clamp-2 text-sm font-medium text-white">
                    {item.judul}
                  </p>
                </div>

                <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-gray-700 opacity-0 backdrop-blur transition group-hover:opacity-100">
                  {t.preview}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX */}
      {fotoAktif && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4"
          onClick={tutup}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={getImageUrl(fotoAktif.foto)}
            alt={fotoAktif.judul}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-[92vw] select-none rounded-2xl object-contain shadow-2xl"
            draggable={false}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-4 text-white"
          >
            <p className="max-w-xl text-center text-sm font-medium">{fotoAktif.judul}</p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={sebelumnya}
                aria-label="Foto sebelumnya"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <ChevronLeft size={22} />
              </button>

              <span className="min-w-[4rem] text-center text-xs text-gray-300">
                {aktif + 1} / {jumlah}
              </span>

              <button
                type="button"
                onClick={berikutnya}
                aria-label="Foto berikutnya"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={tutup}
            aria-label="Tutup"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

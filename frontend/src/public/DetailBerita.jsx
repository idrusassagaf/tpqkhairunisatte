import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import {
  User,
  CalendarDays,
  ArrowLeft,
  ChevronDown,
  Share2,
  X,
} from "lucide-react";

export default function DetailBerita() {
  const { id } = useParams();

  const [berita, setBerita] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const scrollToIsiBerita = () => {
    document.getElementById("isi-berita")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      const res = await api.get("/berita");

      const data = res.data.data || res.data;

      const item = data.find((b) => String(b.id) === String(id));

      setBerita(item);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     URL BERITA
  ========================= */

  const getBeritaUrl = () => {
    return "http://127.0.0.1:8000/share/berita/" + berita.id;
  };

  /* =========================
     TEKS SHARE
  ========================= */

  const getShareText = () => {
    if (!berita) return "";

    return `${berita.judul}

${berita.isi}

Penulis: ${berita.penulis || "Admin"}
Tanggal: ${new Date(berita.created_at).toLocaleDateString("id-ID")}

Baca selengkapnya:
${getBeritaUrl()}`;
  };

  /* =========================
     WHATSAPP
  ========================= */

  const shareWhatsApp = () => {
    const text = getShareText();

    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(text);

    window.open(whatsappUrl, "_blank");

    setShowShare(false);
  };

  /* =========================
     FACEBOOK
  ========================= */

  const shareFacebook = () => {
    const url = getBeritaUrl();

    const facebookUrl =
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);

    window.open(facebookUrl, "_blank");

    setShowShare(false);
  };

  /* =========================
     INSTAGRAM
  ========================= */

  const shareInstagram = () => {
    window.open("https://www.instagram.com/", "_blank");

    setShowShare(false);
  };

  /* =========================
     LAINNYA
  ========================= */

  const shareOther = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: berita.judul,
          text: getShareText(),
          url: getBeritaUrl(),
        });
      } else {
        alert("Fitur Bagikan tidak tersedia di browser ini.");
      }
    } catch (err) {
      console.log("Bagikan dibatalkan.");
    }

    setShowShare(false);
  };

  if (!berita) {
    return <div className="p-10 text-center">Berita tidak ditemukan</div>;
  }

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* =========================
          HERO
      ========================= */}

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
        <div className="absolute inset-0 bg-white/10"></div>

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
              {/* FOTO */}

              <div>
                {berita.foto ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${berita.foto}`}
                    alt={berita.judul}
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
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* INFORMASI */}

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
                  Informasi TPQ
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
                  {berita.judul}
                </h1>

                <p
                  className="
                    mt-3
                    text-gray-600
                    text-sm
                    md:text-base
                  "
                >
                  Informasi terbaru kegiatan TPQ Khairunnisa.
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
                    {berita.penulis || "Admin"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />
                    {new Date(berita.created_at).toLocaleDateString("id-ID")}
                  </div>
                </div>

                {/* =========================
                    TOMBOL
                ========================= */}

                <div className="mt-3 flex flex-wrap gap-2">
                  {/* KEMBALI */}

                  <Link
                    to="/web/berita"
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
                    Kembali ke Berita
                  </Link>

                  {/* BAGIKAN */}

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
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TOMBOL SCROLL
      ========================= */}

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

      {/* =========================
          ISI BERITA
      ========================= */}

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
          <h2
            className="
              text-xs
              md:text-base
              font-bold
              text-green-700
              mb-2
            "
          >
            BACA BERITA SELENGKAPNYA ...
          </h2>

          <div
            className="
              text-black
              text-justify
              leading-7
              md:leading-8
              whitespace-pre-line
              text-sm
              md:text-base
            "
          >
            {berita.isi}
          </div>
        </div>
      </section>

      {/* =========================
          POPUP BAGIKAN
      ========================= */}

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
            {/* TUTUP */}

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

            {/* JUDUL */}

            <div className="text-center mb-6">
              <div className="text-xl font-bold text-gray-800">
                Bagikan Berita
              </div>

              <div className="text-sm text-gray-500 mt-1">Pilih aplikasi</div>
            </div>

            {/* =========================
                PILIHAN SHARE
            ========================= */}

            <div className="grid grid-cols-2 gap-4">
              {/* WHATSAPP */}

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

              {/* FACEBOOK */}

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

              {/* INSTAGRAM */}

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

              {/* LAINNYA */}

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

                <span className="font-semibold">Lainnya</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

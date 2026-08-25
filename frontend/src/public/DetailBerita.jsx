import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import { User, CalendarDays, ArrowLeft, ChevronDown } from "lucide-react";

export default function DetailBerita() {
  const { id } = useParams();

  const [berita, setBerita] = useState(null);
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

  if (!berita) {
    return <div className="p-10 text-center">Berita tidak ditemukan</div>;
  }

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* HERO */}

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

                <Link
                  to="/web/berita"
                  className="
                mt-3

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

      {/* ISI BERITA */}
      {/* ISI BERITA */}
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
    </div>
  );
}

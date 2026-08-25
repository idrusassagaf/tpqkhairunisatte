import { useEffect, useState } from "react";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import { ChevronDown } from "lucide-react";

export default function GaleriPublic() {
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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
    }
  };

  return (
    <div className="bg-[#f8faf8] min-h-screen">
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
          {data.length > 0 && (
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
                    src={`http://127.0.0.1:8000/storage/${data[0].foto}`}
                    alt={data[0].judul}
                    onClick={() =>
                      setSelectedImage(
                        `http://127.0.0.1:8000/storage/${data[0].foto}`,
                      )
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
                    Dokumentasi Kegiatan
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
                    Galeri Santri TPQ
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
                    {data[0].judul}
                  </h2>

                  <p
                    className="
                    mt-4
                  
  text-justify

                    text-gray-700

                    text-sm

                    md:text-base

                    leading-7
                    "
                  >
                    Dokumentasi berbagai kegiatan santri TPQ Khairunnisa yang
                    berisi aktivitas belajar, mengaji, perlombaan dan momen
                    kebersamaan dalam membentuk generasi Qurani yang berakhlak
                    mulia.
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
        {data.length > 1 && (
          <div
            className="
  grid
  grid-cols-2
  md:grid-cols-4
  lg:grid-cols-5
  gap-4
"
          >
            {data.slice(1).map((item, index) => (
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
                `
                <img
                  src={`http://127.0.0.1:8000/storage/${item.foto}`}
                  alt={item.judul}
                  onClick={() =>
                    setSelectedImage(
                      `http://127.0.0.1:8000/storage/${item.foto}`,
                    )
                  }
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
        >
          <img
            src={selectedImage}
            alt="Preview"
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
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

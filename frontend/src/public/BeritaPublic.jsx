import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-putih04.jpg";
import { ChevronRight, User, CalendarDays, Eye, ThumbsUp } from "lucide-react";

const STORAGE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/api\/?$/, "");

export default function BeritaPublic() {
  const [berita, setBerita] = useState([]);

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      const res = await api.get("/berita");

      setBerita(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil berita:", err);

      setBerita([]);
    }
  };

  return (
    <div>
      {/* HERO */}

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
          {/* JUDUL */}

          <div className="text-center mb-5">
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-2">
              Berita TPQ Khairunnisa
            </h1>

            <p className="mt-1 text-xs md:text-sm text-gray-700 max-w-xl mx-auto">
              Informasi, kegiatan dan dokumentasi terbaru seputar TPQ
              Khairunnisa.
            </p>
          </div>

          {berita.length === 0 ? (
            <div
              className="bg-white/35 backdrop-blur-md border border-white/30 rounded-3xl
              shadow-lg p-10 text-center"
            >
              Belum ada berita tersedia.
            </div>
          ) : (
            <>
              {/* BERITA UTAMA */}

              <Link
                to={`/web/berita/${berita[0].id}`}
                className="block bg-white/20 backdrop-blur-xs border border-white
                rounded-3xl overflow-hidden shadow-lg hover:bg-white/30 transition"
              >
                <div className="grid md:grid-cols-2">
                  <img
                    src={
                      berita[0].foto
                        ? `${STORAGE_URL}/storage/${berita[0].foto}`
                        : ""
                    }
                    alt={berita[0].judul}
                    className="w-full h-52 md:h-80 object-cover"
                  />

                  <div className="p-5 md:p-7 flex flex-col justify-center">
                    <span className="inline-block w-fit text-xs px-3 py-1 rounded-full bg-gray-200">
                      Berita Utama
                    </span>

                    <h2 className="mt-3 text-xl md:text-3xl font-bold text-green-800">
                      {berita[0].judul}
                    </h2>

                    <div
                      className="mt-3 flex flex-wrap items-center gap-4 text-xs
                      md:text-sm text-gray-600"
                    >
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {berita[0].penulis || "Admin TPQ"}
                      </div>

                      <div className="flex items-center gap-1">
                        <CalendarDays size={14} />

                        {new Date(berita[0].created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700 text-sm md:text-base leading-6 text-justify">
                      {berita[0].isi?.substring(0, 300)}
                      ...
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-green-700 font-semibold">
                      Baca Selengkapnya
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* BERITA SEBELUMNYA */}

      {berita.length > 1 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-5">
              <h3 className="text-lg md:text-2xl font-bold text-green-800">
                Berita Sebelumnya
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {berita.slice(1).map((item) => (
                <Link
                  key={item.id}
                  to={`/web/berita/${item.id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl
                  hover:-translate-y-1 transition"
                >
                  <img
                    src={item.foto ? `${STORAGE_URL}/storage/${item.foto}` : ""}
                    alt={item.judul}
                    className="w-full h-36 md:h-44 object-cover"
                  />

                  <div className="p-3 space-y-0">
                    <h2 className="text-sm md:text-base font-bold text-green-700 line-clamp-2 leading-5">
                      {item.judul}
                    </h2>

                    <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] md:text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={11} />

                        {item.penulis || "Admin"}
                      </div>

                      <div className="flex items-center gap-1">
                        <CalendarDays size={11} />

                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-700">
                      Baca
                      <ChevronRight size={14} />
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

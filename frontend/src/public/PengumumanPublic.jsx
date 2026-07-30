import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import { ChevronRight } from "lucide-react";
export default function PengumumanPublic() {
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
    }
  };

  return (
    <div className="bg-[#f8faf8]">
      {/* HEADER */}

      <section
        className=" relative overflow-hidden pt-8 md:pt-16 pb-12 "
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}

        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Judul */}

          <div className="text-center mb-14">
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-8">
              Pengumuman TPQ Khairunnisa
            </h1>
            <p className=" mt-2 text-xs md:text-sm text-gray-700 max-w-xl mx-auto">
              Informasi dan pemberitahuan resmi untuk santri, guru dan wali
              santri.
            </p>
          </div>
          {/* List */}

          {pengumuman.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <p className="text-gray-500">Belum ada pengumuman tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pengumuman.map((item) => (
                <Link
                  key={item.id}
                  to={`/web/pengumuman/${item.id}`}
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
                        📌
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
                    leading-7
                    "
                    >
                      {item.isi?.length > 180
                        ? item.isi.substring(0, 180) + "..."
                        : item.isi}
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
                    Baca Selengkapnya
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

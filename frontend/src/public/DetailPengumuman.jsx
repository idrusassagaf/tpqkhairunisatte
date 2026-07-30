import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default function DetailPengumuman() {
  const { id } = useParams();

  const [pengumuman, setPengumuman] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/pengumuman");

      const data = res.data.data || res.data;

      const item = data.find((p) => String(p.id) === String(id));

      setPengumuman(item);
    } catch (err) {
      console.error(err);
    }
  };

  if (!pengumuman) {
    return <div className="p-10 text-center">Pengumuman tidak ditemukan</div>;
  }

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* HEADER */}

      <section
        className="relative overflow-hidden pt-8 md:pt-10 pb-8"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
          {/* Tombol kembali */}

          <Link
            to="/web/pengumuman"
            className="inline-flex items-center gap-2 bg-white/35 backdrop-blur-md
            border border-white/30 px-5 py-3 rounded-full shadow-lg transition text-green-700
            font-medium hover:bg-white/45 "
          >
            <ArrowLeft size={18} />
            Kembali ke Pengumuman
          </Link>

          {/* CARD */}

          <div
            className=" bg-white/35 border border-white/30 rounded-3xl shadow-lg
            mt-6 p-5 md:p-8"
          >
            {/* STATUS */}

            <div className="mb-6">
              <span
                className="inline-block bg-white/60 backdrop-blur-sm text-green-700
                px-4 py-2 rounded-full text-xs font-semibold "
              >
                {pengumuman.status}
              </span>
            </div>

            {/* JUDUL */}

            <h1 className="text-2xl md:text-4xl font-bold text-green-800 leading-tight">
              {pengumuman.judul}
            </h1>

            {/* TANGGAL */}

            <div className="flex items-center gap-2 text-gray-600 text-sm mt-3 mb-5">
              <CalendarDays size={18} />
              Berlaku sampai: {pengumuman.tanggal_berakhir}
            </div>

            {/* ISI */}

            <div className="text-gray-700 text-sm md:text-base leading-7 text-justify whitespace-pre-line">
              {pengumuman.isi}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

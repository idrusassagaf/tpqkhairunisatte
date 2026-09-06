import { useEffect, useState } from "react";
import { api } from "../api";
import videoTPQ from "../assets/video/clip2tpq.mp4";
import heroImage from "../assets/hero-putih04.jpg";

export default function ProfilTPQ() {
  const [guru, setGuru] = useState([]);
  const [pengaturan, setPengaturan] = useState(null);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [guruResponse, pengaturanResponse] = await Promise.all([
        api.get("/master-data"),
        api.get("/pengaturan-sistem"),
      ]);

      setGuru(guruResponse.data?.data?.guru || []);

      const dataPengaturan = pengaturanResponse.data?.data || null;

      setPengaturan(dataPengaturan);
    } catch (err) {
      console.error("Gagal mengambil data Profil TPQ:", err);

      setError(true);
      setPengaturan(null);
      setGuru([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>

          <p className="text-gray-500 text-sm">Memuat profil TPQ...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !pengaturan) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Profil TPQ belum dapat ditampilkan
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Data pengaturan sistem gagal dimuat.
          </p>

          <button
            type="button"
            onClick={loadData}
            className="
              mt-5
              px-5
              py-2.5
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              text-sm
              transition
            "
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const namaTPQ = pengaturan.nama_tpq || "";

  const profil = pengaturan.profil || "";
  const visi = pengaturan.visi || "";
  const misi = pengaturan.misi || "";

  const nilaiAkhlak = pengaturan.nilai_akhlak || "";
  const nilaiQuran = pengaturan.nilai_quran || "";
  const nilaiDisiplin = pengaturan.nilai_disiplin || "";
  const nilaiPrestasi = pengaturan.nilai_prestasi || "";

  // ============================================================
  // FORMAT MISI
  // ============================================================

  const daftarMisi = misi
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  return (
    <div>
      {/* ======================================================
          HEADER + TENTANG KAMI
      ====================================================== */}

      <section
        className="relative overflow-hidden flex items-start pt-16 md:pt-24"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}

        <div className="absolute inset-0 bg-white/5 backdrop-blur-[0px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* ==================================================
                VIDEO
            ================================================== */}

            <div className="flex justify-center order-1 lg:-mt-16">
              <div className="w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl bg-white p-3">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="
                    w-full
                    h-[220px]
                    sm:h-[280px]
                    md:h-[350px]
                    rounded-2xl
                    object-cover
                  "
                >
                  <source src={videoTPQ} type="video/mp4" />
                </video>
              </div>
            </div>

            {/* ==================================================
                PROFIL TPQ
            ================================================== */}

            <div
              className="
                flex
                flex-col
                justify-start
                order-2
                mt-2
                lg:-mt-16
              "
            >
              <span
                className="
                  uppercase
                  tracking-[3px]
                  md:tracking-[6px]
                  text-lg
                  md:text-xl
                  text-green-700
                  font-extralight
                "
              >
                Profil {namaTPQ}
              </span>

              <div
                className="
                  mt-2
                  space-y-4
                  text-gray-700
                  font-extralight
                  leading-7
                  text-justify
                  text-sm
                  md:text-base
                "
              >
                <p>{profil}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TIM PENGAJAR
      ====================================================== */}

      <section className="py-12 md:py-16 bg-[#f6faf7]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Tim Pengajar</h2>

            <p className="text-gray-500 text-lg mt-3">
              Ustadz dan Ustadzah {namaTPQ}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {guru.map((item) => (
              <div
                key={item.id}
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-green-100
                  shadow-md
                  hover:shadow-lg
                  transition-all
                  duration-300
                  px-3 md:px-5
                  py-4 md:py-6
                  text-center
                "
              >
                {/* FOTO */}

                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.nama_guru}
                      className="
                        w-full
                        h-full
                        rounded-full
                        object-cover
                        border-2
                        border-green-400
                      "
                    />
                  ) : (
                    <div className="w-full h-full bg-green-100 rounded-full"></div>
                  )}
                </div>

                {/* NAMA */}

                <h3 className="font-extralight text-lg md:text-xl text-green-600">
                  {item.nama_guru}
                </h3>

                {/* NIG + PENDIDIKAN */}

                <p className="text-black text-xs md:text-sm mt-2">
                  NIG : {item.nig} | Pendidikan {item.pendidikan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          VISI MISI NILAI
      ====================================================== */}

      <section className="py-16 -mt-8 bg-[#f8faf8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:-mt-8">
            {/* ==================================================
                KIRI - VISI & MISI
            ================================================== */}

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div
                className="rounded-2xl p-5 mb-6 overflow-hidden relative"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-white/20"></div>

                <h3 className="relative text-2xl md:text-3xl font-bold text-green-800 text-center">
                  Visi & Misi
                </h3>
              </div>

              <div className="space-y-6">
                {/* ==================================================
                    VISI
                ================================================== */}

                <div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">
                    VISI
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-6
                      text-justify
                    "
                  >
                    {visi}
                  </p>
                </div>

                {/* ==================================================
                    MISI
                ================================================== */}

                <div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">
                    MISI
                  </h4>

                  <div className="space-y-1">
                    {daftarMisi.length > 0 ? (
                      daftarMisi.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="font-semibold text-green-700 min-w-5">
                            {index + 1}.
                          </span>

                          <p className="text-gray-700 text-sm md:text-[15px] leading-5 text-justify">
                            {item}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm md:text-[15px]">
                        Belum ada data misi.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                KANAN - NILAI-NILAI
            ================================================== */}

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div
                className="rounded-2xl p-5 mb-6 overflow-hidden relative"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-white/20"></div>

                <h3 className="relative text-2xl md:text-3xl font-bold text-green-800 text-center">
                  Nilai-Nilai Kami
                </h3>
              </div>

              <div className="space-y-4">
                {/* AKHLAK */}

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    1. Akhlak
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-5 text-justify mt-1">
                    {nilaiAkhlak}
                  </p>
                </div>

                {/* QURANI */}

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    2. Qurani
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-5 text-justify mt-1">
                    {nilaiQuran}
                  </p>
                </div>

                {/* DISIPLIN */}

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    3. Disiplin
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-5 text-justify mt-1">
                    {nilaiDisiplin}
                  </p>
                </div>

                {/* PRESTASI */}

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    4. Prestasi
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-5 text-justify mt-1">
                    {nilaiPrestasi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api";
import videoTPQ from "../assets/video/clip2tpq.mp4";
import heroImage from "../assets/hero-putih04.jpg";

export default function ProfilTPQ() {
  const [guru, setGuru] = useState([]);

  useEffect(() => {
    loadGuru();
  }, []);

  const loadGuru = async () => {
    try {
      const res = await api.get("/master-data");

      setGuru(res.data.data.guru || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* HEADER + TENTANG KAMI */}

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
            {/* VIDEO */}

            <div className="flex justify-center order-1 lg:-mt-16">
              <div className="w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl bg-white p-3">
                {" "}
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

            {/* TULISAN */}

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
                Profil TPQ Khairunissa
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
                <p>
                  TPQ Khairunnisa merupakan lembaga pendidikan Al-Qur'an yang
                  berfokus pada pembinaan akhlak, kemampuan membaca Al-Qur'an,
                  hafalan surah, doa harian, praktik ibadah, dan pendidikan
                  dasar Islam bagi anak-anak.
                </p>

                <p>
                  Dengan dukungan tenaga pengajar yang berpengalaman, TPQ
                  Khairunnisa berkomitmen mencetak generasi Qurani yang cerdas,
                  disiplin, mandiri, dan berakhlakul karimah. Dengan dukungan
                  tenaga pengajar yang berpengalaman, TPQ Khairunnisa
                  berkomitmen mencetak generasi Qurani yang cerdas, disiplin,
                  mandiri, dan berakhlakul karimah. tenaga pengajar yang
                  berpengalaman, TPQ Khairunnisa berkomitmen
                </p>

                <p>
                  Dengan dukungan tenaga pengajar yang berpengalaman, TPQ
                  Khairunnisa berkomitmen mencetak generasi Qurani yang cerdas,
                  disiplin, mandiri, dan berakhlakul karimah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIM PENGAJAR */}
      <section className="py-12 md:py-16 bg-[#f6faf7]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Tim Pengajar</h2>

            <p className="text-gray-500 text-lg mt-3">
              Ustadz dan Ustadzah TPQ Khairunnisa
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

      {/* VISI MISI NILAI */}

      <section className="py-16 -mt-8 bg-[#f8faf8]">
        <div className="max-w-7xl mx-auto px-6">
          {/* JUDUL */}
          <div className="grid lg:grid-cols-2 gap-8 lg:-mt-8">
            {/* KIRI */}

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
                {/* VISI */}

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
                    Menjadi lembaga pendidikan Al-Qur'an yang menghasilkan
                    generasi Qurani yang beriman, berilmu dan berakhlak mulia.
                  </p>
                </div>

                {/* MISI */}

                {/* MISI */}

                <div>
                  <h4 className="text-2xl font-bold text-green-700 mb-2">
                    MISI
                  </h4>

                  <div className="space-y-0.5">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-700 min-w-5">
                        1.
                      </span>

                      <p className="text-gray-700 text-sm md:text-[15px] leading-4">
                        Mengajarkan Al-Qur'an dengan baik dan benar.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-700 min-w-5">
                        2.
                      </span>

                      <p className="text-gray-700 text-sm md:text-[15px] leading-4">
                        Membiasakan akhlak Islami dalam kehidupan sehari-hari.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-700 min-w-5">
                        3.
                      </span>

                      <p className="text-gray-700 text-sm md:text-[15px] leading-4">
                        Menumbuhkan kecintaan terhadap Al-Qur'an.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-700 min-w-5">
                        4.
                      </span>

                      <p className="text-gray-700 text-sm md:text-[15px] leading-4">
                        Membentuk karakter santri yang disiplin dan mandiri.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN */}

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

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    1. Akhlak
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-4 text-justify mt-1">
                    Membiasakan adab dan akhlak Islami dalam kehidupan
                    sehari-hari.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    2. Qurani
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-4 text-justify mt-1">
                    Menumbuhkan kecintaan terhadap Al-Qur'an sejak usia dini.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    3. Disiplin
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-4 text-justify mt-0.5">
                    Melatih tanggung jawab dan kedisiplinan santri.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl text-green-700">
                    4. Prestasi
                  </h4>

                  <p className="text-gray-700 text-sm md:text-[15px] leading-4 text-justify mt-0.5">
                    Mendorong santri untuk terus berkembang dan berprestasi.
                    Mendorong santri untuk terus berkembang dan berprestasi.
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

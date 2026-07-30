import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import heroImage from "../assets/hero-putih04.jpg";
import { Users, BookOpen, BookMarked, GraduationCap } from "lucide-react";

export default function Home() {
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);

  useEffect(() => {
    loadSantri();
    loadGuru();
  }, []);

  const loadSantri = async () => {
    try {
      const res = await api.get("/santri");
      setSantri(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGuru = async () => {
    try {
      const res = await api.get("/master-data");

      setGuru(res.data.data.guru || []);
    } catch (err) {
      console.error(err);
    }
  };

  const totalSantri = santri.length;

  const totalIqra = santri.filter((s) => s.kelas === "Iqra").length;

  const totalQuran = santri.filter((s) => s.kelas === "Al Quran").length;

  const totalGuru = guru.length;

  return (
    <div>
      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:py-40 w-full min-h-screen flex flex-col justify-center -translate-y-4 md:translate-y-0">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[3px] text-xs md:text-base text-gray-800 mb-4">
              Ahlan wa sahlan
            </p>

            <h1 className="text-4xl md:text-5xl font-extralight leading-tight">
              TPQ KHAIRUNNISA
            </h1>

            <p className="mt-4 text-lg md:text-2xl font-extralight text-green-700">
              Membentuk Generasi Quran'i Berakhlak
            </p>

            <div className="flex flex-wrap gap-4 mt-28 justify-center md:justify-start">
              <Link
                to="/web/login"
                className="bg-green-600 hover:bg-green-700 px-5 md:px-8 py-3 md:py-4 rounded-xl font-extralight inline-flex items-center"
              >
                Pendaftaran Santri
              </Link>

              <Link
                to="/web/kontak"
                className="bg-green-600 hover:bg-green-700 px-5 md:px-8 py-3 md:py-4 rounded-xl font-extralight inline-flex items-center"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="py-14 bg-[#f6faf7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* SANTRI */}
            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <Users
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalSantri}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-sm md:text-base text-gray-600 font-medium">
                Jumlah Santri
              </p>
            </div>

            {/* IQRA */}
            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <BookOpen
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalIqra}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-sm md:text-base text-gray-600 font-medium">
                Santri Iqra
              </p>
            </div>

            {/* QURAN */}
            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <BookMarked
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalQuran}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-sm md:text-base text-gray-600 font-medium">
                Santri Al-Qur'an
              </p>
            </div>

            {/* GURU */}
            <div className="bg-white rounded-3xl p-5 text-center border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <GraduationCap
                size={34}
                className="mx-auto text-green-600 mb-3"
                strokeWidth={1.5}
              />

              <h3 className="text-3xl md:text-4xl font-bold text-green-700">
                {totalGuru}
              </h3>

              <div className="w-12 h-[2px] bg-green-500 mx-auto my-3 rounded-full"></div>

              <p className="text-sm md:text-base text-gray-600 font-medium">
                Jumlah Guru
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="bg-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extralight text-gray-800">
              Program Pembelajaran
            </h2>

            <p className="text-green-600 text-lg mt-3">
              Program unggulan TPQ Khairunnisa dalam membentuk Generasi Qurani
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* IQRA */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                Program Iqra
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Pembelajaran dasar membaca huruf hijaiyah menggunakan metode
                Iqra secara bertahap mulai dari pengenalan huruf, harakat,
                hingga mampu membaca dengan lancar dan benar.
              </p>
            </div>

            {/* AL-QURAN */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                Program Al-Qur'an
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Pembelajaran membaca Al-Qur'an dengan memperhatikan kaidah
                tajwid yang benar serta peningkatan kualitas bacaan agar santri
                mampu membaca dengan fasih dan tartil.
              </p>
            </div>

            {/* TAHFIDZ */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-xl text-green-700 mb-4">
                Program Tahfidz
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Program hafalan surat-surat pendek, doa harian, dan pembinaan
                akhlak Islami yang membantu santri membangun karakter Qurani
                sejak usia dini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extralight text-gray-800">
              Mengapa Memilih TPQ Khairunnisa?
            </h2>

            <p className="text-gray-500 mt-3">
              Pendidikan Islami dengan pembelajaran yang terarah dan
              menyenangkan
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* CARD 1 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                Belajar Iqra & Al-Qur'an
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Santri dibimbing secara bertahap mulai dari membaca Iqra hingga
                Al-Qur'an dengan memperhatikan tajwid dan makharijul huruf yang
                benar.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                Praktik Ibadah
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Pembelajaran tidak hanya teori, tetapi juga praktik ibadah
                seperti shalat, doa harian, wudhu, dan pembiasaan adab Islami
                dalam kehidupan sehari-hari.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                Pembinaan Akhlak
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Pembentukan karakter menjadi bagian penting dalam proses belajar
                sehingga santri tumbuh menjadi pribadi yang santun, disiplin,
                dan berakhlakul karimah.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-lg text-green-700 mb-4">
                Guru Berpengalaman
              </h3>

              <p className="text-gray-600 text-justify leading-6">
                Proses pembelajaran dibimbing oleh ustadz dan ustadzah yang
                berpengalaman serta memiliki komitmen dalam mendidik generasi
                Qurani.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PERSYARATAN PENDAFTARAN */}
      <section className="py-16 bg-[#f6faf7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extralight text-gray-800">
              Persyaratan Pendaftaran Santri
            </h2>

            <p className="text-green-600 mt-3">
              Persiapkan dokumen berikut saat melakukan pendaftaran santri baru
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD 1 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                Pendaftaran Gratis
              </h3>

              <p className="text-gray-600 mt-3">
                Tidak dipungut biaya pendaftaran dan selama santri belajar di
                TPQ.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                Mengisi Form Pendaftaran
              </h3>

              <p className="text-gray-600 mt-3">
                Formulir diisi langsung oleh Admin TPQ saat pendaftaran.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                Fotocopy Kartu Keluarga
              </h3>

              <p className="text-gray-600 mt-3">
                Membawa fotocopy Kartu Keluarga sebagai data pendukung.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <h3 className="font-bold text-lg text-green-700">
                Fotocopy KTP Orang Tua
              </h3>

              <p className="text-gray-600 mt-3">
                Membawa fotocopy KTP orang tua atau wali santri.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

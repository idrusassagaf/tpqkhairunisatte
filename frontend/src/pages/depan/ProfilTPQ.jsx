import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";
import videoTPQ from "../../assets/video/clip2tpq.mp4";
import heroImage from "../../assets/hero-putih04.jpg";

export default function ProfilTPQ() {
  const { language } = useOutletContext();

  const profilText = {
    id: {
      loading: "Memuat profil TPQ...",
      errorTitle: "Profil TPQ belum dapat ditampilkan",
      errorDescription: "Data pengaturan sistem gagal dimuat.",
      retry: "Coba Lagi",
      profile: "Profil",
      teachingTeam: "Tim Pengajar",
      teachersDescription: "Ustadz dan Ustadzah",
      visionMission: "Visi & Misi",
      vision: "VISI",
      mission: "MISI",
      noMission: "Belum ada data misi.",
      ourValues: "Nilai-Nilai Kami",
      akhlak: "Akhlak",
      qurani: "Qurani",
      discipline: "Disiplin",
      achievement: "Prestasi",
      nig: "NIG",
      education: "Pendidikan",
    },

    en: {
      loading: "Loading TPQ profile...",
      errorTitle: "TPQ profile cannot be displayed",
      errorDescription: "System settings data failed to load.",
      retry: "Try Again",
      profile: "Profile",
      teachingTeam: "Teaching Team",
      teachersDescription: "Ustadz and Ustadzah",
      visionMission: "Vision & Mission",
      vision: "VISION",
      mission: "MISSION",
      noMission: "No mission data available.",
      ourValues: "Our Values",
      akhlak: "Character",
      qurani: "Qur'anic",
      discipline: "Discipline",
      achievement: "Achievement",
      nig: "NIG",
      education: "Education",
    },

    ar: {
      loading: "جارٍ تحميل ملف TPQ...",
      errorTitle: "تعذر عرض ملف TPQ",
      errorDescription: "تعذر تحميل بيانات إعدادات النظام.",
      retry: "حاول مرة أخرى",
      profile: "نبذة عن",
      teachingTeam: "فريق التدريس",
      teachersDescription: "الأساتذة والأستاذات",
      visionMission: "الرؤية والرسالة",
      vision: "الرؤية",
      mission: "الرسالة",
      noMission: "لا توجد بيانات للرسالة.",
      ourValues: "قيمنا",
      akhlak: "الأخلاق",
      qurani: "القرآنية",
      discipline: "الانضباط",
      achievement: "الإنجاز",
      nig: "NIG",
      education: "التعليم",
    },
  };

  const t = profilText[language] || profilText.id;
  const isArabic = language === "ar";

  const [guru, setGuru] = useState([]);
  const [pengaturan, setPengaturan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // TERJEMAHAN
  //
  // Sudah diterjemahkan & disimpan oleh backend saat admin
  // menyimpan Pengaturan Sistem (lihat PengaturanSistemController).
  // Di sini tinggal dibaca, tidak ada panggilan AI lagi.
  // =========================================================

  const translatedContent =
    language !== "id" ? pengaturan?.translations?.[language] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6faf7] p-6 md:p-10" dir={isArabic ? "rtl" : "ltr"}>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-1/2" />

          <Skeleton className="h-56 w-full rounded-3xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />

            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !pengaturan) {
    return (
      <div className="min-h-screen bg-[#f6faf7] flex items-center justify-center px-6">
        <div className="text-center">
          <h2
            className="text-xl font-semibold text-gray-700"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {t.errorTitle}
          </h2>

          <p
            className="text-gray-500 text-sm mt-2"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {t.errorDescription}
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
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  const namaTPQ = pengaturan.nama_tpq || "";

  const profil = pengaturan.profil || "";
  const visi = pengaturan.visi || "";
  const misi = pengaturan.misi || "";

  const nilaiAkhlak = pengaturan.nilai_akhlak || "";
  const nilaiQuran = pengaturan.nilai_quran || "";
  const nilaiDisiplin = pengaturan.nilai_disiplin || "";
  const nilaiPrestasi = pengaturan.nilai_prestasi || "";

  const displayedProfil =
    language === "id" ? profil : translatedContent?.profil || profil;

  const displayedVisi =
    language === "id" ? visi : translatedContent?.visi || visi;

  const displayedMisi =
    language === "id" ? misi : translatedContent?.misi || misi;

  const displayedNilaiAkhlak =
    language === "id"
      ? nilaiAkhlak
      : translatedContent?.nilai_akhlak || nilaiAkhlak;

  const displayedNilaiQuran =
    language === "id"
      ? nilaiQuran
      : translatedContent?.nilai_quran || nilaiQuran;

  const displayedNilaiDisiplin =
    language === "id"
      ? nilaiDisiplin
      : translatedContent?.nilai_disiplin || nilaiDisiplin;

  const displayedNilaiPrestasi =
    language === "id"
      ? nilaiPrestasi
      : translatedContent?.nilai_prestasi || nilaiPrestasi;

  const daftarMisi = displayedMisi
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  return (
    <div>
      <section
        className="relative overflow-hidden flex items-start pt-16 md:pt-24"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[0px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
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
                dir={isArabic ? "rtl" : "ltr"}
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
                {t.profile} {namaTPQ}
              </span>

              <div
                className="
                  mt-2
                  space-y-4
                  text-gray-700
                  font-extralight
                  leading-5 md:leading-7
                  text-justify
                  text-sm
                  md:text-base
                "
              >
                <p dir={isArabic ? "rtl" : "ltr"}>{displayedProfil}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#f6faf7]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold"
              dir={isArabic ? "rtl" : "ltr"}
            >
              {t.teachingTeam}
            </h2>

            <p
              className="text-green-500 text-lg mt-3"
              dir={isArabic ? "rtl" : "ltr"}
            >
              {t.teachersDescription} <br /> {namaTPQ} Ternate
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
            {guru.map((item) => (
              <div
                key={item.id}
                className="
                  bg-white
                  rounded-xl
                  border border-green-100
                  shadow-sm
                  hover:shadow-md
                  transition-all
                  duration-300
                  px-2 py-3
                  text-center
                  flex flex-col items-center justify-center
                  min-h-[150px]
                "
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 overflow-hidden rounded-full border border-green-200 bg-gradient-to-br from-green-100 to-emerald-200 shadow-inner">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.nama_guru || "Guru"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs font-bold text-green-700">
                      {String(item.nama_guru || "?")
                        .trim()
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase() || "T"}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm text-black leading-tight break-words">
                  {item.nama_guru}
                </h3>

                <p
                  className="text-[8px] sm:text-[9px] md:text-[11px] mt-1.5 text-black font-medium break-all"
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {t.nig} : {item.nig || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 -mt-8 bg-[#f8faf8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:-mt-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div
                className="rounded-2xl p-5 mb-6 overflow-hidden relative"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]"></div>

                <h3
                  className="relative text-2xl md:text-3xl font-bold text-green-800 text-center"
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {t.visionMission}
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4
                    className="text-2xl font-bold text-green-700 mb-2"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {t.vision}
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-6
                      text-justify
                    "
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {displayedVisi}
                  </p>
                </div>

                <div>
                  <h4
                    className="text-2xl font-bold text-green-700 mb-2"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {t.mission}
                  </h4>

                  <div className="space-y-1" dir={isArabic ? "rtl" : "ltr"}>
                    {daftarMisi.length > 0 ? (
                      daftarMisi.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 ${
                            isArabic ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="font-semibold text-green-700 min-w-5">
                            {index + 1}.
                          </span>

                          <p
                            className="
                              text-gray-700
                              text-sm
                              md:text-[15px]
                              leading-5
                              text-justify
                              flex-1
                            "
                            dir={isArabic ? "rtl" : "ltr"}
                          >
                            {item}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p
                        className="text-gray-500 text-sm md:text-[15px]"
                        dir={isArabic ? "rtl" : "ltr"}
                      >
                        {t.noMission}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div
                className="rounded-2xl p-5 mb-6 overflow-hidden relative"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]"></div>

                <h3
                  className="relative text-2xl md:text-3xl font-bold text-green-800 text-center"
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {t.ourValues}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4
                    className="font-bold text-xl text-green-700"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    1. {t.akhlak}
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-5
                      text-justify
                      mt-1
                    "
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {displayedNilaiAkhlak}
                  </p>
                </div>

                <div>
                  <h4
                    className="font-bold text-xl text-green-700"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    2. {t.qurani}
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-5
                      text-justify
                      mt-1
                    "
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {displayedNilaiQuran}
                  </p>
                </div>

                <div>
                  <h4
                    className="font-bold text-xl text-green-700"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    3. {t.discipline}
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-5
                      text-justify
                      mt-1
                    "
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {displayedNilaiDisiplin}
                  </p>
                </div>

                <div>
                  <h4
                    className="font-bold text-xl text-green-700"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    4. {t.achievement}
                  </h4>

                  <p
                    className="
                      text-gray-700
                      text-sm
                      md:text-[15px]
                      leading-5
                      text-justify
                      mt-1
                    "
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {displayedNilaiPrestasi}
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

import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import {
  Users,
  UserRound,
  BookOpen,
  BookMarked,
  Award,
  ClipboardCheck,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const [santri, setSantri] = useState([]);
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/master-data");

      setSantri(res?.data?.data?.santri || []);
      setGuru(res?.data?.data?.guru || []);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= DATA RINGKASAN =================

  const jumlahIqra = useMemo(() => {
    return santri.filter((s) => (s.kelas || "").trim().toLowerCase() === "iqra")
      .length;
  }, [santri]);

  const jumlahQuran = useMemo(() => {
    return santri.filter((s) => {
      const kelas = (s.kelas || "").trim().toLowerCase();

      return (
        kelas === "al quran" || kelas === "alquran" || kelas === "al-qur'an"
      );
    }).length;
  }, [santri]);

  const jumlahLaki = useMemo(() => {
    return santri.filter((s) => {
      const jk = String(s.jenis_kelamin || s.jk || "").toLowerCase();

      return jk === "l" || jk === "laki-laki" || jk === "laki laki";
    }).length;
  }, [santri]);

  const jumlahPerempuan = useMemo(() => {
    return santri.filter((s) => {
      const jk = String(s.jenis_kelamin || s.jk || "").toLowerCase();

      return jk === "p" || jk === "perempuan";
    }).length;
  }, [santri]);

  // ================= TANGGAL =================

  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ================= STATISTIK =================

  const statistik = [
    {
      title: "Total Santri",
      value: santri.length,
      description: "Santri terdaftar",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
    {
      title: "Total Guru",
      value: guru.length,
      description: "Guru terdaftar",
      icon: UserRound,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Kelas Iqra",
      value: jumlahIqra,
      description: "Santri Iqra",
      icon: BookOpen,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      title: "Kelas Al-Qur'an",
      value: jumlahQuran,
      description: "Santri Al-Qur'an",
      icon: BookMarked,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* DASHBOARD */}

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
              Dashboard
            </h1>
          </div>

          {/* TANGGAL */}

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl px-4 py-3 w-fit shadow-md">
            <CalendarDays size={20} className="text-purple-700" />

            <div>
              <div className="text-xs text-gray-500">Hari ini</div>

              <div className="text-sm font-semibold text-gray-800">
                {tanggalHariIni}
              </div>
            </div>
          </div>
        </div>

        {/* ================= STATISTIK ================= */}

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Ringkasan Data
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Data utama TPQ Khairunissa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statistik.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>

                      <div className="mt-2">
                        {loading ? (
                          <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
                        ) : (
                          <span className="text-3xl font-bold text-gray-800">
                            {item.value}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        {item.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}
                    >
                      <Icon size={21} className={item.iconColor} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= KOMPOSISI SANTRI ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* KOMPOSISI KELAS */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen size={20} className="text-purple-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Komposisi Kelas</h2>

                <p className="text-xs text-gray-500">
                  Distribusi santri berdasarkan kelas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* IQRA */}

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">Iqra</span>

                  <span className="font-semibold text-gray-800">
                    {loading ? "-" : jumlahIqra}
                  </span>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{
                      width:
                        santri.length > 0
                          ? `${(jumlahIqra / santri.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* AL-QURAN */}

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">Al-Qur'an</span>

                  <span className="font-semibold text-gray-800">
                    {loading ? "-" : jumlahQuran}
                  </span>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width:
                        santri.length > 0
                          ? `${(jumlahQuran / santri.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* JENIS KELAMIN */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-700" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Komposisi Santri
                </h2>

                <p className="text-xs text-gray-500">
                  Berdasarkan jenis kelamin
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <div className="text-xs text-blue-600">Laki-laki</div>

                <div className="mt-1 text-2xl font-bold text-blue-800">
                  {loading ? "-" : jumlahLaki}
                </div>

                <div className="text-[11px] text-blue-500 mt-1">Santri</div>
              </div>

              <div className="rounded-xl bg-pink-50 border border-pink-100 p-4">
                <div className="text-xs text-pink-600">Perempuan</div>

                <div className="mt-1 text-2xl font-bold text-pink-800">
                  {loading ? "-" : jumlahPerempuan}
                </div>

                <div className="text-[11px] text-pink-500 mt-1">Santri</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MENU CEPAT ================= */}

        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Menu Cepat</h2>

            <p className="text-xs text-gray-500 mt-1">
              Akses cepat ke data utama
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* MASTER DATA */}

            <button
              type="button"
              onClick={() => (window.location.href = "/master-data")}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users size={20} className="text-purple-700" />
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-purple-600 transition"
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">Master Data</h3>

              <p className="mt-1 text-xs text-gray-500">
                Pendaftaran dan Kelola Data Santri dan Guru
              </p>
            </button>

            {/* MASTER PROGRES */}

            <button
              type="button"
              onClick={() => (window.location.href = "/master-progres")}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ClipboardCheck size={20} className="text-blue-700" />
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-blue-600 transition"
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Master Progres
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Kelola data dan progres Iqra dan Al-Qur'an
              </p>
            </button>

            {/* MASTER HAFALAN */}

            <button
              type="button"
              onClick={() => (window.location.href = "/master-hafalan")}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Award size={20} className="text-emerald-700" />
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-emerald-600 transition"
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Master Hafalan
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Kelola data dan progres hafalan santri
              </p>
            </button>

            {/* DATA SANTRI */}

            <button
              type="button"
              onClick={() => (window.location.href = "/data-santri")}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <BookMarked size={20} className="text-amber-700" />
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-amber-600 transition"
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">Data Santri</h3>

              <p className="mt-1 text-xs text-gray-500">
                Lihat seluruh data santri dan orang tua
              </p>
            </button>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-gray-400">
            TPQ Khairunissa • Sistem Informasi Manajemen
          </p>
        </div>
      </div>
    </div>
  );
}

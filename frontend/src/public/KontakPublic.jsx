import { useEffect, useState } from "react";
import heroImage from "../assets/hero-putih04.jpg";
import { MapPin, Phone, Mail, Clock, Loader2, AlertCircle } from "lucide-react";
import { api } from "../api";

export default function KontakPublic() {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PENGATURAN SISTEM
  // ============================================================
  useEffect(() => {
    loadPengaturan();
  }, []);

  const loadPengaturan = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/pengaturan-sistem");

      const data = response.data?.data;

      if (!data) {
        throw new Error("Data pengaturan sistem tidak ditemukan.");
      }

      setSetting(data);
    } catch (err) {
      console.error("Gagal mengambil pengaturan sistem:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil data pengaturan sistem.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT NOMOR WHATSAPP
  // ============================================================
  const getWhatsAppNumber = (phone) => {
    if (!phone) return "";

    let number = String(phone).replace(/\D/g, "");

    if (number.startsWith("0")) {
      number = "62" + number.substring(1);
    } else if (!number.startsWith("62")) {
      number = "62" + number;
    }

    return number;
  };

  // ============================================================
  // ALAMAT LENGKAP
  // ============================================================
  const getAlamatLengkap = () => {
    if (!setting) return "";

    const bagianAlamat = [
      setting.alamat,
      setting.kelurahan ? `Kelurahan ${setting.kelurahan}` : "",
      setting.kecamatan ? `Kecamatan ${setting.kecamatan}` : "",
      setting.kota || "",
      setting.provinsi || "",
    ].filter(Boolean);

    return bagianAlamat.join(", ");
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="bg-[#f8faf8] min-h-screen">
        <section
          className="relative overflow-hidden pt-16 md:pt-20 pb-12 min-h-[500px]"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/10"></div>

          <div className="relative z-10 flex min-h-[400px] items-center justify-center px-4">
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Loader2 size={32} className="animate-spin text-green-600" />

              <span className="text-sm">Memuat informasi kontak...</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="bg-[#f8faf8] min-h-screen">
        <section
          className="relative overflow-hidden pt-16 md:pt-20 pb-12 min-h-[500px]"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/10"></div>

          <div className="relative z-10 flex min-h-[400px] items-center justify-center px-4">
            <div className="flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const whatsappNumber = getWhatsAppNumber(setting?.no_hp);

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* HEADER */}

      <section
        className="relative overflow-hidden pt-16 md:pt-20 pb-12"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 -mt-4 md:-mt-6">
          {/* JUDUL */}

          <div className="text-center mb-12">
            <h1
              className="
                text-3xl
                sm:text-4xl
                md:text-4xl
                font-bold
                text-green-800
                leading-tight
                mt-2
              "
            >
              Kontak {setting?.nama_tpq || "TPQ Khairunissa"}
            </h1>

            <p
              className="
                mt-2
                text-gray-700
                text-xs
                sm:text-sm
                md:text-sm
                max-w-xl
                mx-auto
                font-base
              "
            >
              Layanan informasi dan komunikasi{" "}
              {setting?.nama_tpq || "TPQ Khairunissa"}
            </p>
          </div>

          {/* CARD */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-5
              md:gap-8
              items-start
              lg:items-start
            "
          >
            {/* ==================================================
                KIRI
            ================================================== */}

            <div
              className="
                bg-white/35
                backdrop-blur-xs
                border
                border-white/30
                rounded-3xl
                shadow-lg
                p-5 md:p-8
                self-start
              "
            >
              <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-4">
                Informasi Kontak
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ALAMAT */}

                <div className="flex gap-3">
                  <MapPin
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Alamat</h3>

                    <p className="text-gray-600 text-sm">
                      {getAlamatLengkap() || "Belum diatur"}
                    </p>
                  </div>
                </div>

                {/* WHATSAPP */}

                <div className="flex gap-3">
                  <Phone
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">WhatsApp</h3>

                    <p className="text-gray-600 text-sm">
                      {setting?.no_hp || "Belum diatur"}
                    </p>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="flex gap-3">
                  <Mail
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Email</h3>

                    <p className="text-gray-600 text-sm break-all">
                      {setting?.email || "Belum diatur"}
                    </p>
                  </div>
                </div>

                {/* JAM */}

                <div className="flex gap-3">
                  <Clock
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Jam Operasional</h3>

                    <p className="text-gray-600 text-sm">Senin - Sabtu</p>

                    <p className="text-gray-600 text-sm">18.00 - 20.30 WIT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                KANAN
            ================================================== */}

            <div
              className="
                bg-white/35
                backdrop-blur-xs
                border
                border-white/30
                rounded-3xl
                shadow-lg
                p-5 md:p-8
                self-start
              "
            >
              <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-6">
                Hubungi Admin {setting?.nama_tpq || "TPQ"}
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-6 mb-5 text-justify">
                Silakan hubungi Admin {setting?.nama_tpq || "TPQ Khairunissa"}{" "}
                untuk berbicara langsung atau melalui pesan apabila anda
                membutuhkan informasi ataupun layanan lainnya tentang{" "}
                {setting?.nama_tpq || "TPQ Khairunissa"}.
              </p>

              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    justify-center
                    items-center
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    px-8
                    py-3
                    rounded-2xl
                    font-semibold
                    transition
                    w-full
                    md:w-auto
                  "
                >
                  Hubungi via WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="
                    inline-flex
                    justify-center
                    items-center
                    bg-gray-400
                    text-white
                    px-8
                    py-3
                    rounded-2xl
                    font-semibold
                    cursor-not-allowed
                    w-full
                    md:w-auto
                  "
                >
                  WhatsApp Belum Diatur
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

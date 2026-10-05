import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import heroImage from "../../assets/hero-putih04.jpg";
import { MapPin, Phone, Mail, Clock, Loader2, AlertCircle } from "lucide-react";

import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";

export default function KontakPublic() {
  const { language } = useOutletContext();

  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const translations = {
    id: {
      loading: "Memuat informasi kontak...",
      address: "Alamat",
      whatsapp: "WhatsApp",
      email: "Email",
      operatingHours: "Jam Operasional",
      days: "Senin - Sabtu",
      contactInfo: "Informasi Kontak",
      contactAdmin: "Hubungi Admin",
      serviceDescription: "Layanan informasi dan komunikasi",
      contactDescription: "Silakan hubungi Admin",
      contactDescriptionMiddle:
        "untuk berbicara langsung atau melalui pesan apabila anda membutuhkan informasi ataupun layanan lainnya tentang",
      contactWhatsApp: "Hubungi via WhatsApp",
      whatsappNotSet: "WhatsApp Belum Diatur",
      notSet: "Belum diatur",
      kelurahan: "Kelurahan",
      kecamatan: "Kecamatan",
    },

    en: {
      loading: "Loading contact information...",
      address: "Address",
      whatsapp: "WhatsApp",
      email: "Email",
      operatingHours: "Operating Hours",
      days: "Monday - Saturday",
      contactInfo: "Contact Information",
      contactAdmin: "Contact Admin",
      serviceDescription: "Information and communication services",
      contactDescription: "Please contact the Admin of",
      contactDescriptionMiddle:
        "to speak directly or send a message if you need information or other services regarding",
      contactWhatsApp: "Contact via WhatsApp",
      whatsappNotSet: "WhatsApp Not Configured",
      notSet: "Not configured",
      kelurahan: "Village",
      kecamatan: "District",
    },

    ar: {
      loading: "جارٍ تحميل معلومات الاتصال...",
      address: "العنوان",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      operatingHours: "ساعات العمل",
      days: "الاثنين - السبت",
      contactInfo: "معلومات الاتصال",
      contactAdmin: "التواصل مع الإدارة",
      serviceDescription: "خدمات المعلومات والتواصل",
      contactDescription: "يرجى التواصل مع مسؤول",
      contactDescriptionMiddle:
        "للتحدث مباشرة أو إرسال رسالة إذا كنتم بحاجة إلى معلومات أو خدمات أخرى تتعلق بـ",
      contactWhatsApp: "التواصل عبر واتساب",
      whatsappNotSet: "لم يتم إعداد واتساب",
      notSet: "لم يتم الإعداد",
      kelurahan: "القرية",
      kecamatan: "المنطقة",
    },
  };

  const t = translations[language] || translations.id;

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
      setting.kelurahan ? `${t.kelurahan} ${setting.kelurahan}` : "",
      setting.kecamatan ? `${t.kecamatan} ${setting.kecamatan}` : "",
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
      <div
        className="bg-[#f8faf8] min-h-screen"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <section
          className="relative overflow-hidden pt-16 md:pt-20 pb-12 min-h-[500px]"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]"></div>

          <div className="relative z-10 flex min-h-[400px] items-center justify-center px-4">
            <div className="w-full max-w-3xl space-y-4 py-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                  <Skeleton className="h-5 w-1/2" />

                  <Skeleton className="h-3 w-full" />

                  <Skeleton className="h-3 w-4/5" />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                  <Skeleton className="h-5 w-1/2" />

                  <Skeleton className="h-3 w-full" />

                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                <Skeleton className="h-5 w-1/3" />

                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
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
      <div
        className="bg-[#f8faf8] min-h-screen"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <section
          className="relative overflow-hidden pt-16 md:pt-20 pb-12 min-h-[500px]"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]"></div>

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

  const namaTPQ = setting?.nama_tpq || "TPQ Hairunnisa";

  const infoItems = [
    {
      key: "alamat",
      icon: MapPin,
      title: t.address,
      text: getAlamatLengkap() || t.notSet,
      tone: "bg-green-100 text-green-700",
    },
    {
      key: "whatsapp",
      icon: Phone,
      title: t.whatsapp,
      text: setting?.no_hp || t.notSet,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      key: "email",
      icon: Mail,
      title: t.email,
      text: setting?.email || t.notSet,
      tone: "bg-teal-100 text-teal-700",
      breakAll: true,
    },
    {
      key: "jam",
      icon: Clock,
      title: t.operatingHours,
      text: `${t.days} · 18.00 - 20.30 WIT`,
      tone: "bg-lime-100 text-lime-700",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#f6faf7]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <section
        className="relative overflow-hidden px-4 pb-20 pt-8 md:px-6 md:pt-14"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#f6faf7]" />

        <div className="relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* JUDUL */}
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
              {t.contactAdmin}
            </p>

            <h1 className="mt-3 text-3xl font-semibold text-gray-900 md:text-4xl">
              {namaTPQ}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500 md:text-base">
              {t.serviceDescription} {namaTPQ}
            </p>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* INFORMASI KONTAK */}
            <div className="space-y-5 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.contactInfo}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {infoItems.map(({ key, icon: Icon, title, text, tone, breakAll }) => (
                  <div
                    key={key}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

                      <p
                        className={`mt-1 text-sm leading-6 text-gray-600 ${
                          breakAll ? "break-all" : ""
                        }`}
                      >
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HUBUNGI ADMIN */}
            <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 to-emerald-600 p-7 text-white shadow-xl lg:col-span-2 md:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Phone size={22} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {t.contactAdmin} {namaTPQ}
                </h2>

                <p className="mt-3 text-sm leading-6 text-green-50 text-justify">
                  {t.contactDescription} {namaTPQ} {t.contactDescriptionMiddle}{" "}
                  {namaTPQ}.
                </p>

                <div className="mt-7">
                  {whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-green-800 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {t.contactWhatsApp}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-white/30 px-6 py-3 text-sm font-semibold text-white"
                    >
                      {t.whatsappNotSet}
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}

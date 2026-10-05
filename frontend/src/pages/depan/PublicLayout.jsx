import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Home as HomeIcon,
  UserRound,
  Newspaper,
  Megaphone,
  CalendarDays,
  Images,
  FileText,
  Phone,
  LogIn,
  LayoutDashboard,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";

import logoTPQ from "../../assets/logo-tpq.png";
import ChatAI from "./ChatAI";

// Satu sumber untuk menu navbar, menu mobile, dan footer
const NAV_ITEMS = [
  { to: "/", key: "home", icon: HomeIcon },
  { to: "/profil", key: "profile", icon: UserRound },
  { to: "/berita", key: "news", icon: Newspaper },
  { to: "/pengumuman", key: "announcement", icon: Megaphone },
  { to: "/kalender", key: "calendar", icon: CalendarDays },
  { to: "/galeri", key: "gallery", icon: Images },
  { to: "/laporan", key: "reports", icon: FileText },
  { to: "/kontak", key: "contact", icon: Phone },
];

// Pilihan bahasa dengan bendera
const LANGUAGES = [
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

// Dropdown bahasa yang hanya menampilkan bendera
function LanguageDropdown({ value, onChange, solid }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0];

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Bahasa: ${current.label}`}
        title={current.label}
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
          solid ? "bg-gray-50 hover:bg-gray-100" : "bg-white/15 hover:bg-white/25"
        }`}
      >
        <span aria-hidden="true">{current.flag}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Pilih bahasa"
          className="absolute right-0 top-full z-50 mt-2 flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl"
        >
          {LANGUAGES.map(({ code, label, flag }) => (
            <li key={code} role="option" aria-selected={value === code}>
              <button
                type="button"
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                aria-label={label}
                title={label}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition ${
                  value === code ? "bg-green-50 ring-2 ring-green-500" : "hover:bg-gray-100"
                }`}
              >
                <span aria-hidden="true">{flag}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [language, setLanguage] = useState("id");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const translations = {
    id: {
      home: "Home",
      profile: "Profil",
      news: "Berita",
      announcement: "Pengumuman",
      calendar: "Kalender",
      gallery: "Galeri",
      reports: "Laporan",
      contact: "Kontak",
      login: "Login Admin",
      dashboardLabel: "Dashboard",

      footerTitle: "TPQ HAIRUNNISA",
      footerDescription:
        "Terima kasih telah berkunjung ke website Taman Pendidikan Al-Qur'an Hairunissa Ternate yang berkomitmen membentuk generasi Qurani yang berilmu, berakhlak, dan berkarakter Islami.",
      menu: "Menu",
      information: "Informasi",

      address: "Jl. MT. Habib Abubakar Al-Atas No.12",
      location: "Gamalama, Ternate, Maluku Utara",
      whatsapp: "WhatsApp: 0852-4020-4028",
      operatingHours: "Jam Operasional",
      contactUs: "Silakan hubungi kami",
    },

    en: {
      home: "Home",
      profile: "Profile",
      news: "News",
      announcement: "Announcements",
      calendar: "Calendar",
      gallery: "Gallery",
      reports: "Reports",
      contact: "Contact",
      login: "Admin Login",
      dashboardLabel: "Dashboard",

      footerTitle: "TPQ HAIRUNNISA",
      footerDescription:
        "Thank you for visiting the website of Taman Pendidikan Al-Qur'an Hairunissa Ternate, committed to nurturing a Qur'anic generation with knowledge, good character, and Islamic values.",
      menu: "Navigation",
      information: "Information",

      address: "Jl. MT. Habib Abubakar Al-Atas No.12",
      location: "Gamalama, Ternate, Maluku Utara",
      whatsapp: "WhatsApp: 0852-4020-4028",
      operatingHours: "Operating Hours",
      contactUs: "Please contact us",
    },

    ar: {
      home: "الرئيسية",
      profile: "الملف الشخصي",
      news: "الأخبار",
      announcement: "الإعلانات",
      calendar: "التقويم",
      gallery: "المعرض",
      reports: "التقارير",
      contact: "اتصل بنا",
      login: "دخول المسؤول",
      dashboardLabel: "لوحة التحكم",

      footerTitle: "TPQ HAIRUNNISA",
      footerDescription:
        "شكرًا لزيارتكم موقع Taman Pendidikan Al-Qur'an Hairunissa Ternate، الذي يلتزم بتكوين جيل قرآني متعلم، حسن الأخلاق، ومتصف بالقيم الإسلامية.",
      menu: "القائمة",
      information: "المعلومات",

      address: "Jl. MT. Habib Abubakar Al-Atas No.12",
      location: "Gamalama, Ternate, Maluku Utara",
      whatsapp: "واتساب: 0852-4020-4028",
      operatingHours: "ساعات العمل",
      contactUs: "يرجى التواصل معنا",
    },
  };

  const isHome = location.pathname === "/";

  // Navbar di beranda transparan di atas hero, lalu menjadi putih saat di-scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  const solid = !isHome || scrolled;
  const tr = translations[language];

  // Sudah login: tombol Login berubah menjadi tombol ke dashboard
  const sudahLogin =
    Boolean(localStorage.getItem("token")) &&
    Boolean(localStorage.getItem("user"));

  const tujuanLogin = sudahLogin ? "/dashboard" : "/login";
  const LabelLogin = sudahLogin ? LayoutDashboard : LogIn;
  const teksLogin = sudahLogin ? tr.dashboardLabel : tr.login;

  return (
    <div className="min-h-screen bg-[#f6faf7] text-gray-800 flex flex-col">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid
            ? "bg-white/90 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          {/* LOGO */}
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img
              src={logoTPQ}
              alt="Logo TPQ Hairunnisa"
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md md:h-11 md:w-11"
            />

            <div className="leading-tight">
              <h1
                className={`text-base font-bold md:text-lg ${
                  solid ? "text-green-700" : "text-white"
                }`}
              >
                TPQ HAIRUNNISA
              </h1>

              <p
                className={`text-[10px] md:text-xs ${
                  solid ? "text-gray-500" : "text-green-100"
                }`}
              >
                Taman Pendidikan Al-Qur'an
              </p>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                title={tr[key]}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? solid
                        ? "bg-green-50 text-green-700"
                        : "bg-white/20 text-white"
                      : solid
                        ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.8} />
                <span className="hidden xl:inline">{tr[key]}</span>
              </NavLink>
            ))}

            <div className="ml-1">
              <LanguageDropdown value={language} onChange={setLanguage} solid={solid} />
            </div>

            <Link
              to={tujuanLogin}
              title={teksLogin}
              aria-label={teksLogin}
              className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md transition hover:bg-green-700"
            >
              <LabelLogin size={18} />
            </Link>
          </nav>

          {/* TOMBOL MENU MOBILE */}
          <button
            type="button"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
            className={`flex h-10 w-10 items-center justify-center rounded-xl md:hidden ${
              solid ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/15"
            }`}
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* PANEL MENU MOBILE */}
        {mobileMenu && (
          <div className="border-t border-gray-100 bg-white/95 px-4 pb-6 pt-3 shadow-lg backdrop-blur-md md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {tr[key]}
                </NavLink>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <LanguageDropdown value={language} onChange={setLanguage} solid />

              <Link
                to={tujuanLogin}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <LabelLogin size={17} />
                {teksLogin}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          KONTEN HALAMAN
      ====================================================== */}

      <main className={`flex-1 ${isHome ? "" : "pt-16 md:pt-20"}`}>
        <Outlet context={{ language }} />
      </main>

      <ChatAI />

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-green-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{tr.footerTitle}</h3>

            <p className="mt-4 text-sm leading-7 text-white text-justify">
              {tr.footerDescription}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {tr.menu}
            </h3>

            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {NAV_ITEMS.map(({ to, key }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white transition hover:translate-x-1 hover:text-white/80 inline-block"
                  >
                    {tr[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {tr.information}
            </h3>

            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jl.+MT.+Habib+Abubakar+Al-Atas+No.12,+Gamalama,+Ternate,+Maluku+Utara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 text-white transition hover:text-white/80"
                >
                  <MapPin size={18} className="mt-0.5 shrink-0 text-white" />

                  <span>
                    {tr.address}
                    <br />
                    <span className="text-white">{tr.location}</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/6285240204028"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 text-white transition hover:text-white/80"
                >
                  <MessageCircle size={18} className="shrink-0 text-white" />

                  {tr.whatsapp}
                </a>
              </li>

              <li className="flex gap-3 text-white">
                <Clock size={18} className="mt-0.5 shrink-0 text-white" />

                <span>
                  {tr.operatingHours}
                  <br />
                  <span className="text-white">{tr.contactUs}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-white">
          © {new Date().getFullYear()} TPQ Hairunnisa
        </div>
      </footer>
    </div>
  );
}

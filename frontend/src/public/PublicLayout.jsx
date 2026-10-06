import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
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
} from "lucide-react";

import logoTPQ from "../assets/logo-tpq.png";
import ChatAI from "./ChatAI";

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  // Sudah login jika token tersimpan
  const sudahLogin = (() => {
    try {
      return !!localStorage.getItem("token");
    } catch {
      return false;
    }
  })();
  const [language, setLanguage] = useState("id");
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
      dashboard: "Dashboard",

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
      dashboard: "Dashboard",

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
      dashboard: "لوحة التحكم",

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

  return (
    <div className="min-h-screen bg-white">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHome
            ? "bg-white/40 backdrop-blur-md"
            : "bg-white/90 backdrop-blur-md shadow-sm"
        }`}
      >
        {/* =================================================
            BARIS UTAMA HEADER
        ================================================== */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* =================================================
              LOGO + NAMA TPQ
          ================================================== */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            {/* LOGO BULAT */}
            <img
              src={logoTPQ}
              alt="Logo TPQ Hairunnisa"
              className="
                w-11
                h-11
                rounded-full
                object-cover
                border-2
                border-white
                shadow-lg
                flex-shrink-0
              "
            />

            {/* NAMA */}
            <div>
              <h1
                className="
                  font-bold
                  text-lg
                  md:text-xl
                  lg:text-2xl
                  text-green-700
                  leading-tight
                "
              >
                TPQ HAIRUNNISA
              </h1>

              <p className="text-[9px] md:text-xs text-gray-500">
                Taman Pendidikan Al-Qur'an
              </p>
            </div>
          </Link>

          {/* =================================================
              DESKTOP MENU
          ================================================== */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* HOME */}
            <Link
              to="/"
              title="Home"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[58px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <HomeIcon size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].home}
              </span>
            </Link>

            {/* PROFIL */}
            <Link
              to="/profil"
              title="Profil"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[58px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <UserRound size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].profile}
              </span>
            </Link>

            {/* BERITA */}
            <Link
              to="/berita"
              title="Berita"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[58px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <Newspaper size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].news}
              </span>
            </Link>

            {/* PENGUMUMAN */}
            <Link
              to="/pengumuman"
              title="Pengumuman"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[68px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <Megaphone size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].announcement}
              </span>
            </Link>

            {/* KALENDER */}
            <Link
              to="/kalender"
              title="Kalender"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[62px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <CalendarDays size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].calendar}
              </span>
            </Link>

            {/* GALERI */}
            <Link
              to="/galeri"
              title="Galeri"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[58px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <Images size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].gallery}
              </span>
            </Link>

            {/* LAPORAN */}
            <Link
              to="/laporan"
              title="Laporan"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[60px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <FileText size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].reports}
              </span>
            </Link>

            {/* KONTAK */}
            <Link
              to="/kontak"
              title="Kontak"
              className="
                group
                flex
                flex-col
                items-center
                justify-center
                min-w-[58px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-white/50
                  backdrop-blur-xl
                  border
                  border-white/80
                  text-green-700
                  shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                  group-hover:bg-white/80
                  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                  transition-all
                "
              >
                <Phone size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-gray-700 font-medium">
                {translations[language].contact}
              </span>
            </Link>

            {/* PILIHAN BAHASA */}
            <div className="relative ml-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="
      h-10
      rounded-full
      bg-white/60
      backdrop-blur-xl
      border
      border-white/80
      text-gray-700
      text-xs
      font-semibold
      px-3
      pr-8
      shadow-[0_5px_15px_rgba(0,0,0,0.12)]
      outline-none
      cursor-pointer
      hover:bg-white/80
      transition-all
    "
                aria-label="Pilih bahasa"
              >
                <option value="id">🇮🇩 ID</option>
                <option value="en">🇬🇧 EN</option>
                <option value="ar">🇸🇦 AR</option>
              </select>
            </div>

            {/* LOGIN ADMIN */}
            <Link
              to={sudahLogin ? "/dashboard" : "/login"}
              title={sudahLogin ? "Dashboard" : "Login Admin"}
              className="
                ml-1
                flex
                flex-col
                items-center
                justify-center
                min-w-[72px]
                px-2
                py-1
                rounded-2xl
                transition-all
                hover:-translate-y-0.5
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-green-600
                  text-white
                  border
                  border-white/80
                  shadow-[0_6px_18px_rgba(22,101,52,0.30)]
                  hover:bg-green-700
                  hover:shadow-[0_8px_22px_rgba(22,101,52,0.40)]
                  transition-all
                "
              >
                <LogIn size={19} strokeWidth={1.8} />
              </div>

              <span className="mt-1 text-[10px] text-green-700 font-semibold">
                {sudahLogin
                  ? translations[language].dashboard
                  : translations[language].login}
              </span>
            </Link>
          </nav>

          {/* =================================================
              TOMBOL HAMBURGER MOBILE
          ================================================== */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="
              md:hidden
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              text-gray-700
              bg-white/60
              backdrop-blur-md
              border
              border-white
              shadow-md
              hover:bg-white/80
              transition
            "
            aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenu ? <X size={27} /> : <Menu size={27} />}
          </button>
        </div>

        {/* =================================================
            MENU MOBILE — 4 × 2 ICON + TEKS
        ================================================== */}
        {mobileMenu && (
          <div
            className="
              md:hidden
              border-t
              border-white/60
              bg-white/75
              backdrop-blur-xl
              shadow-2xl
            "
          >
            <div className="px-5 py-6">
              {/* PILIHAN BAHASA MOBILE */}
              <div className="flex justify-center mb-6">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="
      h-10
      rounded-full
      bg-white/70
      backdrop-blur-xl
      border
      border-white/80
      text-gray-700
      text-xs
      font-semibold
      px-4
      shadow-md
      outline-none
      cursor-pointer
    "
                  aria-label="Pilih bahasa"
                >
                  <option value="id">🇮🇩 Indonesia</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
              </div>

              {/* GRID 4 × 2 */}
              <div className="grid grid-cols-4 gap-x-3 gap-y-6">
                {/* HOME */}
                <Link
                  to="/"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Home"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <HomeIcon size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].home}
                  </span>
                </Link>

                {/* PROFIL */}
                <Link
                  to="/profil"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Profil TPQ"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <UserRound size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].profile}
                  </span>
                </Link>

                {/* BERITA */}
                <Link
                  to="/berita"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Berita"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <Newspaper size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].news}
                  </span>
                </Link>

                {/* PENGUMUMAN */}
                <Link
                  to="/pengumuman"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Pengumuman"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <Megaphone size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].announcement}
                  </span>
                </Link>

                {/* KALENDER */}
                <Link
                  to="/kalender"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Kalender"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <CalendarDays size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].calendar}
                  </span>
                </Link>

                {/* GALERI */}
                <Link
                  to="/galeri"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Galeri"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <Images size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].gallery}
                  </span>
                </Link>

                {/* LAPORAN */}
                <Link
                  to="/laporan"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Laporan"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <FileText size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].reports}
                  </span>
                </Link>

                {/* KONTAK */}
                <Link
                  to="/kontak"
                  onClick={() => setMobileMenu(false)}
                  aria-label="Kontak"
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="
                      w-[68px]
                      h-[68px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-white/55
                      backdrop-blur-xl
                      border
                      border-white/80
                      text-green-700
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      hover:bg-white/80
                      hover:scale-105
                      transition-all
                    "
                  >
                    <Phone size={30} strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-medium text-gray-700">
                    {translations[language].contact}
                  </span>
                </Link>
              </div>

              {/* =================================================
                  LOGIN ADMIN MOBILE
              ================================================== */}
              <Link
                to={sudahLogin ? "/dashboard" : "/login"}
                onClick={() => setMobileMenu(false)}
                className="
                  mt-7
                  w-full
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  py-3
                  rounded-full
                  shadow-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  font-semibold
                  transition
                "
              >
                <LogIn size={21} />
                {sudahLogin
                  ? translations[language].dashboard
                  : translations[language].login}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main className="pt-16 md:pt-16">
        <Outlet context={{ language }} />
      </main>

      <ChatAI />

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-gray-900 text-white mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            {/* =================================================
          KOLOM 1 — DESKRIPSI
      ================================================== */}
            <div>
              <h3 className="text-2xl font-bold mb-3">
                {translations[language].footerTitle}
              </h3>

              <p className="text-yellow-300 text-justify leading-relaxed font-light">
                {translations[language].footerDescription}
              </p>
            </div>

            {/* =================================================
          KOLOM 2 — MENU FOOTER
      ================================================== */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {translations[language].menu}
              </h3>

              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].home}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/profil"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].profile}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/berita"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].news}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/pengumuman"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].announcement}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/kalender"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].calendar}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/galeri"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].gallery}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/laporan"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].reports}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/kontak"
                    className="hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    o {translations[language].contact}
                  </Link>
                </li>
              </ul>
            </div>

            {/* =================================================
          KOLOM 3 — INFORMASI
      ================================================== */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {translations[language].information}
              </h3>

              {/* ALAMAT */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jl.+MT.+Habib+Abubakar+Al-Atas+No.12,+Gamalama,+Ternate,+Maluku+Utara"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 mb-3 hover:text-white transition-colors"
              >
                📍 {translations[language].address}
                <br />
                <span className="ml-5">{translations[language].location}</span>
              </a>

              {/* WHATSAPP */}
              <a
                href="https://wa.me/6285240204028"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 mb-3 hover:text-white transition-colors"
              >
                📞 {translations[language].whatsapp}
              </a>

              {/* JAM OPERASIONAL */}
              <div className="text-gray-300">
                🕓 {translations[language].operatingHours}
                <br />
                <span className="ml-5">{translations[language].contactUs}</span>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} TPQ Hairunnisa
          </div>
        </div>
      </footer>
    </div>
  );
}

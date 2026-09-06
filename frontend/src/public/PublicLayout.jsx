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
  const location = useLocation();

  const isHome = location.pathname === "/web";

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
          <Link to="/web" className="flex items-center gap-3 flex-shrink-0">
            {/* LOGO BULAT */}
            <img
              src={logoTPQ}
              alt="Logo TPQ Khairunnisa"
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
                TPQ KHAIRUNNISA
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
              to="/web"
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
                Home
              </span>
            </Link>

            {/* PROFIL */}
            <Link
              to="/web/profil"
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
                Profil
              </span>
            </Link>

            {/* BERITA */}
            <Link
              to="/web/berita"
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
                Berita
              </span>
            </Link>

            {/* PENGUMUMAN */}
            <Link
              to="/web/pengumuman"
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
                Pengumuman
              </span>
            </Link>

            {/* KALENDER */}
            <Link
              to="/web/kalender"
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
                Kalender
              </span>
            </Link>

            {/* GALERI */}
            <Link
              to="/web/galeri"
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
                Galeri
              </span>
            </Link>

            {/* LAPORAN */}
            <Link
              to="/web/laporan"
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
                Laporan
              </span>
            </Link>

            {/* KONTAK */}
            <Link
              to="/web/kontak"
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
                Kontak
              </span>
            </Link>

            {/* LOGIN ADMIN */}
            <Link
              to="/web/login"
              title="Login Admin"
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
                Login Admin
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
              {/* GRID 4 × 2 */}
              <div className="grid grid-cols-4 gap-x-3 gap-y-6">
                {/* HOME */}
                <Link
                  to="/web"
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
                    Home
                  </span>
                </Link>

                {/* PROFIL */}
                <Link
                  to="/web/profil"
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
                    Profil
                  </span>
                </Link>

                {/* BERITA */}
                <Link
                  to="/web/berita"
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
                    Berita
                  </span>
                </Link>

                {/* PENGUMUMAN */}
                <Link
                  to="/web/pengumuman"
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
                    Pengumuman
                  </span>
                </Link>

                {/* KALENDER */}
                <Link
                  to="/web/kalender"
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
                    Kalender
                  </span>
                </Link>

                {/* GALERI */}
                <Link
                  to="/web/galeri"
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
                    Galeri
                  </span>
                </Link>

                {/* LAPORAN */}
                <Link
                  to="/web/laporan"
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
                    Laporan
                  </span>
                </Link>

                {/* KONTAK */}
                <Link
                  to="/web/kontak"
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
                    Kontak
                  </span>
                </Link>
              </div>

              {/* =================================================
                  LOGIN ADMIN MOBILE
              ================================================== */}
              <Link
                to="/web/login"
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
                Login Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main className="pt-16 md:pt-16">
        <Outlet />
      </main>
      <ChatAI />

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-gray-900 text-white mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            {/* KOLOM 1 */}
            <div>
              <h3 className="text-2xl font-bold mb-3">TPQ KHAIRUNNISA</h3>

              <p className="text-gray-300">
                Taman Pendidikan Al-Qur'an yang berkomitmen membentuk generasi
                Qurani yang berilmu, berakhlak, dan berkarakter Islami.
              </p>
            </div>

            {/* KOLOM 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Menu</h3>

              <ul className="space-y-2 text-gray-300">
                <li>Home</li>
                <li>Profil TPQ</li>
                <li>Berita</li>
                <li>Pengumuman</li>
                <li>Kalender</li>
                <li>Galeri</li>
                <li>Laporan</li>
                <li>Kontak</li>
              </ul>
            </div>

            {/* KOLOM 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informasi</h3>

              <p className="text-gray-300 mb-2">📍 TPQ Khairunnisa</p>

              <p className="text-gray-300 mb-2">📞 Nomor WhatsApp</p>

              <p className="text-gray-300">🕓 Jam Operasional</p>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} TPQ Khairunnisa
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/web";

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHome ? "bg-white/40 backdrop-blur-md" : "bg-white shadow-sm"
        }`}
      >
        {/* BARIS HEADER */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO */}
          <div>
            <h1 className="font-bold text-lg md:text-2xl text-green-700">
              TPQ KHAIRUNNISA
            </h1>
            <p className="text-[10px] md:text-sm text-gray-500">
              Taman Pendidikan Al-Qur'an
            </p>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
            <Link to="/web" className="hover:text-green-600">
              Home
            </Link>

            <Link to="/web/profil" className="hover:text-green-600">
              Profil
            </Link>

            <Link to="/web/berita" className="hover:text-green-600">
              Berita
            </Link>

            <Link to="/web/pengumuman" className="hover:text-green-600">
              Pengumuman
            </Link>

            <Link to="/web/kalender" className="hover:text-green-600">
              Kalender
            </Link>

            <Link to="/web/galeri" className="hover:text-green-600">
              Galeri
            </Link>

            <Link to="/web/laporan" className="hover:text-green-600">
              Laporan
            </Link>

            <Link to="/web/kontak" className="hover:text-green-600">
              Kontak
            </Link>

            <Link
              to="/web/login"
              className="bg-green-600/90 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow-lg"
            >
              Login Admin
            </Link>
          </nav>

          {/* TOMBOL MOBILE */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg text-gray-700"
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MENU MOBILE */}
        {mobileMenu && (
          <div className="md:hidden border-t bg-white shadow-lg">
            <div className="flex flex-col p-4 space-y-4">
              <Link to="/web" onClick={() => setMobileMenu(false)}>
                Home
              </Link>

              <Link to="/web/profil" onClick={() => setMobileMenu(false)}>
                Profil TPQ
              </Link>

              <Link to="/web/berita" onClick={() => setMobileMenu(false)}>
                Berita
              </Link>

              <Link to="/web/pengumuman" onClick={() => setMobileMenu(false)}>
                Pengumuman
              </Link>

              <Link to="/web/kalender" onClick={() => setMobileMenu(false)}>
                Kalender
              </Link>

              <Link to="/web/galeri" onClick={() => setMobileMenu(false)}>
                Galeri
              </Link>

              <Link to="/web/laporan" onClick={() => setMobileMenu(false)}>
                Laporan
              </Link>

              <Link to="/web/kontak" onClick={() => setMobileMenu(false)}>
                Kontak
              </Link>

              <Link
                to="/web/login"
                onClick={() => setMobileMenu(false)}
                className="bg-green-600 text-white px-4 py-3 rounded-xl text-center"
              >
                Login Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="pt-16 md:pt-16">
        <Outlet />
      </main>

      {/* FOOTER */}
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

          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} TPQ Khairunnisa
          </div>
        </div>
      </footer>
    </div>
  );
}

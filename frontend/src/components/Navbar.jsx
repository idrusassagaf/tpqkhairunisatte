import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  UserRound,
  ChevronDown,
} from "lucide-react";
import { api } from "../api";
import logoTPQ from "../assets/logo-tpq.png";
import { USER_UPDATED_EVENT, bacaUser, fotoUserUrl } from "../utils/user";

const JUDUL_HALAMAN = {
  dashboard: "Dashboard",
  "master-data": "Master Data",
  "master-progres": "Master Progres",
  "data-santri": "Database Santri",
  "raport-santri": "Raport Santri",
  "progres-iqra": "Progres Iqra",
  "progres-quran": "Progres Qur'an",
  "progres-hafalan": "Progres Hafalan",
  "data-guru": "Database Guru",
  "status-guru": "Status & Gaji Guru",
  "kehadiran-santri": "Kehadiran Santri",
  "kehadiran-guru": "Kehadiran Guru",
  "scan-absensi": "Scan QR Absensi",
  "kartu-qr-santri": "Kartu QR",
  berita: "Berita",
  pengumuman: "Pengumuman",
  "kalender-pengajian": "Kalender Pengajian",
  galeri: "Galeri",
  "laporan-ringkas": "Laporan Ringkas",
  "management-user": "Management User",
  "pengaturan-sistem": "Pengaturan Sistem",
  "profil-saya": "Profil Saya",
};

export default function Navbar({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(bacaUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Perbarui avatar dan nama setelah profil disimpan
  useEffect(() => {
    const perbarui = () => setUser(bacaUser());

    window.addEventListener(USER_UPDATED_EVENT, perbarui);
    window.addEventListener("storage", perbarui);

    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, perbarui);
      window.removeEventListener("storage", perbarui);
    };
  }, []);

  // Tutup menu saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Tutup menu saat pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const segmen = location.pathname.split("/").filter(Boolean);
  const kunci = segmen[1] || "dashboard";
  const judul = JUDUL_HALAMAN[kunci] || "Dashboard";

  const fotoUrl = fotoUserUrl(user?.foto);
  const inisial = (user?.name || "A")
    .split(" ")
    .map((k) => k[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // token mungkin sudah tidak valid, lanjutkan logout di sisi frontend
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/95 px-3 shadow-sm backdrop-blur md:h-16 md:px-5">
      {/* HAMBURGER */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100"
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>

      {/* LOGO + JUDUL */}
      <img
        src={logoTPQ}
        alt="Logo TPQ Hairunnisa"
        className="hidden h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow sm:block"
      />

      <div className="min-w-0">
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 sm:block">
          TPQ Hairunnisa
        </p>

        <h2 className="truncate text-sm font-semibold text-gray-900 md:text-base">
          {judul}
        </h2>
      </div>

      {/* USER */}
      <div ref={menuRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-100"
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={user?.name || "Foto profil"}
              className="h-9 w-9 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white">
              {inisial}
            </span>
          )}

          <span className="hidden min-w-0 text-left md:block">
            <span className="block max-w-[10rem] truncate text-sm font-medium text-gray-900">
              {user?.name || "Pengguna"}
            </span>

            <span className="block text-[11px] text-gray-500">
              {user?.role || "Viewer"}
            </span>
          </span>

          <ChevronDown
            size={16}
            className={`hidden text-gray-500 transition md:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                  {inisial}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.name || "Pengguna"}
                </p>

                <p className="truncate text-xs text-gray-500">{user?.email || "-"}</p>
              </div>
            </div>

            <div className="p-2">
              <Link
                to="/dashboard/profil-saya"
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <UserRound size={17} className="text-gray-500" />
                Profil Saya
              </Link>

            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import logoTPQ from "../assets/logo-tpq.png";

export default function Navbar({ setOpen }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!menuOpen) return undefined;

    const klikLuar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const tekanEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tekanEsc);

    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tekanEsc);
    };
  }, [menuOpen]);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Ikut berubah saat profil disimpan di halaman Profil
  useEffect(() => {
    const perbarui = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("user-updated", perbarui);

    return () => window.removeEventListener("user-updated", perbarui);
  }, []);

  const namaUser = user?.name || user?.nama || "Administrator";
  const inisial = namaUser.trim().charAt(0).toUpperCase() || "A";

  const handleLogout = async () => {
    try {
      await api.post("/logout", null, { skipLoading: true });
    } catch {
      // token mungkin sudah tidak valid, lanjutkan logout di sisi frontend
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm flex items-center gap-3 px-3 md:px-5 z-50">
      {/* HAMBURGER */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 -ml-1 rounded-lg text-xl text-gray-700 hover:bg-gray-100 transition"
        aria-label="Buka menu"
      >
        ☰
      </button>

      {/* LOGO + NAMA TPQ */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logoTPQ}
          alt="Logo TPQ Hairunnisa"
          className="w-9 h-9 rounded-full object-cover ring-2 ring-green-100"
        />

        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-sm md:text-base text-gray-900 truncate">
            TPQ HAIRUNNISA
          </div>

          <div className="hidden sm:block text-xs text-gray-500">
            Dashboard Admin
          </div>
        </div>
      </div>

      {/* PROFIL: dropdown */}
      <div ref={menuRef} className="ml-auto relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 pr-2 py-1 rounded-xl hover:bg-gray-100 transition"
        >
          {user?.foto_url ? (
            <img
              src={user.foto_url}
              alt={namaUser}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-green-100"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-green-600 text-white text-sm font-semibold flex items-center justify-center">
              {inisial}
            </div>
          )}

          <div className="hidden md:block text-left leading-tight">
            <div className="text-sm font-semibold text-gray-800">
              {namaUser}
            </div>

            <div className="text-xs text-gray-500">{user?.role || "Admin"}</div>
          </div>

          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                navigate("/dashboard/profil");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
            >
              <UserIcon size={16} className="text-gray-500" />
              Profil
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                navigate("/dashboard/management-password");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
            >
              <KeyRound size={16} className="text-gray-500" />
              Manajemen Password
            </button>

            <div className="my-2 border-t border-gray-200" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

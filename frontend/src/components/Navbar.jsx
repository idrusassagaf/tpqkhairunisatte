import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { api } from "../api";
import logoTPQ from "../assets/logo-tpq.png";

export default function Navbar({ setOpen }) {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

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
    <div className="fixed top-0 left-0 right-0 h-14 bg-gray-200 border-b flex items-center px-4 z-50">
      {/* HAMBURGER */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-2xl text-gray-800"
        aria-label="Buka menu"
      >
        ☰
      </button>

      {/* LOGO TPQ */}
      <img
        src={logoTPQ}
        alt="Logo TPQ Hairunnisa"
        className="
          ml-4
          w-10
          h-10
          rounded-full
          object-cover
          shadow-lg
          border-2
          border-white
        "
      />

      {/* NAMA TPQ */}
      <div className="ml-3 font-semibold">TPQ HAIRUNNISA</div>

      {/* USER + LOGOUT */}
      <div className="ml-auto flex items-center gap-3">
        {user?.name && (
          <span className="hidden sm:inline text-sm text-gray-700">
            {user.name}
          </span>
        )}

        <button
          onClick={handleLogout}
          className="
            flex items-center gap-1.5
            text-sm font-medium text-red-600
            hover:text-red-700
            hover:bg-red-50
            px-3 py-1.5
            rounded-lg
            transition
          "
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

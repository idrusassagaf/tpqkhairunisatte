import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../../api";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import logoTPQ from "../../assets/logo-tpq.png";
import heroImage from "../../assets/hero-putih04.jpg";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login gagal. Periksa kembali data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Sudah login: halaman login tidak bisa diakses lagi
  if (localStorage.getItem("token") && localStorage.getItem("user")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY SAMA DENGAN HERO BERANDA */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-950/90 via-green-900/75 to-emerald-700/50" />

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-green-100 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-black/20 md:p-10">
          {/* HEADER */}
          <div className="text-center">
            <img
              src={logoTPQ}
              alt="Logo TPQ Hairunnisa"
              className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-md"
            />

            <h1 className="mt-5 text-2xl font-semibold text-gray-900">
              Login Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">TPQ Hairunnisa</p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-green-600"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  title={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}

              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-green-100/80">
          Untuk pendaftaran santri dilakukan langsung di TPQ Hairunnisa.
        </p>
      </div>
    </div>
  );
}

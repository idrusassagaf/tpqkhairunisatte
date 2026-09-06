import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Eye, EyeOff } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* GLASS LOGIN CARD */}
      <div
        className="
          w-full max-w-md
          rounded-3xl
          p-8
          bg-white/70
          backdrop-blur-xl
          border border-white/80
          shadow-xl
          shadow-gray-400/30
          pt-0 
          
        "
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-green-700">Login Admin</h1>

          <p className="text-gray-500 mt-2">TPQ Khairunnisa</p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="
              bg-red-100/80
              border border-red-200
              text-red-700
              p-3
              rounded-xl
              mb-4
              text-sm
            "
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="
                w-full
                border border-gray-300
                bg-white/70
                rounded-xl
                p-3
                text-gray-800
                placeholder-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                focus:border-green-500
                transition
              "
              placeholder="admin@gmail.com"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="
                  w-full
                  border border-gray-300
                  bg-white/70
                  rounded-xl
                  p-3
                  pr-12
                  text-gray-800
                  placeholder-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-green-500
                  focus:border-green-500
                  transition
                "
                placeholder="******"
                required
              />

              {/* ICON MATA */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                  hover:text-green-600
                  transition
                  p-1
                  rounded-lg
                  focus:outline-none
                "
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                title={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              disabled:bg-green-400
              text-white
              py-3
              rounded-xl
              font-semibold
              transition
              shadow-lg
              shadow-green-600/20
            "
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-3 text-center text-xs text-gray-400 leading-relaxed">
          Untuk pendaftaran santri dilakukan langsung di TPQ Khairunnisa.
        </p>
      </div>
    </div>
  );
}

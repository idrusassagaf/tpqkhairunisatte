import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Login Admin</h1>

          <p className="text-gray-500 mt-2">TPQ Khairunnisa</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="******"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-3
              rounded-xl
              font-semibold
              transition
            "
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500 leading-relaxed">
          Untuk pendaftaran santri dilakukan langsung di TPQ Khairunnisa.
          <br />
          Data santri akan diinput oleh Admin setelah proses pendaftaran.
        </p>
      </div>
    </div>
  );
}

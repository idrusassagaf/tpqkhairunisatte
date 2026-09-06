import { useState } from "react";
import {
  KeyRound,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../api";

export default function ManagementPassword() {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      current_password: "",
      password: "",
      password_confirmation: "",
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // SIMPAN PASSWORD
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validasi password baru
    if (form.password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    // Validasi konfirmasi password
    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password baru tidak sama.");
      return;
    }

    // Password lama dan baru tidak boleh sama
    if (form.current_password === form.password) {
      setError("Password baru harus berbeda dari password lama.");
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/change-password", {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      setSuccess(res?.data?.message || "Password berhasil diubah.");

      resetForm();
    } catch (err) {
      console.error("Gagal mengubah password:", err);

      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat().find(Boolean);

        setError(firstError || "Data password tidak valid.");
      } else {
        setError(err?.response?.data?.message || "Gagal mengubah password.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // INPUT PASSWORD
  // =========================================================

  const PasswordInput = ({
    label,
    name,
    value,
    placeholder,
    show,
    setShow,
  }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            name={name}
            value={value}
            onChange={handleChange}
            required
            minLength={name !== "current_password" ? 6 : undefined}
            placeholder={placeholder}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            title={show ? "Sembunyikan password" : "Tampilkan password"}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-7">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <KeyRound size={25} className="text-blue-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Management Password
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Kelola dan ubah password akun yang sedang login
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PESAN BERHASIL
        ====================================================== */}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="text-emerald-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Berhasil
                </p>

                <p className="text-sm text-emerald-600 mt-0.5">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PESAN ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-semibold text-red-700">Gagal</p>

                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            FORM PASSWORD
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Ubah Password</h2>

                <p className="text-xs text-gray-500 mt-1">
                  Masukkan password lama sebelum membuat password baru.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* =================================================
                  PASSWORD LAMA
              ================================================== */}

              <PasswordInput
                label="Password Lama"
                name="current_password"
                value={form.current_password}
                placeholder="Masukkan password lama"
                show={showCurrentPassword}
                setShow={setShowCurrentPassword}
              />

              {/* =================================================
                  PASSWORD BARU
              ================================================== */}

              <PasswordInput
                label="Password Baru"
                name="password"
                value={form.password}
                placeholder="Minimal 6 karakter"
                show={showPassword}
                setShow={setShowPassword}
              />

              {/* =================================================
                  KONFIRMASI PASSWORD
              ================================================== */}

              <div className="md:col-span-2">
                <PasswordInput
                  label="Konfirmasi Password Baru"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  placeholder="Ulangi password baru"
                  show={showConfirmation}
                  setShow={setShowConfirmation}
                />
              </div>
            </div>

            {/* =================================================
                INFORMASI
            ================================================== */}

            <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="text-blue-600 mt-0.5 shrink-0"
                />

                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">Keamanan Password</p>

                  <p>
                    Gunakan password minimal 6 karakter dan jangan menggunakan
                    password yang mudah ditebak. Password hanya bisa di rubah
                    oleh pemilik Akun yang sedang Login
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                BUTTON
            ================================================== */}

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
              >
                <Save size={17} />

                {saving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </form>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            TPQ Khairunissa • Management Password
          </p>
        </div>
      </div>
    </div>
  );
}

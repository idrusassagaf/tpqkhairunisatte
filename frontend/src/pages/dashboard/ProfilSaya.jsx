import { useEffect, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { api } from "../../api";
import ImageCropper from "../../components/ImageCropper";
import { Skeleton } from "../../components/Skeleton";
import { bacaUser, fotoUserUrl, simpanUser } from "../../utils/user";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-green-400 focus:outline-none focus:ring-4 focus:ring-green-100 disabled:bg-gray-100 disabled:text-gray-500";

const labelCls = "mb-1.5 block text-xs font-medium text-gray-600";


// Input password dengan tombol tampilkan/sembunyikan
function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  autoComplete,
  placeholder,
  className = "",
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          className={`${inputCls} pr-11`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilSaya() {
  const notify = window.__tpqNotify;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [fotoLama, setFotoLama] = useState(null);

  const [preview, setPreview] = useState(null);
  const [fotoBaru, setFotoBaru] = useState(null);

  // File yang sedang di-crop, dan file asli untuk crop ulang
  const [cropSource, setCropSource] = useState(null);
  const [originalFoto, setOriginalFoto] = useState(null);

  // Muat data profil terbaru dari server
  useEffect(() => {
    let mounted = true;

    const cached = bacaUser();

    if (cached) {
      setForm({ name: cached.name || "", email: cached.email || "" });
      setFotoLama(cached.foto || null);
    }

    api
      .get("/profil-saya")
      .then((res) => {
        if (!mounted) return;

        const user = res.data.data;

        setForm({ name: user.name || "", email: user.email || "" });
        setFotoLama(user.foto || null);
        simpanUser({ ...(bacaUser() || {}), ...user });
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fotoTampil = preview || fotoUserUrl(fotoLama);
  const inisial = (form.name || "A")
    .split(" ")
    .map((k) => k[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSimpan = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);

      if (fotoBaru) {
        formData.append("foto", fotoBaru);
      }

      const res = await api.post("/profil-saya", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const user = res.data.data;

      simpanUser({ ...(bacaUser() || {}), ...user });

      setFotoLama(user.foto || null);
      setFotoBaru(null);
      setPreview(null);
      setOriginalFoto(null);

      notify?.toast({
        type: "success",
        title: "Profil tersimpan",
        message: res.data.message || "Profil berhasil diperbarui.",
        duration: 3200,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const pesan = errors
        ? Object.values(errors).flat().join(" ")
        : err.response?.data?.message || "Terjadi kesalahan saat menyimpan.";

      notify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message: pesan,
        duration: 4200,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // UBAH PASSWORD
  // =====================================================

  const [formPassword, setFormPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [tampilPassword, setTampilPassword] = useState({
    current: false,
    baru: false,
    konfirmasi: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const gantiPassword = (e) => {
    const { name, value } = e.target;

    setFormPassword((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = (kunci) =>
    setTampilPassword((prev) => ({ ...prev, [kunci]: !prev[kunci] }));

  const handleUbahPassword = async (e) => {
    e.preventDefault();

    if (formPassword.password.length < 6) {
      notify?.toast({
        type: "warning",
        title: "Password terlalu pendek",
        message: "Password baru minimal 6 karakter.",
        duration: 3200,
      });

      return;
    }

    if (formPassword.password !== formPassword.password_confirmation) {
      notify?.toast({
        type: "warning",
        title: "Konfirmasi tidak sama",
        message: "Konfirmasi password baru tidak sama.",
        duration: 3200,
      });

      return;
    }

    if (formPassword.current_password === formPassword.password) {
      notify?.toast({
        type: "warning",
        title: "Password sama",
        message: "Password baru harus berbeda dari password lama.",
        duration: 3200,
      });

      return;
    }

    try {
      setSavingPassword(true);

      const res = await api.post("/change-password", formPassword);

      setFormPassword({
        current_password: "",
        password: "",
        password_confirmation: "",
      });

      notify?.toast({
        type: "success",
        title: "Password diubah",
        message: res.data?.message || "Password berhasil diubah.",
        duration: 3200,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const pesan = errors
        ? Object.values(errors).flat().find(Boolean)
        : err.response?.data?.message || "Gagal mengubah password.";

      notify?.toast({
        type: "error",
        title: "Gagal mengubah password",
        message: pesan,
        duration: 4200,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5 p-3 md:p-6">
        <Skeleton className="h-10 w-48" />

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-24 w-24 rounded-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <UserRound size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pengaturan Profil</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Atur nama, email, dan foto profil akun Anda.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSimpan}
        className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-3 md:p-8"
      >
        {/* FOTO */}
        <div className="flex flex-col items-center gap-4 md:col-span-1">
          {cropSource ? (
            <div className="w-full">
              <ImageCropper
                file={cropSource}
                aspect={1}
                outputWidth={512}
                onCancel={() => setCropSource(null)}
                onDone={(cropped) => {
                  setFotoBaru(cropped);
                  setPreview(URL.createObjectURL(cropped));
                  setCropSource(null);
                }}
              />
            </div>
          ) : (
            <>
              {fotoTampil ? (
                <img
                  src={fotoTampil}
                  alt="Foto profil"
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-gray-200"
                />
              ) : (
                <span className="flex h-32 w-32 items-center justify-center rounded-full bg-green-600 text-3xl font-semibold text-white shadow-md">
                  {inisial}
                </span>
              )}

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <Camera size={16} />
                Ganti foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={submitting}
                  onChange={(e) => {
                    const file = e.target.files[0];

                    e.target.value = "";

                    if (!file) return;

                    setOriginalFoto(file);
                    setCropSource(file);
                  }}
                />
              </label>

              {originalFoto && (
                <button
                  type="button"
                  onClick={() => setCropSource(originalFoto)}
                  className="text-xs font-medium text-green-700 hover:underline"
                >
                  Crop ulang
                </button>
              )}

              <p className="text-center text-xs text-gray-400">
                Foto akan dipotong persegi. Maksimal 4 MB.
              </p>
            </>
          )}
        </div>

        {/* DATA */}
        <div className="space-y-5 md:col-span-2">
          <div>
            <label htmlFor="nama" className={labelCls}>
              Nama lengkap
            </label>

            <input
              id="nama"
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>
              Email
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                className={`${inputCls} pl-10`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting || cropSource !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {submitting ? "Menyimpan..." : "Simpan profil"}
            </button>
          </div>
        </div>
      </form>

      {/* UBAH PASSWORD */}
      <form
        id="ubah-password"
        onSubmit={handleUbahPassword}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
      >
        <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <KeyRound size={20} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">Ubah password</h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Masukkan password lama, lalu password baru minimal 6 karakter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PasswordField
            label="Password lama"
            name="current_password"
            value={formPassword.current_password}
            onChange={gantiPassword}
            show={tampilPassword.current}
            onToggle={() => togglePassword("current")}
            disabled={savingPassword}
            autoComplete="current-password"
            className="md:col-span-2"
          />

          <PasswordField
            label="Password baru"
            name="password"
            value={formPassword.password}
            onChange={gantiPassword}
            show={tampilPassword.baru}
            onToggle={() => togglePassword("baru")}
            disabled={savingPassword}
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
          />

          <PasswordField
            label="Konfirmasi password baru"
            name="password_confirmation"
            value={formPassword.password_confirmation}
            onChange={gantiPassword}
            show={tampilPassword.konfirmasi}
            onToggle={() => togglePassword("konfirmasi")}
            disabled={savingPassword}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
          />
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={16} />
            {savingPassword ? "Menyimpan..." : "Ubah password"}
          </button>
        </div>
      </form>
    </div>
  );
}

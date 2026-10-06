import { useEffect, useState } from "react";
import { api } from "../api";
import { notifySuccess } from "../toastStore";

// =========================================================
// HALAMAN PROFIL: EDIT NAMA + FOTO
// =========================================================

export default function Profil() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [name, setName] = useState(user.name || "");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(user.foto_url || null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Preview lokal untuk foto yang baru dipilih
  useEffect(() => {
    if (!foto) return undefined;

    const url = URL.createObjectURL(foto);

    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nama tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("name", name.trim());

      if (foto) formData.append("foto", foto);

      const res = await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const userBaru = res.data?.user;

      if (userBaru) {
        localStorage.setItem("user", JSON.stringify(userBaru));
        setUser(userBaru);
        setFoto(null);
        setPreview(userBaru.foto_url || null);

        // Beri tahu Navbar agar nama dan foto ikut berubah
        window.dispatchEvent(new Event("user-updated"));
      }

      notifySuccess("Profil berhasil diperbarui");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menyimpan profil. Coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inisial = (name || "A").trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-light text-gray-800">
            PROFIL SAYA
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Ubah nama dan foto profil Anda.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FOTO */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {preview ? (
                <img
                  src={preview}
                  alt="Foto profil"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-green-100"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-green-600 text-white text-4xl font-semibold flex items-center justify-center ring-4 ring-green-100">
                  {inisial}
                </div>
              )}

              <div className="text-center sm:text-left">
                <label className="inline-block text-sm font-medium text-green-700 border border-green-600 hover:bg-green-50 px-4 py-2 rounded-lg cursor-pointer transition">
                  Pilih foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFoto(e.target.files?.[0] || null)}
                  />
                </label>

                <p className="text-xs text-gray-500 mt-2">
                  JPG atau PNG, maksimal 2 MB.
                </p>
              </div>
            </div>

            {/* NAMA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* ROLE (hanya tampilan) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>

              <div className="text-sm text-gray-600">{user.role || "-"}</div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end pt-2 border-t">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Mail,
  CalendarDays,
  Users,
  ShieldCheck,
  Check,
  Shield,
} from "lucide-react";
import { api } from "../api";

export default function ManagementUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "Viewer",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // AMBIL DATA USER
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/users");

      setUsers(res?.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);

      setError(
        err?.response?.data?.message ||
          "Gagal mengambil data user dari server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "Viewer",
    });

    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setSuccess("");
    setError("");

    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "Viewer",
    });

    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setSuccess("");
    setError("");

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      password_confirmation: "",
      role: user.role || "Viewer",
    });

    setEditingId(user.id);
    setShowForm(true);
  };

  // =========================================================
  // SIMPAN USER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
        };

        if (form.password.trim() !== "") {
          payload.password = form.password;
          payload.password_confirmation = form.password_confirmation;
        }

        await api.put(`/users/${editingId}`, payload);

        setSuccess("Data user berhasil diperbarui.");
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: form.role,
        });

        setSuccess("User baru berhasil ditambahkan.");
      }

      await fetchUsers();

      setForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "Viewer",
      });

      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Gagal menyimpan user:", err);

      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat().find(Boolean);

        setError(firstError || "Data user tidak valid.");
      } else {
        setError(err?.response?.data?.message || "Gagal menyimpan data user.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // AKTIF / TIDAK AKTIF
  // =========================================================

  const handleToggleActive = async (user) => {
    if (togglingId) return;

    setError("");
    setSuccess("");
    setTogglingId(user.id);

    try {
      const res = await api.patch(`/users/${user.id}/toggle-active`);

      const updatedUser = res?.data?.data;

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_active: Boolean(updatedUser?.is_active),
              }
            : item,
        ),
      );

      setSuccess(
        updatedUser?.is_active
          ? `User "${user.name}" berhasil diaktifkan.`
          : `User "${user.name}" berhasil dinonaktifkan.`,
      );
    } catch (err) {
      console.error("Gagal mengubah status user:", err);

      setError(
        err?.response?.data?.message || "Gagal mengubah status aktif user.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // =========================================================
  // HAPUS USER
  // =========================================================

  const handleDelete = async (user) => {
    const yakin = window.confirm(
      `Hapus user "${user.name}"?\n\nData user yang sudah dihapus tidak dapat dikembalikan.`,
    );

    if (!yakin) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/users/${user.id}`);

      setSuccess(`User "${user.name}" berhasil dihapus.`);

      await fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus user:", err);

      setError(err?.response?.data?.message || "Gagal menghapus user.");
    }
  };

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-5">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-2xl bg-purple-100 flex items-center justify-center">
                <UserCog size={23} className="text-purple-700" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Management User
                </h1>

                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Kelola akun pengguna sistem TPQ Khairunissa
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow-sm hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              Tambah User
            </button>
          </div>
        </div>

        {/* PESAN */}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* RINGKASAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users size={20} className="text-purple-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Total User</p>

                <p className="text-2xl font-bold text-gray-800">
                  {loading ? "-" : users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Status Sistem</p>

                <p className="text-sm font-semibold text-emerald-700 mt-1">
                  API Terhubung
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FORM USER */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {editingId ? "Edit User" : "Tambah User Baru"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {editingId
                    ? "Perbarui informasi akun pengguna."
                    : "Buat akun pengguna baru untuk sistem."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAMA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nama User
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Admin TPQ"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingId}
                    minLength={6}
                    placeholder={
                      editingId
                        ? "Kosongkan jika tidak diubah"
                        : "Minimal 6 karakter"
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />

                  {editingId && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Isi jika ingin mengganti password.
                    </p>
                  )}
                </div>

                {/* KONFIRMASI PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Konfirmasi Password
                  </label>

                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required={!editingId}
                    minLength={6}
                    placeholder={
                      editingId ? "Isi jika password diubah" : "Ulangi password"
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>

                  <div className="relative">
                    <Shield
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <p className="text-xs text-gray-400 mt-1.5">
                    Admin memiliki akses pengelolaan sistem, sedangkan Viewer
                    digunakan untuk akses melihat data.
                  </p>
                </div>
              </div>

              {/* TOMBOL */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition"
                >
                  <Save size={17} />

                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABEL / CARD USER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Daftar User</h2>

            <p className="text-xs text-gray-500 mt-1">
              Seluruh akun pengguna yang terdaftar pada sistem.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Memuat data user...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <UserCog size={35} className="mx-auto text-gray-300" />

              <p className="mt-3 text-sm text-gray-500">Belum ada user.</p>
            </div>
          ) : (
            <>
              {/* MOBILE — CARD USER */}
              <div className="md:hidden divide-y divide-gray-100">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className="p-4 bg-white hover:bg-gray-50 transition"
                  >
                    {/* HEADER CARD */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-purple-100 flex items-center justify-center">
                          <UserCog size={18} className="text-purple-700" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {user.name}
                          </div>

                          <div className="text-xs text-gray-400 mt-0.5">
                            No. {index + 1} • ID: {user.id}
                          </div>
                        </div>
                      </div>

                      {/* STATUS BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.id}
                        title={
                          user.is_active
                            ? "Klik untuk menonaktifkan user"
                            : "Klik untuk mengaktifkan user"
                        }
                        className={`
                          shrink-0 w-9 h-9 rounded-lg
                          flex items-center justify-center
                          border transition
                          ${
                            user.is_active
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                              : "bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100"
                          }
                          ${
                            togglingId === user.id
                              ? "opacity-50 cursor-wait"
                              : ""
                          }
                        `}
                      >
                        {user.is_active && <Check size={20} strokeWidth={3} />}
                      </button>
                    </div>

                    {/* DETAIL USER */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                        <Mail size={15} className="shrink-0 text-gray-400" />

                        <span className="truncate">{user.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span>{formatTanggal(user.created_at)}</span>
                      </div>

                      {/* ROLE + STATUS */}
                      <div className="flex flex-wrap items-center gap-2">
                        {user.role === "Admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                            <ShieldCheck size={14} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                            <Shield size={14} />
                            Viewer
                          </span>
                        )}

                        <span
                          className={`
                            inline-flex items-center px-2.5 py-1 rounded-lg
                            text-xs font-semibold
                            ${
                              user.is_active
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                : "bg-gray-50 border border-gray-200 text-gray-500"
                            }
                          `}
                        >
                          {user.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </div>
                    </div>

                    {/* AKSI MOBILE */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => openEditForm(user)}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP — TABEL USER */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">
                        No
                      </th>

                      <th className="px-5 py-3 text-left font-semibold text-gray-600">
                        User
                      </th>

                      <th className="px-5 py-3 text-left font-semibold text-gray-600">
                        Email
                      </th>

                      <th className="px-5 py-3 text-left font-semibold text-gray-600">
                        Dibuat
                      </th>

                      <th className="px-5 py-3 text-center font-semibold text-gray-600">
                        Role
                      </th>

                      <th className="px-5 py-3 text-center font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right font-semibold text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4 text-gray-500">{index + 1}</td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                              <UserCog size={17} className="text-purple-700" />
                            </div>

                            <div>
                              <div className="font-semibold text-gray-800">
                                {user.name}
                              </div>

                              <div className="text-xs text-gray-400">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={15} />
                            {user.email}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays size={15} />
                            {formatTanggal(user.created_at)}
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <div className="flex justify-center">
                            {user.role === "Admin" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
                                <ShieldCheck size={14} />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                                <Shield size={14} />
                                Viewer
                              </span>
                            )}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              disabled={togglingId === user.id}
                              title={
                                user.is_active
                                  ? "Klik untuk menonaktifkan user"
                                  : "Klik untuk mengaktifkan user"
                              }
                              className={`
                                relative w-9 h-9 rounded-lg
                                flex items-center justify-center
                                border transition
                                ${
                                  user.is_active
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100"
                                }
                                ${
                                  togglingId === user.id
                                    ? "opacity-50 cursor-wait"
                                    : ""
                                }
                              `}
                            >
                              {user.is_active && (
                                <Check size={20} strokeWidth={3} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* AKSI */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(user)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
                              title="Edit user"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition"
                              title="Hapus user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            TPQ Khairunissa • Management User
          </p>
        </div>
      </div>
    </div>
  );
}

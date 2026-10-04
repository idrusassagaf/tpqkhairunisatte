import {
  Newspaper,
  Plus,
  Search,
  FileText,
  CalendarDays,
  Eye,
} from "lucide-react";

import { useState, useEffect, useCallback } from "react";

import { api } from "../api";
import { SkeletonRows } from "../components/Skeleton";
import RichTextEditor from "../components/laporan/RichTextEditor";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500";

export default function Berita() {
  const [loading, setLoading] = useState(true);

  // const dataBerita = [];

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    isi: "",
    penulis: "",
    status: "Draft",
    foto: null,
  });

  const [preview, setPreview] = useState(null);
  const [dataBerita, setDataBerita] = useState([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalBerita = dataBerita.length;

  const bulanIni = dataBerita.filter((item) => {
    const tanggal = new Date(item.created_at);
    const sekarang = new Date();

    return (
      tanggal.getMonth() === sekarang.getMonth() &&
      tanggal.getFullYear() === sekarang.getFullYear()
    );
  }).length;

  const hariIni = dataBerita.filter((item) => {
    const tanggal = new Date(item.created_at);
    const sekarang = new Date();

    return (
      tanggal.getDate() === sekarang.getDate() &&
      tanggal.getMonth() === sekarang.getMonth() &&
      tanggal.getFullYear() === sekarang.getFullYear()
    );
  }).length;

  const filteredBerita = dataBerita.filter((item) =>
    item.judul?.toLowerCase().includes(search.toLowerCase()),
  );

  const [editId, setEditId] = useState(null);

  const loadBerita = useCallback(async () => {
    try {
      const res = await api.get("/berita");
      setDataBerita(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    api
      .get("/berita")
      .then((res) => {
        if (mounted) {
          setDataBerita(res.data.data);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const notify = window.__tpqNotify;

  const handleSimpan = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("judul", form.judul);
      formData.append("isi", form.isi);
      formData.append("penulis", form.penulis);
      formData.append("status", form.status);

      if (form.foto) {
        formData.append("foto", form.foto);
      }

      if (editId) {
        formData.append("_method", "PUT");

        await api.post(`/berita/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/berita", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      notify?.toast({
        type: "success",
        title: "Berhasil disimpan",
        message: editId
          ? "Berita berhasil diperbarui dan terjemahan telah diperbarui."
          : "Berita berhasil ditambahkan dan sedang diproses untuk terjemahan.",
        duration: 3500,
      });

      setForm({
        judul: "",
        isi: "",
        penulis: "",
        status: "Draft",
        foto: null,
      });

      setPreview(null);
      setShowModal(false);

      loadBerita();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data || {});

      notify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message:
          typeof errorMessage === "string"
            ? errorMessage
            : "Terjadi kesalahan saat menyimpan data.",
        duration: 4200,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async (id) => {
    const konfirmasi = await notify?.confirm({
      title: "Hapus berita",
      message:
        "Yakin ingin menghapus berita ini? Data yang terhapus tidak bisa dikembalikan.",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (!konfirmasi) return;

    try {
      await api.delete(`/berita/${id}`);

      notify?.toast({
        type: "success",
        title: "Berhasil dihapus",
        message: "Berita telah berhasil dihapus dari sistem.",
        duration: 3200,
      });

      loadBerita();
    } catch (err) {
      notify?.toast({
        type: "error",
        title: "Gagal menghapus",
        message: "Terjadi kesalahan saat menghapus berita.",
        duration: 3500,
      });
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      judul: item.judul,
      isi: item.isi,
      penulis: item.penulis,
      status: item.status,
      foto: null,
    });

    if (item.foto) {
      setPreview(
        `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${item.foto}`,
      );
    } else {
      setPreview(null);
    }

    setShowModal(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Newspaper size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Berita TPQ</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Kelola berita dan informasi yang tampil di website TPQ.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditId(null);

            setForm({
              judul: "",
              isi: "",
              penulis: "",
              status: "Draft",
              foto: null,
            });

            setPreview(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Berita
        </button>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Total Berita", value: totalBerita, icon: FileText, bg: "bg-blue-100", color: "text-blue-700" },
          { label: "Bulan Ini", value: bulanIni, icon: CalendarDays, bg: "bg-green-100", color: "text-green-700" },
          { label: "Hari Ini", value: hariIni, icon: CalendarDays, bg: "bg-orange-100", color: "text-orange-700" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={20} className={color} />
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">{label}</p>

              <h2 className="text-2xl font-semibold text-gray-900">{value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* SEARCH */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Cari berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        {/* MOBILE CARD */}
        <div className="space-y-3 md:hidden">
          {loading && <SkeletonRows rows={4} cols={3} />}

          {!loading && filteredBerita.length === 0 && (
            <div className="p-4 text-center text-gray-500">Belum ada data berita</div>
          )}

          {filteredBerita.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {item.foto && (
                <img
                  src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${item.foto}`}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              )}

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{item.judul}</h3>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Publish"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("id-ID")} · Penulis {item.penulis}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={14} />

                  <span>{item.views ?? 0} dibaca</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHapus(item.id)}
                    className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Foto</th>
                <th className="px-4 py-3 text-left font-semibold">Judul</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Penulis</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Dibaca</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-0">
                    <SkeletonRows rows={6} cols={6} />
                  </td>
                </tr>
              ) : dataBerita.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                    Belum ada data berita
                  </td>
                </tr>
              ) : (
                filteredBerita.map((item, index) => (
                  <tr key={item.id} className="border-t border-gray-100 transition hover:bg-blue-50/40">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      {item.foto ? (
                        <img
                          src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${item.foto}`}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">{item.judul}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-3">{item.penulis}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "Publish"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-gray-600">
                        <Eye size={15} />

                        {item.views ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleHapus(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Berita" : "Tambah Berita"}
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Tutup"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {submitting && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span>Menyimpan berita dan menerjemahkan konten...</span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Judul</label>

                <input
                  type="text"
                  placeholder="Judul Berita"
                  className={inputCls}
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Penulis</label>

                  <input
                    type="text"
                    placeholder="Penulis"
                    className={inputCls}
                    value={form.penulis}
                    onChange={(e) => setForm({ ...form, penulis: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>

                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Publish">Publish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Isi Berita</label>

                <RichTextEditor
                  value={form.isi}
                  height={360}
                  onChange={(html) => setForm((prev) => ({ ...prev, isi: html }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Foto</label>

                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="min-w-0 flex-1 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-blue-700 hover:file:bg-blue-200"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (!file) return;

                      setForm({ ...form, foto: file });

                      setPreview(URL.createObjectURL(file));
                    }}
                    disabled={submitting}
                  />

                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-20 w-28 rounded-lg border object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPreview(null);
                  }}
                  className="rounded-xl border px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
                  disabled={submitting}
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSimpan}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : editId ? "Update" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { api } from "../api";
import { Skeleton } from "../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500";

export default function Galeri() {
  const [loading, setLoading] = useState(true);

  const [judul, setJudul] = useState("");
  const [foto, setFoto] = useState(null);
  const [data, setData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGaleri();
  }, []);

  const loadGaleri = async () => {
    try {
      const res = await api.get("/galeri");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const notify = window.__tpqNotify;

  const simpanGaleri = async (e) => {
    e.preventDefault();

    if (!judul || !foto || isSubmitting) return;

    setIsSubmitting(true);
    window.__tpqLoading?.show("Mengupload foto galeri...");

    try {
      const formData = new FormData();

      formData.append("judul", judul);
      formData.append("foto", foto);

      await api.post("/galeri", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setJudul("");
      setFoto(null);

      loadGaleri();

      notify?.toast({
        type: "success",
        title: "Foto berhasil ditambahkan",
        message: "Galeri TPQ berhasil diperbarui.",
        duration: 2800,
      });
    } catch (err) {
      console.error(err);
      notify?.toast({
        type: "error",
        title: "Gagal upload foto",
        message: "Pastikan file foto valid dan tidak terlalu besar.",
        duration: 3400,
      });
    } finally {
      setIsSubmitting(false);
      window.__tpqLoading?.hide();
    }
  };

  const hapusGaleri = async (id) => {
    const yakin = await notify?.confirm({
      title: "Hapus foto",
      message: "Yakin ingin menghapus foto ini dari galeri?",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (!yakin) return;

    try {
      await api.delete(`/galeri/${id}`);
      loadGaleri();
      notify?.toast({
        type: "success",
        title: "Foto dihapus",
        message: "Foto galeri berhasil dihapus.",
        duration: 2800,
      });
    } catch (err) {
      console.error(err);
      notify?.toast({
        type: "error",
        title: "Gagal menghapus",
        message: "Terjadi kesalahan saat menghapus foto.",
        duration: 3400,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
          <ImageIcon size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Galeri TPQ</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Unggah dan kelola foto kegiatan TPQ.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <form onSubmit={simpanGaleri} className="space-y-4">
          {isSubmitting && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Mengupload foto galeri...</span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Judul Foto</label>

            <input
              type="text"
              placeholder="Judul Foto"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className={inputCls}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Foto</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-100 file:px-3 file:py-2 file:text-pink-700 hover:file:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {isSubmitting ? "Mengupload..." : "Upload Foto"}
            </button>
          </div>
        </form>
      </div>

      {/* DATA */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Skeleton className="h-56 w-full rounded-none" />

              <div className="flex items-center justify-between gap-3 p-4">
                <Skeleton className="h-4 w-32" />

                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Belum ada foto di galeri.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative overflow-hidden">
                <img
                  src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${item.foto}`}
                  alt={item.judul}
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between gap-3 p-4">
                <h3 className="truncate font-semibold text-gray-900">{item.judul}</h3>

                <button
                  type="button"
                  onClick={() => hapusGaleri(item.id)}
                  className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

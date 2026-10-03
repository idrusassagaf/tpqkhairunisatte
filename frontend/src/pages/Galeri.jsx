import { useEffect, useState } from "react";
import { api } from "../api";

export default function Galeri() {
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Galeri TPQ</h1>

      {/* FORM */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <form onSubmit={simpanGaleri} className="space-y-4">
          {isSubmitting && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Mengupload foto galeri...</span>
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Judul Foto"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            required
            disabled={isSubmitting}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="w-full border rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            required
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl"
          >
            {isSubmitting ? "Mengupload..." : "Upload Foto"}
          </button>
        </form>
      </div>

      {/* DATA */}
      <div className="grid md:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >
            <img
              src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${item.foto}`}
              alt={item.judul}
              className="w-full h-56 object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold mb-3">{item.judul}</h3>

              <button
                onClick={() => hapusGaleri(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

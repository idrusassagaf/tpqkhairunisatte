import { notifySuccess } from "../toastStore";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Galeri() {
  const [judul, setJudul] = useState("");
  const [foto, setFoto] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGaleri();
  }, []);

  const loadGaleri = async () => {
    try {
      setLoading(true);

      const res = await api.get("/galeri");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const simpanGaleri = async (e) => {
    e.preventDefault();

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

      notifySuccess("Foto berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      alert("Gagal upload foto");
    }
  };

  const hapusGaleri = async (id) => {
    if (!confirm("Hapus foto ini?")) return;

    try {
      await api.delete(`/galeri/${id}`);
      loadGaleri();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Galeri TPQ</h1>

      {/* FORM */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <form onSubmit={simpanGaleri} className="space-y-4">
          <input
            type="text"
            placeholder="Judul Foto"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full border rounded-xl p-3"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="w-full border rounded-xl p-3"
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
          >
            Upload Foto
          </button>
        </form>
      </div>

      {/* DATA */}
      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
          <span className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin" />

          <span className="text-sm">Memuat galeri...</span>
        </div>
      ) : (
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
      )}
    </div>
  );
}

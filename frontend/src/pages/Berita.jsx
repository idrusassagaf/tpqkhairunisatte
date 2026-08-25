import { Newspaper, Plus, Search, FileText, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../api";

const STORAGE_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

export default function Berita() {
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

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    try {
      const res = await api.get("/berita");
      setDataBerita(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimpan = async () => {
    try {
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
      }

      alert("Berita berhasil disimpan");

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
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);

      alert(JSON.stringify(err.response?.data));
    }
  };

  const handleHapus = async (id) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus berita ini?");

    if (!konfirmasi) return;

    try {
      await api.delete(`/berita/${id}`);

      alert("Berita berhasil dihapus");

      loadBerita();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus berita");
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
      setPreview(`${STORAGE_URL}/storage/${item.foto}`);
    } else {
      setPreview(null);
    }

    setShowModal(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Newspaper size={24} />
        <h1 className="text-2xl font-light tracking-wide">BERITA TPQ</h1>
      </div>

      {/* CARD STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Berita</p>
              <h2 className="text-2xl font-semibold">{totalBerita}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Bulan Ini</p>
              <h2 className="text-2xl font-semibold">{bulanIni}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Hari Ini</p>
              <h2 className="text-2xl font-semibold">{hariIni}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <button
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
            className="
              flex items-center gap-2
              bg-blue-600 text-white
              px-4 py-2 rounded-lg
              hover:bg-blue-700
            "
          >
            <Plus size={18} />
            Tambah Berita
          </button>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />

            <input
              type="text"
              placeholder="Cari berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                border rounded-lg
                pl-10 pr-4 py-2
                w-full md:w-72
              "
            />
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* MOBILE CARD */}
        <div className="md:hidden p-3 space-y-3">
          {filteredBerita.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-3 bg-white shadow-sm"
            >
              {item.foto && (
                <img
                  src={`${STORAGE_URL}/storage/${item.foto}`}
                  alt=""
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <h3 className="font-semibold text-lg">{item.judul}</h3>

              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
              </p>

              <p className="mt-2 text-sm">Penulis: {item.penulis}</p>

              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    item.status === "Publish" ? "bg-green-500" : "bg-orange-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleHapus(item.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Foto</th>
                <th className="p-3 text-left">Judul</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="p-3 text-left">Penulis</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {dataBerita.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Belum ada data berita
                  </td>
                </tr>
              ) : (
                filteredBerita.map((item, index) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{index + 1}</td>

                    <td className="p-3">
                      {item.foto ? (
                        <img
                          src={`${STORAGE_URL}/storage/${item.foto}`}
                          alt=""
                          className="w-14 h-14 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3">{item.judul}</td>

                    <td className="p-3">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>

                    <td className="p-3">{item.penulis}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          item.status === "Publish"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 mr-3"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleHapus(item.id)}
                        className="text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className="
                bg-white
                w-full
                max-w-2xl
                rounded-xl
                shadow-xl
                p-6
                max-h-[90vh]
                overflow-y-auto
              "
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editId ? "Edit Berita" : "Tambah Berita"}
                </h2>

                <button
                  onClick={() => setShowModal(false)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Judul Berita"
                  className="w-full border rounded-lg p-2"
                  value={form.judul}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      judul: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Penulis"
                  className="w-full border rounded-lg p-2"
                  value={form.penulis}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      penulis: e.target.value,
                    })
                  }
                />

                <textarea
                  rows="6"
                  placeholder="Isi Berita"
                  className="w-full border rounded-lg p-2"
                  value={form.isi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isi: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full border rounded-lg p-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Publish">Publish</option>
                </select>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded-lg p-2"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    setForm({
                      ...form,
                      foto: file,
                    });

                    setPreview(URL.createObjectURL(file));
                  }}
                />

                {preview && (
                  <div className="border rounded-lg p-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="
                        w-28
                        h-18
                        object-cover
                        rounded-lg
                      "
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setPreview(null);
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSimpan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {editId ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

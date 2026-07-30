import { useEffect, useState } from "react";
import { api } from "../api";

export default function Pengumuman() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: null,
    judul: "",
    isi: "",
    status: "Aktif",
    tanggal_berakhir: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/pengumuman");
      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FORM HANDLER =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      judul: "",
      isi: "",
      status: "Aktif",
      tanggal_berakhir: "",
    });
    setIsEdit(false);
  };

  // ================= SIMPAN / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await api.put(`/pengumuman/${form.id}`, form);
      } else {
        await api.post("/pengumuman", form);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setForm(item);
    setIsEdit(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus pengumuman ini?")) return;

    await api.delete(`/pengumuman/${id}`);
    loadData();
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-light">PENGUMUMAN</h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-white space-y-2"
      >
        <input
          name="judul"
          value={form.judul}
          onChange={handleChange}
          placeholder="Judul"
          className="border p-2 w-full"
        />

        <textarea
          name="isi"
          value={form.isi}
          onChange={handleChange}
          placeholder="Isi pengumuman"
          className="border p-2 w-full"
        />

        <input
          type="date"
          name="tanggal_berakhir"
          value={form.tanggal_berakhir}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>

        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2">
            {isEdit ? "Update" : "Simpan"}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* ================= LIST ================= */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="border p-3 rounded bg-white shadow-sm"
            >
              <div className="flex justify-between">
                <h2 className="font-bold">{item.judul}</h2>
                <span className="text-sm">{item.status}</span>
              </div>

              <p className="text-gray-600">{item.isi}</p>
              <p className="text-sm text-gray-500">
                Berlaku sampai: {item.tanggal_berakhir || "-"}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-1"
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

import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye, Download, Save } from "lucide-react";
import RichTextEditor from "../components/laporan/RichTextEditor";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function LaporanRingkas() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    judul: "",
    sub_judul: "",
    narasi: {},
    status: "Aktif",
  });

  const [selectedBab, setSelectedBab] = useState("cover");

  useEffect(() => {
    loadSetting();
  }, []);

  async function loadSetting() {
    try {
      const res = await api.get("/laporan-setting");

      if (res.data.success) {
        setForm({
          judul: res.data.data.judul || "",
          sub_judul: res.data.data.sub_judul || "",
          narasi: res.data.data.narasi || {},
          status: res.data.data.status || "Aktif",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleField = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const simpanPengaturan = async () => {
    try {
      await api.put("/laporan-setting", form);

      alert("Pengaturan berhasil disimpan.");

      loadSetting();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan.");
    }
  };

  const previewPdf = () => {
    window.open(
      `${API_BASE_URL}/laporan-ringkas/view?language=id`,
      "_blank",
    );
  };

  const downloadPdf = () => {
    window.open(`${API_BASE_URL}/laporan-ringkas/pdf`, "_blank");
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat Pengaturan...</div>;
  }

  return (
    <div className="-mx-2 px-1 py-2 md:mx-0 md:p-6">
      <div className="w-auto mx-2 md:w-full md:max-w-7xl md:mx-auto bg-white rounded-2xl shadow-xl border">
        {/* HEADER */}
        <div className="border-b bg-gray-50 px-4 md:px-8 py-5 md:py-6">
          <h1 className="text-xl font-light text-gray-800">
            Pengaturan Laporan Ringkas
          </h1>

          <p className="text-gray-500 mt-1">
            Kelola narasi umum setiap bagian laporan ringkas TPQ Khairunissa.
          </p>
        </div>
        <div className="p-3 md:p-8 space-y-6">
          {/* BARIS ATAS */}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="col-span-1 md:col-span-3">
              <label className="font-semibold block mb-2">Topik</label>

              <select
                value={selectedBab}
                onChange={(e) => setSelectedBab(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="cover">Cover</option>

                <option value="pendahuluan">Pendahuluan</option>

                <option value="ringkasan">Ringkasan Eksekutif</option>

                <option value="bab1">BAB I - Data Santri</option>

                <option value="bab2">BAB II - Status Santri</option>

                <option value="bab3">BAB III - Data Guru</option>

                <option value="bab4">BAB IV - Status Guru</option>

                <option value="bab5">BAB V - Progres Iqra</option>

                <option value="bab6">BAB VI - Progres Al-Qur'an</option>

                <option value="bab7">BAB VII - Hafalan</option>

                <option value="bab8">BAB VIII - Kesimpulan</option>

                <option value="penutup">Penutup</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-4">
              <label className="font-semibold block mb-2">Judul</label>

              <input
                name="judul"
                value={form.judul}
                onChange={handleField}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div className="col-span-1 md:col-span-5">
              <label className="font-semibold block mb-2">Sub Judul</label>

              <input
                name="sub_judul"
                value={form.sub_judul}
                onChange={handleField}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          {/* EDITOR */}

          <div>
            <label className="font-semibold block mb-3">Narasi</label>

            <RichTextEditor
              value={form.narasi?.[selectedBab] ?? ""}
              onChange={(html) =>
                setForm((prev) => ({
                  ...prev,
                  narasi: {
                    ...prev.narasi,
                    [selectedBab]: html,
                  },
                }))
              }
            />
          </div>

          {/* STATUS + BUTTON */}

          <div className="flex items-center justify-between flex-wrap gap-5">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Status</span>

              <select
                name="status"
                value={form.status}
                onChange={handleField}
                className="border rounded-lg px-4 py-2"
              >
                <option value="Aktif">Aktif</option>

                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={simpanPengaturan}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Simpan
              </button>

              <button
                onClick={previewPdf}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Preview PDF
              </button>

              <button
                onClick={downloadPdf}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

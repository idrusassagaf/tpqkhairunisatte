import { notifySuccess } from "../toastStore";
import { useEffect, useState } from "react";
import { api } from "../api";
import { Eye, Download, Save } from "lucide-react";
import TinyEditor from "../components/TinyEditor";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const DAFTAR_TOPIK = [
  { value: "cover", label: "Cover" },
  { value: "pendahuluan", label: "Pendahuluan" },
  { value: "ringkasan", label: "Ringkasan Eksekutif" },
  { value: "bab1", label: "BAB I - Data Santri" },
  { value: "bab2", label: "BAB II - Status Santri" },
  { value: "bab3", label: "BAB III - Data Guru" },
  { value: "bab4", label: "BAB IV - Status Guru" },
  { value: "bab5", label: "BAB V - Progres Iqra" },
  { value: "bab6", label: "BAB VI - Progres Al-Qur'an" },
  { value: "bab7", label: "BAB VII - Hafalan" },
  { value: "bab8", label: "BAB VIII - Kesimpulan" },
  { value: "penutup", label: "Penutup" },
];

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

      notifySuccess("Pengaturan berhasil disimpan.");

      loadSetting();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan.");
    }
  };

  const previewPdf = () => {
    window.open(`${API_BASE_URL}/laporan-ringkas/view?language=id`, "_blank");
  };

  const downloadPdf = () => {
    window.open(`${API_BASE_URL}/laporan-ringkas/pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-500">
        <span className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />

        <span className="text-sm">Memuat Pengaturan...</span>
      </div>
    );
  }

  // Hanya Admin yang boleh mengubah narasi; Viewer hanya melihat
  const isAdmin = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user") || "null")?.role === "Admin"
      );
    } catch {
      return false;
    }
  })();

  return (
    <div className="-mx-2 px-1 py-2 md:mx-0 md:p-6">
      <div className="w-auto mx-2 md:w-full md:max-w-7xl md:mx-auto bg-white rounded-2xl shadow-xl border">
        {/* HEADER */}
        <div className="border-b bg-gray-50 px-4 md:px-8 py-5 md:py-6">
          <h1 className="text-xl font-light text-gray-800">
            Pengaturan Laporan Ringkas
          </h1>

          <p className="text-gray-500 mt-1">
            Kelola narasi umum setiap bagian laporan ringkas TPQ Hairunissa.
          </p>
        </div>
        <div className="p-3 md:p-8 space-y-6">
          <fieldset
            disabled={!isAdmin}
            className="border-0 m-0 p-0 min-w-0 space-y-6"
          >
            {/* BARIS ATAS */}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="col-span-1 md:col-span-6">
                <label className="font-semibold block mb-2">Judul</label>

                <input
                  name="judul"
                  value={form.judul}
                  onChange={handleField}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div className="col-span-1 md:col-span-6">
                <label className="font-semibold block mb-2">Sub Judul</label>

                <input
                  name="sub_judul"
                  value={form.sub_judul}
                  onChange={handleField}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label className="font-semibold block mb-3">Topik</label>

            <div className="flex flex-wrap gap-2">
              {DAFTAR_TOPIK.map((topik) => (
                <button
                  key={topik.value}
                  type="button"
                  onClick={() => setSelectedBab(topik.value)}
                  className={`px-3 py-2 rounded-xl border text-sm transition ${
                    selectedBab === topik.value
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {topik.label}
                </button>
              ))}
            </div>
          </div>

          <fieldset
            disabled={!isAdmin}
            className="border-0 m-0 p-0 min-w-0 space-y-6"
          >
            {/* EDITOR */}

            <div>
              <label className="font-semibold block mb-3">Narasi</label>

              <TinyEditor
                readOnly={!isAdmin}
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
          </fieldset>

          {/* STATUS + BUTTON */}

          <div className="flex items-center justify-between flex-wrap gap-5">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Status</span>

              <select
                name="status"
                value={form.status}
                onChange={handleField}
                disabled={!isAdmin}
                className="border rounded-lg px-4 py-2 disabled:opacity-60"
              >
                <option value="Aktif">Aktif</option>

                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {isAdmin && (
                <button
                  onClick={simpanPengaturan}
                  className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Simpan
                </button>
              )}

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

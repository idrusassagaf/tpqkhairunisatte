import { useEffect, useState } from "react";
import { api } from "../api";
import { Skeleton, SkeletonRows } from "../components/Skeleton";
import { Eye, Download, Save, FileText } from "lucide-react";
import RichTextEditor from "../components/laporan/RichTextEditor";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const BAB_OPTIONS = [
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

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

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

  const notify = window.__tpqNotify;

  const simpanPengaturan = async () => {
    try {
      await api.put("/laporan-setting", form);

      notify?.toast({
        type: "success",
        title: "Pengaturan berhasil disimpan",
        message: "Data laporan ringkas telah diperbarui dengan baik.",
        duration: 3200,
      });

      loadSetting();
    } catch (err) {
      console.error(err);
      notify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message: "Terjadi kesalahan saat menyimpan pengaturan laporan.",
        duration: 3600,
      });
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
      <div className="mx-auto w-full max-w-7xl space-y-5 p-3 md:p-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />

              <Skeleton className="h-3 w-80" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />

            <Skeleton className="h-10 w-32 rounded-xl" />

            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-12 md:p-6">
          <div className="space-y-2 md:col-span-5">
            <Skeleton className="h-3 w-16" />

            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="space-y-2 md:col-span-5">
            <Skeleton className="h-3 w-24" />

            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-3 w-12" />

            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          <aside className="hidden md:col-span-3 md:block">
            <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-9 md:p-6">
            <Skeleton className="mb-4 h-5 w-24" />

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <Skeleton className="h-11 w-full rounded-none" />

              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-full" />

                <Skeleton className="h-4 w-11/12" />

                <Skeleton className="h-4 w-4/5" />

                <Skeleton className="h-4 w-full" />

                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const selectedLabel =
    BAB_OPTIONS.find((b) => b.value === selectedBab)?.label ?? "";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Pengaturan Laporan Ringkas
            </h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Kelola narasi umum setiap bagian laporan ringkas TPQ Hairunissa.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={previewPdf}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:flex-none"
          >
            <Eye size={17} />
            Preview PDF
          </button>

          <button
            onClick={downloadPdf}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:flex-none"
          >
            <Download size={17} />
            Download PDF
          </button>

          <button
            onClick={simpanPengaturan}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 md:w-auto"
          >
            <Save size={17} />
            Simpan
          </button>
        </div>
      </div>

      {/* INFO UMUM */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-12 md:p-6">
        <div className="md:col-span-5">
          <label
            htmlFor="judul"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Judul
          </label>

          <input
            id="judul"
            name="judul"
            value={form.judul}
            onChange={handleField}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-5">
          <label
            htmlFor="sub_judul"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Sub Judul
          </label>

          <input
            id="sub_judul"
            name="sub_judul"
            value={form.sub_judul}
            onChange={handleField}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="status"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleField}
            className={inputClass}
          >
            <option value="Aktif">Aktif</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* EDITOR */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Daftar topik (desktop) */}
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
            <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Topik
            </p>

            <nav className="max-h-[70vh] space-y-0.5 overflow-y-auto">
              {BAB_OPTIONS.map((bab) => (
                <button
                  key={bab.value}
                  type="button"
                  onClick={() => setSelectedBab(bab.value)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedBab === bab.value
                      ? "bg-purple-50 font-medium text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {bab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <section className="space-y-4 md:col-span-9">
          {/* Pilih topik (mobile) */}
          <div className="md:hidden">
            <label
              htmlFor="topik"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Topik
            </label>

            <select
              id="topik"
              value={selectedBab}
              onChange={(e) => setSelectedBab(e.target.value)}
              className={inputClass}
            >
              {BAB_OPTIONS.map((bab) => (
                <option key={bab.value} value={bab.value}>
                  {bab.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Narasi
                </h2>

                <p className="text-sm text-gray-500">{selectedLabel}</p>
              </div>
            </div>

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
        </section>
      </div>
    </div>
  );
}

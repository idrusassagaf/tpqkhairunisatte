import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";
import RichTextEditor from "../../components/laporan/RichTextEditor";
import { isHtmlContent } from "../../utils/berita";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500";

export default function Pengumuman() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      const res = await api.get("/pengumuman");

      // Mendukung response:
      // { data: [...] }
      // maupun langsung [...]
      const hasil = res.data?.data ?? res.data ?? [];

      setData(Array.isArray(hasil) ? hasil : []);
    } catch (error) {
      console.error("Gagal mengambil data pengumuman:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM HANDLER
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

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

  // =========================================================
  // NORMALISASI ISI PENGUMUMAN
  // =========================================================
  //
  // Kita hanya merapikan line ending Windows/Linux.
  // Paragraf kosong tetap dipertahankan.
  //
  // Contoh:
  //
  // Paragraf pertama.
  //
  // Paragraf kedua.
  //
  // Tetap menjadi dua paragraf.
  //
  // =========================================================

  const normalisasiIsi = (isi) => {
    if (!isi) return "";

    return String(isi)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .trim();
  };

  // =========================================================
  // SIMPAN / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      window.__tpqLoading?.show("Menyimpan data dan menerjemahkan konten...");

      const dataKirim = {
        ...form,
        isi: normalisasiIsi(form.isi),
      };

      if (isEdit) {
        await api.put(`/pengumuman/${form.id}`, dataKirim);
      } else {
        await api.post("/pengumuman", dataKirim);
      }

      window.__tpqNotify?.toast({
        type: "success",
        title: isEdit ? "Pengumuman diperbarui" : "Pengumuman ditambahkan",
        message: "Data berhasil disimpan dan diterjemahkan.",
      });

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan pengumuman:", error);
      window.__tpqNotify?.toast({
        type: "error",
        title: "Gagal menyimpan",
        message:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSubmitting(false);
      window.__tpqLoading?.hide();
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (item) => {
    setForm({
      id: item.id ?? null,
      judul: item.judul ?? "",
      isi: item.isi ?? "",
      status: item.status ?? "Aktif",
      tanggal_berakhir: item.tanggal_berakhir ?? "",
    });

    setIsEdit(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = await window.__tpqNotify?.confirm({
      title: "Hapus pengumuman",
      message: "Yakin ingin menghapus pengumuman ini?",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      window.__tpqLoading?.show("Menghapus pengumuman...");
      await api.delete(`/pengumuman/${id}`);

      window.__tpqNotify?.toast({
        type: "success",
        title: "Pengumuman dihapus",
        message: "Data pengumuman berhasil dihapus.",
      });

      await loadData();
    } catch (error) {
      console.error("Gagal menghapus pengumuman:", error);
      window.__tpqNotify?.toast({
        type: "error",
        title: "Gagal menghapus",
        message:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat menghapus data.",
      });
    } finally {
      window.__tpqLoading?.hide();
    }
  };

  // =========================================================
  // RENDER ISI PREVIEW
  // =========================================================

  const renderIsiPreview = (isi) => {
    if (isHtmlContent(isi)) {
      return (
        <div
          className="isi-berita text-justify leading-6"
          dangerouslySetInnerHTML={{ __html: isi }}
        />
      );
    }

    const teks = normalisasiIsi(isi);

    if (!teks) {
      return "-";
    }

    /*
     * Pisahkan berdasarkan baris kosong.
     * Setiap blok menjadi satu paragraf.
     */
    const paragraf = teks
      .split(/\n\s*\n/)
      .map((item) => item.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);

    return paragraf.map((item, index) => (
      <p
        key={index}
        className="
            text-gray-600
            text-sm
            leading-5
            md:leading-7
            mb-3
            w-full
          "
        style={{
          textAlign: "justify",
          textJustify: "inter-word",
        }}
      >
        {item}
      </p>
    ));
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <Megaphone size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pengumuman</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Buat dan atur pengumuman yang tampil untuk santri dan orang tua.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
          </h2>
        </div>

        {submitting && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Menyimpan data dan menerjemahkan konten...</span>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Judul</label>

          <input
            name="judul"
            value={form.judul}
            onChange={handleChange}
            placeholder="Judul"
            disabled={submitting}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Isi Pengumuman</label>

          <RichTextEditor
            value={form.isi}
            height={320}
            onChange={(html) => setForm((prev) => ({ ...prev, isi: html }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Berlaku sampai</label>

            <input
              type="date"
              name="tanggal_berakhir"
              value={form.tanggal_berakhir}
              onChange={handleChange}
              disabled={submitting}
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={submitting}
              className={inputCls}
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-1/2" />

                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />

                <Skeleton className="h-3 w-11/12" />

                <Skeleton className="h-3 w-2/3" />
              </div>

              <Skeleton className="mt-4 h-3 w-40" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Belum ada pengumuman.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-gray-900">{item.judul}</h2>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.status === "Aktif"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-3 w-full text-sm text-gray-700">{renderIsiPreview(item.isi)}</div>

              <p className="mt-3 text-xs text-gray-500">
                Berlaku sampai: {item.tanggal_berakhir || "-"}
              </p>

              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
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

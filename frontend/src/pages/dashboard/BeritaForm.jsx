import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Newspaper, Save } from "lucide-react";
import { api } from "../../api";
import RichTextEditor from "../../components/laporan/RichTextEditor";
import ImageCropper from "../../components/ImageCropper";
import { Skeleton } from "../../components/Skeleton";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:text-gray-500";

const labelCls = "mb-1.5 block text-xs font-medium text-gray-600";

const fotoUrl = (foto) =>
  `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${foto}`;

const formKosong = {
  judul: "",
  isi: "",
  penulis: "",
  status: "Draft",
  foto: null,
};

// Halaman tambah (/dashboard/berita/tambah) dan edit (/dashboard/berita/:id/edit)
export default function BeritaForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = window.__tpqNotify;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(formKosong);
  const [preview, setPreview] = useState(null);

  // File yang sedang di-crop, dan file asli untuk crop ulang
  const [cropSource, setCropSource] = useState(null);
  const [originalFoto, setOriginalFoto] = useState(null);

  // Muat data berita saat mode edit
  useEffect(() => {
    if (!isEdit) return;

    let mounted = true;

    api
      .get("/berita")
      .then((res) => {
        if (!mounted) return;

        const item = (res.data.data || []).find(
          (b) => String(b.id) === String(id),
        );

        if (!item) {
          notify?.toast({
            type: "error",
            title: "Berita tidak ditemukan",
            message: "Berita yang diminta tidak tersedia.",
            duration: 3500,
          });

          navigate("/dashboard/berita", { replace: true });

          return;
        }

        setForm({
          judul: item.judul || "",
          isi: item.isi || "",
          penulis: item.penulis || "",
          status: item.status || "Draft",
          foto: null,
        });

        setPreview(item.foto ? fotoUrl(item.foto) : null);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSimpan = async (e) => {
    e?.preventDefault();

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

      if (isEdit) {
        formData.append("_method", "PUT");

        await api.post(`/berita/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/berita", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      notify?.toast({
        type: "success",
        title: "Berhasil disimpan",
        message: isEdit
          ? "Berita berhasil diperbarui dan terjemahan telah diperbarui."
          : "Berita berhasil ditambahkan dan sedang diproses untuk terjemahan.",
        duration: 3500,
      });

      navigate("/dashboard/berita");
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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5 p-3 md:p-6">
        <Skeleton className="h-10 w-48" />

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-10 w-full" />

          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Newspaper size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit Berita" : "Tambah Berita"}
            </h1>

            <p className="mt-0.5 text-sm text-gray-500">
              {isEdit
                ? "Perbarui isi, foto, dan status berita."
                : "Tulis berita baru untuk ditampilkan di website TPQ."}
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/berita"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Kembali ke daftar
        </Link>
      </div>

      <form
        onSubmit={handleSimpan}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
      >
        {/* JUDUL */}
        <div>
          <label htmlFor="judul" className={labelCls}>
            Judul berita
          </label>

          <input
            id="judul"
            type="text"
            placeholder="Judul berita"
            className={inputCls}
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            disabled={submitting}
            required
          />
        </div>

        {/* PENULIS + STATUS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="penulis" className={labelCls}>
              Penulis
            </label>

            <input
              id="penulis"
              type="text"
              placeholder="Nama penulis"
              className={inputCls}
              value={form.penulis}
              onChange={(e) => setForm({ ...form, penulis: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="status" className={labelCls}>
              Status
            </label>

            <select
              id="status"
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

        {/* ISI */}
        <div>
          <label className={labelCls}>Isi berita</label>

          <RichTextEditor
            value={form.isi}
            height={480}
            onChange={(html) => setForm((prev) => ({ ...prev, isi: html }))}
          />
        </div>

        {/* FOTO */}
        <div>
          <label className={labelCls}>Foto sampul</label>

          {cropSource ? (
            <ImageCropper
              file={cropSource}
              aspect={16 / 9}
              onCancel={() => setCropSource(null)}
              onDone={(cropped) => {
                setForm((prev) => ({ ...prev, foto: cropped }));
                setPreview(URL.createObjectURL(cropped));
                setCropSource(null);
              }}
            />
          ) : (
            <div className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-blue-700 hover:file:bg-blue-200"
                onChange={(e) => {
                  const file = e.target.files[0];

                  e.target.value = "";

                  if (!file) return;

                  setOriginalFoto(file);
                  setCropSource(file);
                }}
                disabled={submitting}
              />

              {preview && (
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={preview}
                    alt="Pratinjau foto"
                    className="aspect-video w-56 rounded-lg border object-cover"
                  />

                  {originalFoto && (
                    <button
                      type="button"
                      onClick={() => setCropSource(originalFoto)}
                      disabled={submitting}
                      className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Crop ulang
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AKSI */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/dashboard/berita"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={submitting || cropSource !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {submitting ? "Menyimpan..." : isEdit ? "Simpan perubahan" : "Simpan berita"}
          </button>
        </div>
      </form>
    </div>
  );
}

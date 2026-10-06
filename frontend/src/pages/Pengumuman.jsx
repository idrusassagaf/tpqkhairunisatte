import { useEffect, useState } from "react";
import { api } from "../api";

const FORM_KOSONG = {
  id: null,
  judul: "",
  isi: "",
  status: "Aktif",
  tanggal_berakhir: "",
};

export default function Pengumuman() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(FORM_KOSONG);

  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);

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
  // MODAL
  // =========================================================

  const bukaTambah = () => {
    setForm(FORM_KOSONG);
    setIsEdit(false);
    setShowModal(true);
  };

  const bukaEdit = (item) => {
    setForm({
      id: item.id ?? null,
      judul: item.judul ?? "",
      isi: item.isi ?? "",
      status: item.status ?? "Aktif",
      tanggal_berakhir: item.tanggal_berakhir ?? "",
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const tutupModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm(FORM_KOSONG);
    setIsEdit(false);
  };

  // =========================================================
  // NORMALISASI ISI PENGUMUMAN
  // =========================================================
  //
  // Kita hanya merapikan line ending Windows/Linux.
  // Paragraf kosong tetap dipertahankan.
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

    try {
      setSaving(true);

      const dataKirim = {
        ...form,
        isi: normalisasiIsi(form.isi),
      };

      if (isEdit) {
        await api.put(`/pengumuman/${form.id}`, dataKirim);
      } else {
        await api.post("/pengumuman", dataKirim);
      }

      setShowModal(false);
      setForm(FORM_KOSONG);
      setIsEdit(false);

      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan pengumuman:", error);
      alert("Gagal menyimpan pengumuman. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus pengumuman ini?")) {
      return;
    }

    try {
      await api.delete(`/pengumuman/${id}`);

      await loadData();
    } catch (error) {
      console.error("Gagal menghapus pengumuman:", error);
    }
  };

  // =========================================================
  // RENDER ISI PREVIEW
  // =========================================================

  const renderIsiPreview = (isi) => {
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
    <div className="p-4 space-y-6">
      {/* =====================================================
          JUDUL HALAMAN + TOMBOL TAMBAH
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-light">PENGUMUMAN</h1>

        <button
          type="button"
          onClick={bukaTambah}
          className="
            bg-blue-500
            hover:bg-blue-600
            text-white
            px-4
            py-2
            rounded
            transition
          "
        >
          + Tambah Pengumuman
        </button>
      </div>

      {/* =====================================================
          MODAL FORM
      ===================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={tutupModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="
              bg-white
              rounded-xl
              shadow-lg
              w-full
              max-w-2xl
              max-h-[90vh]
              flex
              flex-col
            "
          >
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between gap-3 p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
              </h2>

              <button
                type="button"
                onClick={tutupModal}
                disabled={saving}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none px-2 disabled:opacity-50"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-4 space-y-3"
            >
              <input
                name="judul"
                value={form.judul}
                onChange={handleChange}
                placeholder="Judul"
                className="
                  border
                  border-gray-300
                  p-2
                  w-full
                  rounded
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-300
                "
              />

              <textarea
                name="isi"
                value={form.isi}
                onChange={handleChange}
                placeholder="Isi pengumuman"
                rows={10}
                className="
                  border
                  border-gray-300
                  p-3
                  w-full
                  rounded
                  resize-y
                  leading-7
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-300
                "
              />

              <p className="text-xs text-gray-500">
                Tip: gunakan satu baris kosong untuk memisahkan paragraf.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Berlaku sampai
                  </label>

                  <input
                    type="date"
                    name="tanggal_berakhir"
                    value={form.tanggal_berakhir}
                    onChange={handleChange}
                    className="
                      border
                      border-gray-300
                      p-2
                      w-full
                      rounded
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-300
                    "
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="
                      border
                      border-gray-300
                      p-2
                      w-full
                      rounded
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-300
                    "
                  >
                    <option value="Aktif">Aktif</option>

                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={tutupModal}
                  disabled={saving}
                  className="
                    bg-gray-400
                    hover:bg-gray-500
                    text-white
                    px-4
                    py-2
                    rounded
                    transition
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    bg-blue-500
                    hover:bg-blue-600
                    text-white
                    px-4
                    py-2
                    rounded
                    transition
                    disabled:opacity-50
                  "
                >
                  {saving ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          LIST PENGUMUMAN
      ===================================================== */}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
          <span className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />

          <span className="text-sm">Memuat pengumuman...</span>
        </div>
      ) : data.length === 0 ? (
        <div
          className="
            border
            p-5
            rounded
            bg-white
            text-gray-500
          "
        >
          Belum ada pengumuman.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="
                border
                p-4
                rounded
                bg-white
                shadow-sm
              "
            >
              {/* =============================================
                  JUDUL + STATUS
              ============================================= */}

              <div className="flex justify-between items-start gap-3">
                <h2 className="font-bold">{item.judul}</h2>

                <span
                  className="
                    text-sm
                    whitespace-nowrap
                  "
                >
                  {item.status}
                </span>
              </div>

              {/* =============================================
                  ISI
              ============================================= */}

              <div className="mt-3 w-full">{renderIsiPreview(item.isi)}</div>

              {/* =============================================
                  TANGGAL
              ============================================= */}

              <p className="text-sm text-gray-500">
                Berlaku sampai: {item.tanggal_berakhir || "-"}
              </p>

              {/* =============================================
                  BUTTON
              ============================================= */}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => bukaEdit(item)}
                  className="
                    bg-yellow-500
                    hover:bg-yellow-600
                    text-white
                    px-3
                    py-1
                    rounded
                    transition
                  "
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-3
                    py-1
                    rounded
                    transition
                  "
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

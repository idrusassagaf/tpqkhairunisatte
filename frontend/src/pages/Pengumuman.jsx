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

    try {
      const dataKirim = {
        ...form,
        isi: normalisasiIsi(form.isi),
      };

      if (isEdit) {
        await api.put(`/pengumuman/${form.id}`, dataKirim);
      } else {
        await api.post("/pengumuman", dataKirim);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan pengumuman:", error);
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
            leading-7
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
          JUDUL HALAMAN
      ===================================================== */}

      <h1 className="text-xl font-light">PENGUMUMAN</h1>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          border
          p-4
          rounded
          bg-white
          space-y-3
        "
      >
        {/* ===================================================
            JUDUL
        =================================================== */}

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

        {/* ===================================================
            ISI PENGUMUMAN
        =================================================== */}

        <textarea
          name="isi"
          value={form.isi}
          onChange={handleChange}
          placeholder="Isi pengumuman"
          rows={12}
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

        {/* ===================================================
            TANGGAL BERAKHIR
        =================================================== */}

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

        {/* ===================================================
            STATUS
        =================================================== */}

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

        {/* ===================================================
            BUTTON
        =================================================== */}

        <div className="flex gap-2">
          <button
            type="submit"
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
            {isEdit ? "Update" : "Simpan"}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="
                bg-gray-400
                hover:bg-gray-500
                text-white
                px-4
                py-2
                rounded
                transition
              "
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* =====================================================
          LIST PENGUMUMAN
      ===================================================== */}

      {loading ? (
        <p>Loading...</p>
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
                  onClick={() => handleEdit(item)}
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

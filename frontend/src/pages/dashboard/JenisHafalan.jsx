import { useEffect, useState } from "react";
import { api } from "../../api";
import { Skeleton, SkeletonRows } from "../../components/Skeleton";
import { BookOpen, Pencil, Plus, Trash2, Check, X } from "lucide-react";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

const ambilPesanError = (err, cadangan) =>
  err?.response?.data?.message || cadangan;

export default function JenisHafalan() {
  const [loading, setLoading] = useState(true);
  const [daftar, setDaftar] = useState([]);
  const [search, setSearch] = useState("");

  const [namaBaru, setNamaBaru] = useState("");
  const [sedangTambah, setSedangTambah] = useState(false);

  const [editId, setEditId] = useState(null);
  const [namaEdit, setNamaEdit] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Notifikasi memakai toast global (sama seperti halaman lain)
  const tampilkanPesan = (tipe, teks) => {
    window.__tpqNotify?.toast({
      type: tipe === "sukses" ? "success" : "error",
      title: tipe === "sukses" ? "Berhasil" : "Gagal",
      message: teks,
    });
  };

  const loadDaftar = async () => {
    try {
      const res = await api.get("/master-hafalan");
      setDaftar(res?.data?.data || []);
    } catch (err) {
      console.error("Gagal memuat jenis hafalan:", err);
      tampilkanPesan("error", "Gagal memuat jenis hafalan");
    }
  };

  useEffect(() => {
    loadDaftar().finally(() => setLoading(false));
  }, []);

  const hasilFilter = daftar.filter((item) =>
    item.nama.toLowerCase().includes(search.trim().toLowerCase())
  );

  // =========================================================
  // TAMBAH
  // =========================================================

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!namaBaru.trim()) return;

    setSedangTambah(true);
    try {
      await api.post("/master-hafalan", { nama: namaBaru });
      setNamaBaru("");
      await loadDaftar();
      tampilkanPesan("sukses", "Jenis hafalan berhasil ditambahkan");
    } catch (err) {
      tampilkanPesan("error", ambilPesanError(err, "Gagal menambah jenis hafalan"));
    } finally {
      setSedangTambah(false);
    }
  };

  // =========================================================
  // UBAH
  // =========================================================

  const mulaiEdit = (item) => {
    setEditId(item.id);
    setNamaEdit(item.nama);
  };

  const batalEdit = () => {
    setEditId(null);
    setNamaEdit("");
  };

  const handleSimpanEdit = async (id) => {
    if (!namaEdit.trim()) return;

    setSedangSimpan(true);
    try {
      await api.put(`/master-hafalan/${id}`, { nama: namaEdit });
      batalEdit();
      await loadDaftar();
      tampilkanPesan("sukses", "Jenis hafalan berhasil diperbarui");
    } catch (err) {
      tampilkanPesan("error", ambilPesanError(err, "Gagal memperbarui jenis hafalan"));
    } finally {
      setSedangSimpan(false);
    }
  };

  // =========================================================
  // HAPUS
  // =========================================================

  const handleHapus = async (item) => {
    const jumlahPakai = item.progres_count || 0;

    // Satu modal saja: pesannya menyesuaikan apakah jenis ini sudah dipakai.
    const yakin = await window.__tpqNotify?.confirm({
      title: jumlahPakai > 0 ? "Hapus paksa jenis hafalan" : "Hapus jenis hafalan",
      message:
        jumlahPakai > 0
          ? `Jenis "${item.nama}" dipakai di ${jumlahPakai} data progres santri.\n\n` +
            `Menghapus jenis ini akan MENGHAPUS ${jumlahPakai} data progres tersebut secara permanen dan tidak bisa dikembalikan.`
          : `Hapus jenis hafalan "${item.nama}"?`,
      confirmText: jumlahPakai > 0 ? "Hapus paksa" : "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!yakin) return;

    try {
      window.__tpqLoading?.show(`Menghapus "${item.nama}"...`);
      await api.delete(`/master-hafalan/${item.id}`, {
        params: { force: 1 },
      });
      await loadDaftar();
      tampilkanPesan(
        "sukses",
        jumlahPakai > 0
          ? `Jenis hafalan dihapus beserta ${jumlahPakai} data progres`
          : "Jenis hafalan berhasil dihapus"
      );
    } catch (err) {
      tampilkanPesan("error", ambilPesanError(err, "Gagal menghapus jenis hafalan"));
    } finally {
      window.__tpqLoading?.hide();
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <SkeletonRows rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Jenis Hafalan</h1>
          <p className="text-sm text-gray-500">
            Daftar jenis hafalan yang dipakai di seluruh progres santri
          </p>
        </div>
      </div>

      {/* FORM TAMBAH */}
      <form
        onSubmit={handleTambah}
        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          className={inputCls}
          placeholder="Nama jenis hafalan baru"
          value={namaBaru}
          onChange={(e) => setNamaBaru(e.target.value)}
        />
        <button
          type="submit"
          disabled={sedangTambah || !namaBaru.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Tambah
        </button>
      </form>

      {/* PENCARIAN */}
      <input
        className={inputCls}
        placeholder="Cari jenis hafalan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* DAFTAR */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <ul className="divide-y divide-gray-100">
          {hasilFilter.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-500">
              Tidak ada jenis hafalan yang cocok
            </li>
          )}

          {hasilFilter.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="w-8 shrink-0 text-center text-xs text-gray-400">
                {item.urutan}
              </span>

              {editId === item.id ? (
                <>
                  <input
                    className={inputCls}
                    value={namaEdit}
                    autoFocus
                    onChange={(e) => setNamaEdit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSimpanEdit(item.id);
                      if (e.key === "Escape") batalEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSimpanEdit(item.id)}
                    disabled={sedangSimpan || !namaEdit.trim()}
                    className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                    title="Simpan"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={batalEdit}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    title="Batal"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-800">{item.nama}</span>
                  <button
                    onClick={() => mulaiEdit(item)}
                    className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"
                    title="Ubah"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleHapus(item)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        Jenis yang sudah dipakai di data progres santri hanya bisa dihapus paksa, dan data
        progresnya ikut terhapus. Mengubah nama akan ikut mengubah nama di data progres.
      </p>
    </div>
  );
}

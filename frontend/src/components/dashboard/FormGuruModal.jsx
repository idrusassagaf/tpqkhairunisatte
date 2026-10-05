import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../../api";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100";
const labelCls = "mb-1.5 block text-xs font-medium text-gray-600";

const KOSONG = {
  nama_guru: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  usia: "",
  pendidikan: "",
  pekerjaan: "",
  kontak: "",
  foto: null,
};

const hitungUsia = (tanggal) => {
  const lahir = new Date(tanggal);
  const today = new Date();
  let usia = today.getFullYear() - lahir.getFullYear();
  const m = today.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) usia--;
  return usia;
};

// Mode tambah: guru = null. Mode ubah: guru = baris guru dari API.
export default function FormGuruModal({ guru, onClose, onSaved }) {
  const [form, setForm] = useState(KOSONG);
  const [menyimpan, setMenyimpan] = useState(false);
  const isEdit = Boolean(guru);

  useEffect(() => {
    if (!guru) {
      setForm(KOSONG);
      return;
    }
    setForm({
      nama_guru: guru.nama_guru || "",
      jenis_kelamin: guru.jenis_kelamin || "L",
      tanggal_lahir: guru.tanggal_lahir || "",
      usia: guru.usia ?? "",
      pendidikan: guru.pendidikan || "",
      pekerjaan: guru.pekerjaan || "",
      kontak: guru.kontak || "",
      foto: null,
    });
  }, [guru]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTanggal = (e) => {
    const tgl = e.target.value;
    setForm((prev) => ({ ...prev, tanggal_lahir: tgl, usia: hitungUsia(tgl) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_guru || !form.tanggal_lahir) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Data belum lengkap",
        message: "Nama dan tanggal lahir guru wajib diisi.",
      });
      return;
    }

    const fd = new FormData();
    fd.append("nama_guru", form.nama_guru);
    fd.append("jenis_kelamin", form.jenis_kelamin);
    fd.append("tanggal_lahir", form.tanggal_lahir);
    fd.append("usia", form.usia);
    fd.append("pendidikan", form.pendidikan);
    fd.append("pekerjaan", form.pekerjaan);
    fd.append("kontak", form.kontak);
    if (form.foto) fd.append("foto", form.foto);

    const url = isEdit ? `/guru/${guru.id}?_method=PUT` : "/guru";

    setMenyimpan(true);
    try {
      await api.post(url, fd, { headers: { "Content-Type": "multipart/form-data" } });
      window.__tpqNotify?.toast({
        type: "success",
        title: isEdit ? "Data guru diperbarui" : "Guru ditambahkan",
        message: `Data ${form.nama_guru} berhasil disimpan.`,
      });
      onSaved();
    } catch (err) {
      window.__tpqNotify?.toast({
        type: "error",
        title: "Gagal menyimpan guru",
        message: err?.response?.data?.message || "Periksa kembali data yang diisi.",
      });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Ubah Data Guru" : "Tambah Guru"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelCls}>Nama Guru *</label>
            <input className={inputCls} name="nama_guru" value={form.nama_guru} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Jenis Kelamin</label>
            <select className={inputCls} name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tanggal Lahir *</label>
            <input type="date" className={inputCls} value={form.tanggal_lahir} onChange={handleTanggal} />
          </div>
          <div>
            <label className={labelCls}>Usia</label>
            <input className={inputCls} value={form.usia} readOnly />
          </div>
          <div>
            <label className={labelCls}>Pendidikan</label>
            <input className={inputCls} name="pendidikan" value={form.pendidikan} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Pekerjaan</label>
            <input className={inputCls} name="pekerjaan" value={form.pekerjaan} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Kontak</label>
            <input className={inputCls} name="kontak" value={form.kontak} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Foto</label>
            <input
              type="file"
              accept="image/*"
              className={inputCls}
              onChange={(e) => setForm((prev) => ({ ...prev, foto: e.target.files[0] || null }))}
            />
          </div>

          <div className="flex justify-end gap-2 md:col-span-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={menyimpan} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {menyimpan ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

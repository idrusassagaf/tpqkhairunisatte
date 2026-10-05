import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../../api";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100";
const labelCls = "mb-1.5 block text-xs font-medium text-gray-600";
const readonlyCls =
  "w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500";

const KOSONG = {
  nama: "",
  nis: "",
  kelas: "",
  jenis_kelamin: "L",
  tanggal_lahir: "",
  usia: "",
  alamat: "",
  kontak: "",
  nama_ayah: "",
  pekerjaan_ayah: "",
  nama_ibu: "",
  pekerjaan_ibu: "",
  status_orangtua: "",
  status_anak: "",
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

const STATUS_ANAK = {
  ayah_wafat: "Anak Yatim",
  ibu_wafat: "Anak Piatu",
  keduanya_wafat: "Yatim Piatu",
  keduanya_hidup: "Santunan OT",
};

// Mode tambah: santri = null. Mode ubah: santri = baris santri dari API.
export default function FormSantriModal({ santri, onClose, onSaved }) {
  const [form, setForm] = useState(KOSONG);
  const [menyimpan, setMenyimpan] = useState(false);
  const isEdit = Boolean(santri);

  useEffect(() => {
    if (!santri) {
      setForm(KOSONG);
      return;
    }
    setForm({
      nama: santri.nama || "",
      nis: santri.nis || "",
      kelas: santri.kelas || "",
      jenis_kelamin: santri.jenis_kelamin || "L",
      tanggal_lahir: santri.tanggal_lahir || "",
      usia: santri.usia ?? "",
      alamat: santri.alamat || "",
      kontak: santri.kontak || "",
      nama_ayah: santri.orang_tua?.nama_ayah || "",
      pekerjaan_ayah: santri.orang_tua?.pekerjaan_ayah || "",
      nama_ibu: santri.orang_tua?.nama_ibu || "",
      pekerjaan_ibu: santri.orang_tua?.pekerjaan_ibu || "",
      status_orangtua: santri.status_orangtua || "",
      status_anak: santri.status_anak || "",
      foto: null,
    });
  }, [santri]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTanggal = (e) => {
    const tgl = e.target.value;
    setForm((prev) => ({ ...prev, tanggal_lahir: tgl, usia: hitungUsia(tgl) }));
  };

  const handleStatusOrtu = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      status_orangtua: value,
      status_anak: STATUS_ANAK[value] || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama || !form.tanggal_lahir || !form.status_orangtua) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Data belum lengkap",
        message: "Nama, tanggal lahir, dan status orang tua wajib diisi.",
      });
      return;
    }

    const fd = new FormData();
    fd.append("nama", form.nama);
    fd.append("kelas", form.kelas);
    fd.append("jenis_kelamin", form.jenis_kelamin);
    fd.append("tanggal_lahir", form.tanggal_lahir);
    fd.append("usia", form.usia);
    fd.append("alamat", form.alamat);
    fd.append("kontak", form.kontak);
    fd.append("status_orangtua", form.status_orangtua);
    fd.append("status_anak", form.status_anak);
    fd.append("orang_tua[nama_ayah]", form.nama_ayah);
    fd.append("orang_tua[pekerjaan_ayah]", form.pekerjaan_ayah);
    fd.append("orang_tua[nama_ibu]", form.nama_ibu);
    fd.append("orang_tua[pekerjaan_ibu]", form.pekerjaan_ibu);
    if (form.foto) fd.append("foto", form.foto);

    const url = isEdit ? `/master-data/${santri.id}?_method=PUT` : "/master-data";

    setMenyimpan(true);
    try {
      await api.post(url, fd, { headers: { "Content-Type": "multipart/form-data" } });
      window.__tpqNotify?.toast({
        type: "success",
        title: isEdit ? "Data santri diperbarui" : "Santri ditambahkan",
        message: `Data ${form.nama} berhasil disimpan.`,
      });
      onSaved();
    } catch (err) {
      window.__tpqNotify?.toast({
        type: "error",
        title: "Gagal menyimpan santri",
        message: err?.response?.data?.message || "Periksa kembali data yang diisi.",
      });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Ubah Data Santri" : "Tambah Santri"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div>
            <label className={labelCls}>Nama Santri *</label>
            <input className={inputCls} name="nama" value={form.nama} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>NIS</label>
            <input
              className={readonlyCls}
              value={isEdit ? form.nis : "Dibuat otomatis saat disimpan"}
              readOnly
            />
          </div>
          <div>
            <label className={labelCls}>Jenis Kelamin</label>
            <select className={inputCls} name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Kelas</label>
            <input className={inputCls} name="kelas" value={form.kelas} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Tanggal Lahir *</label>
            <input type="date" className={inputCls} value={form.tanggal_lahir} onChange={handleTanggal} />
          </div>
          <div>
            <label className={labelCls}>Usia</label>
            <input className={inputCls} value={form.usia} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Alamat</label>
            <input className={inputCls} name="alamat" value={form.alamat} onChange={handleChange} />
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

          <div>
            <label className={labelCls}>Nama Ayah</label>
            <input className={inputCls} name="nama_ayah" value={form.nama_ayah} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Pekerjaan Ayah</label>
            <input className={inputCls} name="pekerjaan_ayah" value={form.pekerjaan_ayah} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Nama Ibu</label>
            <input className={inputCls} name="nama_ibu" value={form.nama_ibu} onChange={handleChange} />
          </div>
          <div>
            <label className={labelCls}>Pekerjaan Ibu</label>
            <input className={inputCls} name="pekerjaan_ibu" value={form.pekerjaan_ibu} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Status Orang Tua *</label>
            <select className={inputCls} value={form.status_orangtua} onChange={handleStatusOrtu}>
              <option value="">-- Pilih --</option>
              <option value="keduanya_hidup">Kedua orang tua hidup</option>
              <option value="ayah_wafat">Ayah wafat</option>
              <option value="ibu_wafat">Ibu wafat</option>
              <option value="keduanya_wafat">Kedua orang tua wafat</option>
            </select>
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

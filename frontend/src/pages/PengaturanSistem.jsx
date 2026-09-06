import { useEffect, useRef, useState } from "react";
import {
  Settings,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
  Save,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Heart,
  Award,
  ClipboardList,
} from "lucide-react";
import { api } from "../api";

export default function PengaturanSistem() {
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [form, setForm] = useState({
    // IDENTITAS
    nama_tpq: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    no_hp: "",
    email: "",

    // PROFIL
    profil: "",
    visi: "",
    misi: "",
    nilai_akhlak: "",
    nilai_quran: "",
    nilai_disiplin: "",
    nilai_prestasi: "",

    // PROGRAM
    program_iqra: "",
    program_quran: "",
    program_tahfidz: "",

    // KEUNGGULAN
    keunggulan_iqra_quran: "",
    keunggulan_ibadah: "",
    keunggulan_akhlak: "",
    keunggulan_guru: "",

    // PERSYARATAN
    syarat_gratis: "",
    syarat_form: "",
    syarat_kk: "",
    syarat_ktp: "",
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadPengaturan();
  }, []);

  const loadPengaturan = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get("/pengaturan-sistem");

      const data = response.data?.data;

      if (!data) {
        throw new Error("Data pengaturan sistem tidak ditemukan.");
      }

      setForm({
        // IDENTITAS
        nama_tpq: data.nama_tpq || "",
        alamat: data.alamat || "",
        kelurahan: data.kelurahan || "",
        kecamatan: data.kecamatan || "",
        kota: data.kota || "",
        provinsi: data.provinsi || "",
        no_hp: data.no_hp || "",
        email: data.email || "",

        // PROFIL
        profil: data.profil || "",
        visi: data.visi || "",
        misi: data.misi || "",
        nilai_akhlak: data.nilai_akhlak || "",
        nilai_quran: data.nilai_quran || "",
        nilai_disiplin: data.nilai_disiplin || "",
        nilai_prestasi: data.nilai_prestasi || "",

        // PROGRAM
        program_iqra: data.program_iqra || "",
        program_quran: data.program_quran || "",
        program_tahfidz: data.program_tahfidz || "",

        // KEUNGGULAN
        keunggulan_iqra_quran: data.keunggulan_iqra_quran || "",
        keunggulan_ibadah: data.keunggulan_ibadah || "",
        keunggulan_akhlak: data.keunggulan_akhlak || "",
        keunggulan_guru: data.keunggulan_guru || "",

        // PERSYARATAN
        syarat_gratis: data.syarat_gratis || "",
        syarat_form: data.syarat_form || "",
        syarat_kk: data.syarat_kk || "",
        syarat_ktp: data.syarat_ktp || "",
      });

      // ========================================================
      // LOGO
      // ========================================================

      if (data.logo_url) {
        setLogoPreview(data.logo_url);
      } else {
        setLogoPreview(null);
      }
    } catch (err) {
      console.error("Gagal mengambil pengaturan sistem:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil data pengaturan sistem.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ============================================================
  // LOGO
  // ============================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Logo harus berupa JPG, JPEG, PNG, atau WEBP.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran logo maksimal 2 MB.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setLogoFile(file);

    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);

    setSuccess("");
    setError("");
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSuccess("");
    setError("");
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();

      // ========================================================
      // IDENTITAS
      // ========================================================

      formData.append("nama_tpq", form.nama_tpq);
      formData.append("alamat", form.alamat);
      formData.append("kelurahan", form.kelurahan);
      formData.append("kecamatan", form.kecamatan);
      formData.append("kota", form.kota);
      formData.append("provinsi", form.provinsi);

      formData.append("no_hp", form.no_hp);
      formData.append("email", form.email);

      // ========================================================
      // PROFIL TPQ
      // ========================================================

      formData.append("profil", form.profil);
      formData.append("visi", form.visi);
      formData.append("misi", form.misi);

      formData.append("nilai_akhlak", form.nilai_akhlak);
      formData.append("nilai_quran", form.nilai_quran);
      formData.append("nilai_disiplin", form.nilai_disiplin);
      formData.append("nilai_prestasi", form.nilai_prestasi);

      // ========================================================
      // PROGRAM
      // ========================================================

      formData.append("program_iqra", form.program_iqra);
      formData.append("program_quran", form.program_quran);
      formData.append("program_tahfidz", form.program_tahfidz);

      // ========================================================
      // KEUNGGULAN
      // ========================================================

      formData.append("keunggulan_iqra_quran", form.keunggulan_iqra_quran);

      formData.append("keunggulan_ibadah", form.keunggulan_ibadah);

      formData.append("keunggulan_akhlak", form.keunggulan_akhlak);

      formData.append("keunggulan_guru", form.keunggulan_guru);

      // ========================================================
      // PERSYARATAN
      // ========================================================

      formData.append("syarat_gratis", form.syarat_gratis);
      formData.append("syarat_form", form.syarat_form);
      formData.append("syarat_kk", form.syarat_kk);
      formData.append("syarat_ktp", form.syarat_ktp);

      // ========================================================
      // LOGO
      // ========================================================

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      // ========================================================
      // POST
      // ========================================================

      const response = await api.post("/pengaturan-sistem", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data?.data;

      // ========================================================
      // UPDATE PREVIEW LOGO
      // ========================================================

      if (data?.logo_url) {
        setLogoPreview(data.logo_url);
      }

      setLogoFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess(
        response.data?.message || "Pengaturan sistem berhasil disimpan.",
      );
    } catch (err) {
      console.error("Gagal menyimpan pengaturan:", err);

      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)?.[0]?.[0];

        setError(firstError || "Data pengaturan sistem tidak valid.");
      } else {
        setError(
          err.response?.data?.message || "Gagal menyimpan pengaturan sistem.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // STYLE
  // ============================================================

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 size={32} className="animate-spin text-emerald-600" />

              <span className="text-sm">Memuat pengaturan sistem...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Settings size={24} className="text-emerald-700" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800 md:text-2xl">
                Pengaturan Sistem
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Kelola identitas, profil, program, keunggulan, persyaratan,
                logo, dan seluruh konten website TPQ Khairunissa.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ====================================================
              IDENTITAS TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Building2 size={20} className="text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Identitas TPQ</h2>

                <p className="text-xs text-gray-500">
                  Informasi dasar lembaga TPQ
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="nama_tpq" className={labelClass}>
                Nama TPQ <span className="text-red-500">*</span>
              </label>

              <input
                id="nama_tpq"
                name="nama_tpq"
                type="text"
                value={form.nama_tpq}
                onChange={handleChange}
                className={inputClass}
                placeholder="Masukkan nama TPQ"
                required
              />
            </div>
          </div>

          {/* ====================================================
              ALAMAT TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <MapPin size={20} className="text-orange-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Alamat TPQ</h2>

                <p className="text-xs text-gray-500">
                  Lokasi dan alamat lengkap TPQ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="alamat" className={labelClass}>
                  Alamat <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="alamat"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Masukkan alamat lengkap TPQ"
                  required
                />
              </div>

              <div>
                <label htmlFor="kelurahan" className={labelClass}>
                  Kelurahan <span className="text-red-500">*</span>
                </label>

                <input
                  id="kelurahan"
                  name="kelurahan"
                  type="text"
                  value={form.kelurahan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Kelurahan"
                  required
                />
              </div>

              <div>
                <label htmlFor="kecamatan" className={labelClass}>
                  Kecamatan <span className="text-red-500">*</span>
                </label>

                <input
                  id="kecamatan"
                  name="kecamatan"
                  type="text"
                  value={form.kecamatan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Kecamatan"
                  required
                />
              </div>

              <div>
                <label htmlFor="kota" className={labelClass}>
                  Kota <span className="text-red-500">*</span>
                </label>

                <input
                  id="kota"
                  name="kota"
                  type="text"
                  value={form.kota}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Kota"
                  required
                />
              </div>

              <div>
                <label htmlFor="provinsi" className={labelClass}>
                  Provinsi <span className="text-red-500">*</span>
                </label>

                <input
                  id="provinsi"
                  name="provinsi"
                  type="text"
                  value={form.provinsi}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Provinsi"
                  required
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              INFORMASI KONTAK
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Phone size={20} className="text-purple-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Informasi Kontak</h2>

                <p className="text-xs text-gray-500">
                  Nomor telepon dan alamat email TPQ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="no_hp" className={labelClass}>
                  Nomor HP
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="no_hp"
                    name="no_hp"
                    type="text"
                    value={form.no_hp}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              LOGO TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <ImageIcon size={20} className="text-emerald-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Logo TPQ</h2>

                <p className="text-xs text-gray-500">
                  Logo resmi TPQ yang digunakan secara global pada sistem.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo TPQ"
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon size={34} />

                    <span className="text-xs">Belum ada logo</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Upload size={18} />

                    {logoPreview ? "Ganti Logo" : "Pilih Logo"}
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      <X size={18} />
                      Hapus
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Format yang didukung: JPG, JPEG, PNG, WEBP.
                  <br />
                  Ukuran maksimal 2 MB.
                  <br />
                  Logo ini akan menjadi identitas global TPQ.
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PROFIL TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <FileText size={20} className="text-indigo-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Profil TPQ</h2>

                <p className="text-xs text-gray-500">
                  Profil, visi, misi, dan nilai-nilai TPQ
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="profil" className={labelClass}>
                  Profil TPQ
                </label>

                <textarea
                  id="profil"
                  name="profil"
                  value={form.profil}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                  placeholder="Tuliskan profil lengkap TPQ..."
                />
              </div>

              <div>
                <label htmlFor="visi" className={labelClass}>
                  Visi
                </label>

                <textarea
                  id="visi"
                  name="visi"
                  value={form.visi}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Tuliskan visi TPQ..."
                />
              </div>

              <div>
                <label htmlFor="misi" className={labelClass}>
                  Misi
                </label>

                <textarea
                  id="misi"
                  name="misi"
                  value={form.misi}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Tuliskan misi TPQ..."
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              NILAI-NILAI TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                <Heart size={20} className="text-pink-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Nilai-Nilai TPQ</h2>

                <p className="text-xs text-gray-500">
                  Nilai utama yang menjadi dasar pembinaan santri
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="nilai_akhlak" className={labelClass}>
                  Nilai Akhlak
                </label>

                <textarea
                  id="nilai_akhlak"
                  name="nilai_akhlak"
                  value={form.nilai_akhlak}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Nilai akhlak..."
                />
              </div>

              <div>
                <label htmlFor="nilai_quran" className={labelClass}>
                  Nilai Al-Qur'an
                </label>

                <textarea
                  id="nilai_quran"
                  name="nilai_quran"
                  value={form.nilai_quran}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Nilai Al-Qur'an..."
                />
              </div>

              <div>
                <label htmlFor="nilai_disiplin" className={labelClass}>
                  Nilai Disiplin
                </label>

                <textarea
                  id="nilai_disiplin"
                  name="nilai_disiplin"
                  value={form.nilai_disiplin}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Nilai disiplin..."
                />
              </div>

              <div>
                <label htmlFor="nilai_prestasi" className={labelClass}>
                  Nilai Prestasi
                </label>

                <textarea
                  id="nilai_prestasi"
                  name="nilai_prestasi"
                  value={form.nilai_prestasi}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Nilai prestasi..."
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              PROGRAM TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <BookOpen size={20} className="text-amber-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Program TPQ</h2>

                <p className="text-xs text-gray-500">
                  Program pembelajaran yang tersedia
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="program_iqra" className={labelClass}>
                  Program Iqra
                </label>

                <textarea
                  id="program_iqra"
                  name="program_iqra"
                  value={form.program_iqra}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Deskripsi program Iqra..."
                />
              </div>

              <div>
                <label htmlFor="program_quran" className={labelClass}>
                  Program Al-Qur'an
                </label>

                <textarea
                  id="program_quran"
                  name="program_quran"
                  value={form.program_quran}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Deskripsi program Al-Qur'an..."
                />
              </div>

              <div>
                <label htmlFor="program_tahfidz" className={labelClass}>
                  Program Tahfidz
                </label>

                <textarea
                  id="program_tahfidz"
                  name="program_tahfidz"
                  value={form.program_tahfidz}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Deskripsi program tahfidz..."
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              KEUNGGULAN TPQ
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Award size={20} className="text-green-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Mengapa Memilih TPQ</h2>

                <p className="text-xs text-gray-500">
                  Keunggulan TPQ yang ditampilkan pada website public
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="keunggulan_iqra_quran" className={labelClass}>
                  Iqra & Al-Qur'an
                </label>

                <textarea
                  id="keunggulan_iqra_quran"
                  name="keunggulan_iqra_quran"
                  value={form.keunggulan_iqra_quran}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Keunggulan pembelajaran Iqra dan Al-Qur'an..."
                />
              </div>

              <div>
                <label htmlFor="keunggulan_ibadah" className={labelClass}>
                  Praktik Ibadah
                </label>

                <textarea
                  id="keunggulan_ibadah"
                  name="keunggulan_ibadah"
                  value={form.keunggulan_ibadah}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Keunggulan praktik ibadah..."
                />
              </div>

              <div>
                <label htmlFor="keunggulan_akhlak" className={labelClass}>
                  Pembinaan Akhlak
                </label>

                <textarea
                  id="keunggulan_akhlak"
                  name="keunggulan_akhlak"
                  value={form.keunggulan_akhlak}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Keunggulan pembinaan akhlak..."
                />
              </div>

              <div>
                <label htmlFor="keunggulan_guru" className={labelClass}>
                  Guru / Ustadz & Ustadzah
                </label>

                <textarea
                  id="keunggulan_guru"
                  name="keunggulan_guru"
                  value={form.keunggulan_guru}
                  onChange={handleChange}
                  rows={5}
                  className={inputClass}
                  placeholder="Keunggulan guru..."
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              PERSYARATAN PENDAFTARAN
          ==================================================== */}

          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                <ClipboardList size={20} className="text-sky-600" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Persyaratan Pendaftaran
                </h2>

                <p className="text-xs text-gray-500">
                  Informasi persyaratan yang ditampilkan pada website public
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="syarat_gratis" className={labelClass}>
                  Gratis
                </label>

                <textarea
                  id="syarat_gratis"
                  name="syarat_gratis"
                  value={form.syarat_gratis}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Informasi biaya pendaftaran..."
                />
              </div>

              <div>
                <label htmlFor="syarat_form" className={labelClass}>
                  Formulir
                </label>

                <textarea
                  id="syarat_form"
                  name="syarat_form"
                  value={form.syarat_form}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Informasi formulir pendaftaran..."
                />
              </div>

              <div>
                <label htmlFor="syarat_kk" className={labelClass}>
                  Kartu Keluarga
                </label>

                <textarea
                  id="syarat_kk"
                  name="syarat_kk"
                  value={form.syarat_kk}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Persyaratan Kartu Keluarga..."
                />
              </div>

              <div>
                <label htmlFor="syarat_ktp" className={labelClass}>
                  KTP Orang Tua / Wali
                </label>

                <textarea
                  id="syarat_ktp"
                  name="syarat_ktp"
                  value={form.syarat_ktp}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Persyaratan KTP..."
                />
              </div>
            </div>
          </div>

          {/* ====================================================
              SIMPAN
          ==================================================== */}

          <div className="flex justify-end pb-8">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={19} />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

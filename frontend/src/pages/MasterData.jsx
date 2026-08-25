import { useState, useEffect } from "react";
import { api } from "../api";

export default function MasterData() {
  // ================= SANTRI =================
  const [form, setForm] = useState({
    nama: "",
    nis: "",
    kelas: "",
    jenis_kelamin: "L",
    tanggal_lahir: "",
    usia: "",
    alamat: "",
    foto: null,

    nama_ayah: "",
    pekerjaan_ayah: "",
    nama_ibu: "",
    pekerjaan_ibu: "",
    kontak: "",

    status_orangtua: "",
    status_anak: "",
  });

  // ================= TAB =================
  const [tab, setTab] = useState("santri");

  // ================= GURU =================
  const [formGuru, setFormGuru] = useState({
    nama_guru: "",
    nig: "",
    jenis_kelamin: "L",
    tanggal_lahir: "",
    usia: "",
    pendidikan: "",
    pekerjaan: "",
    kontak: "",
    foto: null,
  });

  // ================= DATA VIEW =================
  const [dataSantri, setDataSantri] = useState([]);
  const [searchSantri, setSearchSantri] = useState("");

  const [dataGuru, setDataGuru] = useState([]);
  const [searchGuru, setSearchGuru] = useState("");

  const [editSantriId, setEditSantriId] = useState(null);
  const [editGuruId, setEditGuruId] = useState(null);

  // =========================================================
  // PAGINATION
  // =========================================================

  const ITEMS_PER_PAGE = 10;

  const [santriPage, setSantriPage] = useState(1);
  const [guruPage, setGuruPage] = useState(1);

  // ================= SANTRI =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateNIS = () => {
    const angka = Math.floor(1000 + Math.random() * 9000);
    return `S-${angka}`;
  };

  const handleTanggalSantri = (e) => {
    const tgl = e.target.value;
    const lahir = new Date(tgl);
    const today = new Date();

    let usia = today.getFullYear() - lahir.getFullYear();
    const m = today.getMonth() - lahir.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) {
      usia--;
    }

    setForm({
      ...form,
      tanggal_lahir: tgl,
      usia,
    });
  };

  const handleFotoSantri = (e) => {
    setForm({
      ...form,
      foto: e.target.files[0],
    });
  };

  const handleStatusOrtu = (e) => {
    const value = e.target.value;

    let statusAnak = "";

    if (value === "ayah_wafat") statusAnak = "Anak Yatim";
    else if (value === "ibu_wafat") statusAnak = "Anak Piatu";
    else if (value === "keduanya_wafat") statusAnak = "Yatim Piatu";
    else if (value === "keduanya_hidup") statusAnak = "Santunan OT";

    setForm({
      ...form,
      status_orangtua: value,
      status_anak: statusAnak,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("EDIT ID:", editSantriId);

    if (!form.nama || !form.tanggal_lahir || !form.status_orangtua) {
      alert("Isi data wajib dulu bro!");
      return;
    }

    const formData = new FormData();

    formData.append("nama", form.nama);
    formData.append("nis", form.nis);
    formData.append("kelas", form.kelas);
    formData.append("jenis_kelamin", form.jenis_kelamin);
    formData.append("tanggal_lahir", form.tanggal_lahir);
    formData.append("usia", form.usia);
    formData.append("alamat", form.alamat);
    formData.append("kontak", form.kontak);
    formData.append("status_orangtua", form.status_orangtua);
    formData.append("status_anak", form.status_anak);

    formData.append("orang_tua[nama_ayah]", form.nama_ayah);
    formData.append("orang_tua[pekerjaan_ayah]", form.pekerjaan_ayah);
    formData.append("orang_tua[nama_ibu]", form.nama_ibu);
    formData.append("orang_tua[pekerjaan_ibu]", form.pekerjaan_ibu);

    if (form.foto) {
      formData.append("foto", form.foto);
    }

    const request = editSantriId
      ? api.post(`/master-data/${editSantriId}?_method=PUT`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      : api.post("/master-data", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

    request
      .then((res) => {
        console.log("HASIL SIMPAN:", res.data);

        alert("Alhamdulillah... Data santri berhasil");

        setEditSantriId(null);

        setForm({
          nama: "",
          nis: "",
          kelas: "",
          jenis_kelamin: "L",
          tanggal_lahir: "",
          usia: "",
          alamat: "",
          foto: null,
          nama_ayah: "",
          pekerjaan_ayah: "",
          nama_ibu: "",
          pekerjaan_ibu: "",
          kontak: "",
          status_orangtua: "",
          status_anak: "",
        });

        fetchSantri();

        setSantriPage(1);
        setTab("viewSantri");
      })
      .catch((err) => {
        console.error("ERROR FULL:", err);
        console.error("ERROR DATA:", err.response?.data);
        console.error("ERROR VALIDATION:", err.response?.data?.errors);

        alert(err.response?.data?.error || "Gagal input santri");
      });
  };

  // ================= GURU =================
  const handleChangeGuru = (e) => {
    setFormGuru({
      ...formGuru,
      [e.target.name]: e.target.value,
    });
  };

  const generateNIG = () => {
    const angka = Math.floor(1000 + Math.random() * 9000);
    return `G-${angka}`;
  };

  const hitungUsia = (tanggal) => {
    const lahir = new Date(tanggal);
    const today = new Date();

    let usia = today.getFullYear() - lahir.getFullYear();
    const m = today.getMonth() - lahir.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) {
      usia--;
    }

    return usia;
  };

  const handleTanggalGuru = (e) => {
    const tgl = e.target.value;

    setFormGuru({
      ...formGuru,
      tanggal_lahir: tgl,
      usia: hitungUsia(tgl),
    });
  };

  const handleFotoGuru = (e) => {
    setFormGuru({
      ...formGuru,
      foto: e.target.files[0],
    });
  };

  const handleSubmitGuru = (e) => {
    e.preventDefault();

    if (!formGuru.nama_guru || !formGuru.tanggal_lahir) {
      alert("Isi data guru dulu bro!");
      return;
    }

    const formData = new FormData();

    formData.append("nama_guru", formGuru.nama_guru);
    formData.append("nig", formGuru.nig);
    formData.append("jenis_kelamin", formGuru.jenis_kelamin);
    formData.append("tanggal_lahir", formGuru.tanggal_lahir);
    formData.append("usia", formGuru.usia);
    formData.append("pendidikan", formGuru.pendidikan);
    formData.append("pekerjaan", formGuru.pekerjaan);
    formData.append("kontak", formGuru.kontak);

    if (formGuru.foto) {
      formData.append("foto", formGuru.foto);
    }

    const request = editGuruId
      ? api.post(`/guru/${editGuruId}?_method=PUT`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      : api.post("/master-data", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

    request
      .then(() => {
        alert("Alhamdulillah... Data guru berhasil");

        setEditGuruId(null);

        setFormGuru({
          nama_guru: "",
          nig: "",
          jenis_kelamin: "L",
          tanggal_lahir: "",
          usia: "",
          pendidikan: "",
          pekerjaan: "",
          kontak: "",
          foto: null,
        });

        fetchGuru();

        setGuruPage(1);
        setTab("viewGuru");
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal simpan guru");
      });
  };

  // ================= FETCH DATA =================
  const fetchSantri = async () => {
    try {
      const res = await api.get("/master-data");

      console.log("SANTRI:", res.data);

      setDataSantri(res?.data?.data?.santri || []);
    } catch (err) {
      console.error(err);
      setDataSantri([]);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await api.get("/master-data");

      console.log("GURU:", res.data);

      setDataGuru(res?.data?.data?.guru || []);
    } catch (err) {
      console.error(err);
      setDataGuru([]);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    if (tab === "santri") {
      setForm((prev) => ({
        ...prev,
        nis: generateNIS(),
      }));
    }

    if (tab === "guru") {
      setFormGuru((prev) => ({
        ...prev,
        nig: generateNIG(),
      }));
    }

    if (tab === "viewSantri") {
      setSantriPage(1);
      fetchSantri();
    }

    if (tab === "viewGuru") {
      setGuruPage(1);
      fetchGuru();
    }
  }, [tab]);

  // ================= DELETE =================
  const handleDeleteSantri = async (id) => {
    if (!confirm("Yakin mau hapus?")) return;

    try {
      await api.delete(`/master-data/${id}`);

      alert("Berhasil dihapus");

      fetchSantri();

      // Pastikan halaman tetap valid setelah data dihapus
      setSantriPage((prev) => {
        const totalAfterDelete = filteredSantri.length - 1;
        const maxPage = Math.max(
          1,
          Math.ceil(totalAfterDelete / ITEMS_PER_PAGE),
        );

        return Math.min(prev, maxPage);
      });
    } catch (err) {
      console.error(err);
      alert("Gagal hapus");
    }
  };

  const handleDeleteGuru = async (id) => {
    if (!confirm("Yakin mau hapus guru?")) return;

    try {
      await api.delete(`/guru/${id}`);

      alert("Guru berhasil dihapus");

      fetchGuru();

      setGuruPage((prev) => {
        const totalAfterDelete = filteredGuru.length - 1;
        const maxPage = Math.max(
          1,
          Math.ceil(totalAfterDelete / ITEMS_PER_PAGE),
        );

        return Math.min(prev, maxPage);
      });
    } catch (err) {
      console.error(err);
      alert("Gagal hapus guru");
    }
  };

  // =========================================================
  // FILTER SANTRI
  // =========================================================

  const filteredSantri = dataSantri.filter((d) => {
    const keyword = searchSantri.toLowerCase();

    const jkText =
      d.jenis_kelamin === "L" ? "laki-laki laki laki" : "perempuan";

    const matchSearch =
      d.nama?.toLowerCase().includes(keyword) ||
      d.nis?.toLowerCase().includes(keyword) ||
      d.kelas?.toLowerCase().includes(keyword) ||
      jkText.includes(keyword) ||
      d.tanggal_lahir?.toLowerCase().includes(keyword) ||
      String(d.usia || "").includes(keyword) ||
      d.alamat?.toLowerCase().includes(keyword) ||
      d.kontak?.toLowerCase().includes(keyword) ||
      d.orang_tua?.nama_ayah?.toLowerCase().includes(keyword) ||
      d.orang_tua?.nama_ibu?.toLowerCase().includes(keyword) ||
      d.orang_tua?.pekerjaan_ayah?.toLowerCase().includes(keyword) ||
      d.orang_tua?.pekerjaan_ibu?.toLowerCase().includes(keyword) ||
      d.status_orangtua?.toLowerCase().includes(keyword) ||
      d.status_anak?.toLowerCase().includes(keyword);

    return matchSearch;
  });

  // =========================================================
  // FILTER GURU
  // =========================================================

  const filteredGuru = dataGuru.filter((g) => {
    const keyword = searchGuru.toLowerCase();

    const jkText =
      g.jenis_kelamin === "L" ? "laki-laki laki laki" : "perempuan";

    return (
      g.nama_guru?.toLowerCase().includes(keyword) ||
      g.nig?.toLowerCase().includes(keyword) ||
      jkText.includes(keyword) ||
      g.tanggal_lahir?.toLowerCase().includes(keyword) ||
      String(g.usia || "").includes(keyword) ||
      g.pendidikan?.toLowerCase().includes(keyword) ||
      g.pekerjaan?.toLowerCase().includes(keyword) ||
      g.kontak?.toLowerCase().includes(keyword)
    );
  });

  // =========================================================
  // PAGINATION SANTRI
  // =========================================================

  const totalSantriPages = Math.max(
    1,
    Math.ceil(filteredSantri.length / ITEMS_PER_PAGE),
  );

  const safeSantriPage = Math.min(santriPage, totalSantriPages);

  const startSantriIndex = (safeSantriPage - 1) * ITEMS_PER_PAGE;

  const paginatedSantri = filteredSantri.slice(
    startSantriIndex,
    startSantriIndex + ITEMS_PER_PAGE,
  );

  const santriStart = filteredSantri.length === 0 ? 0 : startSantriIndex + 1;

  const santriEnd = Math.min(
    startSantriIndex + ITEMS_PER_PAGE,
    filteredSantri.length,
  );

  // =========================================================
  // PAGINATION GURU
  // =========================================================

  const totalGuruPages = Math.max(
    1,
    Math.ceil(filteredGuru.length / ITEMS_PER_PAGE),
  );

  const safeGuruPage = Math.min(guruPage, totalGuruPages);

  const startGuruIndex = (safeGuruPage - 1) * ITEMS_PER_PAGE;

  const paginatedGuru = filteredGuru.slice(
    startGuruIndex,
    startGuruIndex + ITEMS_PER_PAGE,
  );

  const guruStart = filteredGuru.length === 0 ? 0 : startGuruIndex + 1;

  const guruEnd = Math.min(
    startGuruIndex + ITEMS_PER_PAGE,
    filteredGuru.length,
  );

  // =========================================================
  // HELPER PAGINATION
  // =========================================================

  const getPageNumbers = (totalPages, currentPage) => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-light text-black tracking-wider">
        MASTER DATA
      </h1>

      {/* TAB */}
      <div className="grid grid-cols-2 md:flex gap-4">
        <button
          onClick={() => setTab("santri")}
          className={`px-4 py-2 font-light rounded ${
            tab === "santri" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          Form Santri
        </button>

        <button
          onClick={() => setTab("guru")}
          className={`px-4 py-2 font-light rounded ${
            tab === "guru" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          Form Guru
        </button>

        <button
          onClick={() => setTab("viewSantri")}
          className={`px-4 py-2 font-light rounded ${
            tab === "viewSantri" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          View Santri
        </button>

        <button
          onClick={() => setTab("viewGuru")}
          className={`px-4 py-2 font-light rounded ${
            tab === "viewGuru" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          View Guru
        </button>
      </div>

      {/* ===================================================== */}
      {/* SANTRI FORM */}
      {/* ===================================================== */}

      {tab === "santri" && (
        <div className="bg-white p-4 md:p-4 rounded-xl shadow-sm md:border">
          <div className="md:max-w-4xl md:mx-auto">
            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-3 md:gap-4 text-xs"
            >
              <div className="hidden md:block md:col-span-2 font-extralight text-black border-b pb-1">
                Isi Data Santri dan Orangtua berdasarkan dokumen resmi KTP/Kartu
                Keluarga dan keterangan orangtua
              </div>

              <input
                name="nama"
                placeholder="Nama Santri"
                value={form.nama}
                onChange={handleChange}
                className="border p-2 md:px-2 md:py-1.5 rounded md:text-sm font-extralight"
              />

              <input
                value={form.nis}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />

              <select
                name="jenis_kelamin"
                value={form.jenis_kelamin}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>

              <input
                type="date"
                value={form.tanggal_lahir}
                onChange={handleTanggalSantri}
                className="border p-2 rounded"
              />

              <input
                value={form.usia}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />

              <select
                value={form.kelas || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kelas: e.target.value,
                  })
                }
                className="border p-2 rounded w-full font-light"
              >
                <option value="">Pilih Kelas</option>
                <option value="Iqra">Iqra</option>
                <option value="Al Quran">Al Quran</option>
              </select>

              <input
                name="alamat"
                placeholder="Alamat"
                value={form.alamat}
                onChange={handleChange}
                className="border p-2 rounded md:col-span-2"
              />

              <input
                type="file"
                onChange={handleFotoSantri}
                className="border p-2 rounded md:col-span-2"
              />

              {form.foto && (
                <img
                  src={URL.createObjectURL(form.foto)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border md:col-span-2"
                />
              )}

              <input
                name="nama_ayah"
                placeholder="Nama Ayah"
                value={form.nama_ayah}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                name="pekerjaan_ayah"
                placeholder="Pekerjaan Ayah"
                value={form.pekerjaan_ayah}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                name="nama_ibu"
                placeholder="Nama Ibu"
                value={form.nama_ibu}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                name="pekerjaan_ibu"
                placeholder="Pekerjaan Ibu"
                value={form.pekerjaan_ibu}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                name="kontak"
                placeholder="Nomor Kontak"
                value={form.kontak}
                onChange={handleChange}
                className="border p-2 rounded md:col-span-2"
              />

              <select
                value={form.status_orangtua}
                onChange={handleStatusOrtu}
                className="border p-2 rounded"
              >
                <option value="">Status Orang Tua</option>
                <option value="ayah_wafat">Ayah Wafat</option>
                <option value="ibu_wafat">Ibu Wafat</option>
                <option value="keduanya_wafat">Keduanya Wafat</option>
                <option value="keduanya_hidup">Keduanya Hidup</option>
              </select>

              <input
                value={form.status_anak}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />

              <button className="md:col-span-2 bg-purple-600 text-white py-2 rounded">
                {editSantriId ? "Update Data Santri" : "Simpan Data Santri"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* GURU FORM */}
      {/* ===================================================== */}

      {tab === "guru" && (
        <div className="bg-white p-4 md:p-4 rounded-xl shadow-sm md:border">
          <div className="md:max-w-4xl md:mx-auto">
            <form
              onSubmit={handleSubmitGuru}
              className="grid md:grid-cols-2 gap-3 md:gap-4 text-sm"
            >
              <input
                name="nama_guru"
                placeholder="Nama Guru"
                value={formGuru.nama_guru}
                onChange={handleChangeGuru}
                className="border p-2 rounded"
              />

              <input
                name="nig"
                value={formGuru.nig}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />

              <select
                name="jenis_kelamin"
                value={formGuru.jenis_kelamin}
                onChange={handleChangeGuru}
                className="border p-2 rounded"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>

              <input
                type="date"
                value={formGuru.tanggal_lahir}
                onChange={handleTanggalGuru}
                className="border p-2 rounded"
              />

              <input
                value={formGuru.usia}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />

              <input
                name="pendidikan"
                placeholder="Pendidikan"
                value={formGuru.pendidikan}
                onChange={handleChangeGuru}
                className="border p-2 rounded"
              />

              <input
                name="pekerjaan"
                placeholder="Pekerjaan"
                value={formGuru.pekerjaan}
                onChange={handleChangeGuru}
                className="border p-2 rounded"
              />

              <input
                name="kontak"
                placeholder="Nomor Kontak"
                value={formGuru.kontak}
                onChange={handleChangeGuru}
                className="border p-2 rounded"
              />

              <input
                type="file"
                onChange={handleFotoGuru}
                className="border p-2 rounded"
              />

              {formGuru.foto && (
                <img
                  src={URL.createObjectURL(formGuru.foto)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border"
                />
              )}

              <button
                type="submit"
                className="md:col-span-2 bg-blue-600 text-white py-2 rounded"
              >
                {editGuruId ? "Update Data Guru" : "Simpan Data Guru"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* VIEW SANTRI */}
      {/* ===================================================== */}

      {tab === "viewSantri" && (
        <div className="bg-white p-5 rounded-xl shadow">
          {/* SEARCH */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <input
              type="text"
              placeholder="Cari data santri..."
              value={searchSantri}
              onChange={(e) => {
                setSearchSantri(e.target.value);
                setSantriPage(1);
              }}
              className="border p-2 rounded w-full md:w-64"
            />

            <div className="text-xs text-gray-500">
              Menampilkan {santriStart}–{santriEnd} dari {filteredSantri.length}{" "}
              data
            </div>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="block md:hidden space-y-3 mb-4">
            {paginatedSantri.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Data tidak ditemukan
              </div>
            ) : (
              paginatedSantri.map((d, i) => (
                <div
                  key={d.id || i}
                  className="border rounded-2xl shadow overflow-hidden bg-white"
                >
                  {/* HEADER */}
                  <div className="bg-purple-600 text-white text-center py-2 px-4">
                    <div className="flex justify-center mb-3">
                      {d.foto ? (
                        <img
                          src={`http://localhost:8000/storage/${d.foto}`}
                          alt="foto"
                          className="w-24 h-24 object-cover rounded-full border-4 border-white shadow"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white text-gray-800 rounded-full flex items-center justify-center text-xs border-4 border-white">
                          No Foto
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-lg uppercase">{d.nama}</div>
                  </div>

                  {/* NARASI */}
                  <div className="text-base p-4 space-y-3 bg-gray-200 text-gray-700 text-justify">
                    Adalah santri TPQ Khairunisa Ternate - nomor ID {d.nis}{" "}
                    Kelas pada {d.kelas || "-"} dengan jenis kelamin{" "}
                    {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}{" "}
                    berusia {d.usia} tahun Kelahiran tanggal {d.tanggal_lahir}.
                    Santri adalah anak dari Ayah bernama{" "}
                    {d.orang_tua?.nama_ayah || "-"} pekerjaan{" "}
                    {d.orang_tua?.pekerjaan_ayah || "-"} dan Ibu bernama{" "}
                    {d.orang_tua?.nama_ibu || "-"}{" "}
                    {d.orang_tua?.pekerjaan_ibu || "-"}. Status kedua orangtua{" "}
                    {d.status_orangtua || "-"} dan santri adalah{" "}
                    {d.status_anak || "-"}. Santri beralamat di kelurahan{" "}
                    {d.alamat || "-"} Kota Ternate. Nomor Kontak{" "}
                    {d.kontak || "-"}.
                  </div>

                  {/* AKSI */}
                  <div className="flex justify-end gap-5 bg-gray-300 p-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setForm({
                          nama: d.nama,
                          nis: d.nis,
                          kelas: d.kelas || "",
                          jenis_kelamin: d.jenis_kelamin,
                          tanggal_lahir: d.tanggal_lahir,
                          usia: d.usia,
                          alamat: d.alamat,
                          kontak: d.kontak,
                          status_orangtua: d.status_orangtua,
                          status_anak: d.status_anak,
                          foto: null,
                          nama_ayah: d.orang_tua?.nama_ayah || "",
                          pekerjaan_ayah: d.orang_tua?.pekerjaan_ayah || "",
                          nama_ibu: d.orang_tua?.nama_ibu || "",
                          pekerjaan_ibu: d.orang_tua?.pekerjaan_ibu || "",
                        });

                        setEditSantriId(d.id);
                        setTab("santri");
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteSantri(d.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-black border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Foto</th>
                  <th className="p-2 text-left">Nama - NIS - Kelas</th>
                  <th className="p-2 text-left">JK - Usia - Kelahiran</th>
                  <th className="p-2 text-left">Alamat - Kontak</th>
                  <th className="p-2 text-left">Ayah - Pekerjaan</th>
                  <th className="p-2 text-left">Ibu - Pekerjaan</th>
                  <th className="p-2 text-left">Status OT-Anak</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSantri.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedSantri.map((d, i) => (
                    <tr key={d.id || i} className="border-t hover:bg-gray-50">
                      {/* FOTO */}
                      <td className="p-2">
                        {d.foto ? (
                          <img
                            src={`http://localhost:8000/storage/${d.foto}`}
                            alt="foto"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                            No Img
                          </div>
                        )}
                      </td>

                      {/* NAMA */}
                      <td className="p-2">
                        <div className="font-semibold">{d.nama}</div>

                        <div className="text-xs text-gray-500">
                          {d.nis} | Kelas {d.kelas || "-"}
                        </div>
                      </td>

                      {/* JK */}
                      <td className="p-2">
                        <div>
                          {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                          {d.usia} Th
                        </div>

                        <div className="text-xs text-gray-500">
                          {d.tanggal_lahir}
                        </div>
                      </td>

                      {/* ALAMAT */}
                      <td className="p-2">
                        <div>{d.alamat || "-"}</div>

                        <div className="text-xs text-gray-500">
                          {d.kontak || "-"}
                        </div>
                      </td>

                      {/* AYAH */}
                      <td className="p-2">
                        <div>{d.orang_tua?.nama_ayah || "-"}</div>

                        <div className="text-xs text-gray-500">
                          {d.orang_tua?.pekerjaan_ayah || "-"}
                        </div>
                      </td>

                      {/* IBU */}
                      <td className="p-2">
                        <div>{d.orang_tua?.nama_ibu || "-"}</div>

                        <div className="text-xs text-gray-500">
                          {d.orang_tua?.pekerjaan_ibu || "-"}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="p-2">
                        <div>{d.status_orangtua || "-"}</div>

                        <div className="text-xs text-gray-500">
                          {d.status_anak || "-"}
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setForm({
                                nama: d.nama,
                                nis: d.nis,
                                kelas: d.kelas || "",
                                jenis_kelamin: d.jenis_kelamin,
                                tanggal_lahir: d.tanggal_lahir,
                                usia: d.usia,
                                alamat: d.alamat,
                                kontak: d.kontak,
                                status_orangtua: d.status_orangtua,
                                status_anak: d.status_anak,
                                foto: null,
                                nama_ayah: d.orang_tua?.nama_ayah || "",
                                pekerjaan_ayah:
                                  d.orang_tua?.pekerjaan_ayah || "",
                                nama_ibu: d.orang_tua?.nama_ibu || "",
                                pekerjaan_ibu: d.orang_tua?.pekerjaan_ibu || "",
                              });

                              setEditSantriId(d.id);
                              setTab("santri");
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            className="text-red-600"
                            onClick={() => handleDeleteSantri(d.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION SANTRI ================= */}
          {filteredSantri.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Halaman {safeSantriPage} dari {totalSantriPages}
              </div>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                  disabled={safeSantriPage === 1}
                  onClick={() => setSantriPage((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-1.5 text-xs rounded border ${
                    safeSantriPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Sebelumnya
                </button>

                {getPageNumbers(totalSantriPages, safeSantriPage).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setSantriPage(page)}
                      className={`min-w-[32px] px-2 py-1.5 text-xs rounded border ${
                        safeSantriPage === page
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={safeSantriPage === totalSantriPages}
                  onClick={() =>
                    setSantriPage((prev) =>
                      Math.min(totalSantriPages, prev + 1),
                    )
                  }
                  className={`px-3 py-1.5 text-xs rounded border ${
                    safeSantriPage === totalSantriPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================== */}
      {/* VIEW GURU */}
      {/* ===================================================== */}

      {tab === "viewGuru" && (
        <div className="bg-white p-5 rounded-xl shadow">
          {/* SEARCH */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <input
              type="text"
              placeholder="Cari data guru..."
              value={searchGuru}
              onChange={(e) => {
                setSearchGuru(e.target.value);
                setGuruPage(1);
              }}
              className="border p-2 rounded w-full md:w-64"
            />

            <div className="text-xs text-gray-500">
              Menampilkan {guruStart}–{guruEnd} dari {filteredGuru.length} data
            </div>
          </div>

          {/* ================= MOBILE VIEW GURU ================= */}
          <div className="block md:hidden space-y-3 mb-4">
            {paginatedGuru.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Data guru kosong
              </div>
            ) : (
              paginatedGuru.map((g, i) => (
                <div
                  key={g.id || i}
                  className="border rounded-2xl shadow overflow-hidden bg-white"
                >
                  {/* HEADER */}
                  <div className="bg-purple-600 text-white text-center py-3 px-4">
                    <div className="flex justify-center mb-3">
                      {g.foto ? (
                        <img
                          src={g.foto_url}
                          alt="foto"
                          className="w-24 h-24 object-cover rounded-full border-4 border-white shadow"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white text-gray-500 rounded-full flex items-center justify-center text-xs border-4 border-white">
                          No Foto
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-lg uppercase">
                      {g.nama_guru}
                    </div>
                  </div>

                  {/* NARASI */}
                  <div className="text-base p-4 space-y-3 bg-gray-200 text-gray-700 text-justify">
                    Adalah guru TPQ Khairunnisa Ternate dengan nomor ID {g.nig}.
                    Berjenis kelamin{" "}
                    {g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}{" "}
                    berusia {g.usia} tahun dan lahir pada tanggal{" "}
                    {g.tanggal_lahir}. Guru memiliki latar pendidikan{" "}
                    {g.pendidikan || "-"} dan pekerjaan {g.pekerjaan || "-"}.
                    Nomor kontak yang dapat dihubungi adalah {g.kontak || "-"}.
                  </div>

                  {/* AKSI */}
                  <div className="flex justify-end gap-3 pt-2 bg-gray-300 p-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setFormGuru({
                          nama_guru: g.nama_guru,
                          nig: g.nig,
                          jenis_kelamin: g.jenis_kelamin,
                          tanggal_lahir: g.tanggal_lahir,
                          usia: g.usia,
                          pendidikan: g.pendidikan,
                          pekerjaan: g.pekerjaan,
                          kontak: g.kontak,
                          foto: null,
                        });

                        setEditGuruId(g.id);
                        setTab("guru");
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteGuru(g.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= DESKTOP VIEW GURU ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-black border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Foto</th>
                  <th className="p-2 text-left">Nama - NIG</th>
                  <th className="p-2 text-left">JK, Usia - Kelahiran</th>
                  <th className="p-2 text-left">Pendidikan - Pekerjaan</th>
                  <th className="p-2 text-left">Kontak</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedGuru.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-3">
                      Data guru kosong
                    </td>
                  </tr>
                ) : (
                  paginatedGuru.map((g, i) => (
                    <tr key={g.id || i} className="border-t hover:bg-gray-50">
                      {/* FOTO */}
                      <td className="p-2">
                        {g.foto ? (
                          <img
                            src={g.foto_url}
                            alt="foto"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                            No Img
                          </div>
                        )}
                      </td>

                      {/* NAMA */}
                      <td className="p-2">
                        <div className="font-semibold">{g.nama_guru}</div>

                        <div className="text-xs text-gray-500">{g.nig}</div>
                      </td>

                      {/* JK */}
                      <td className="p-2">
                        <div>
                          {g.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}{" "}
                          {g.usia} Th
                        </div>

                        <div className="text-xs text-gray-500">
                          {g.tanggal_lahir}
                        </div>
                      </td>

                      {/* PENDIDIKAN */}
                      <td className="p-2">
                        <div>{g.pendidikan || "-"}</div>

                        <div className="text-xs text-gray-500">
                          {g.pekerjaan || "-"}
                        </div>
                      </td>

                      {/* KONTAK */}
                      <td className="p-2">{g.kontak || "-"}</td>

                      {/* AKSI */}
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setFormGuru({
                                nama_guru: g.nama_guru,
                                nig: g.nig,
                                jenis_kelamin: g.jenis_kelamin,
                                tanggal_lahir: g.tanggal_lahir,
                                usia: g.usia,
                                pendidikan: g.pendidikan,
                                pekerjaan: g.pekerjaan,
                                kontak: g.kontak,
                                foto: null,
                              });

                              setEditGuruId(g.id);
                              setTab("guru");
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            className="text-red-600"
                            onClick={() => handleDeleteGuru(g.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION GURU ================= */}
          {filteredGuru.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Halaman {safeGuruPage} dari {totalGuruPages}
              </div>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                  disabled={safeGuruPage === 1}
                  onClick={() => setGuruPage((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-1.5 text-xs rounded border ${
                    safeGuruPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Sebelumnya
                </button>

                {getPageNumbers(totalGuruPages, safeGuruPage).map((page) => (
                  <button
                    key={page}
                    onClick={() => setGuruPage(page)}
                    className={`min-w-[32px] px-2 py-1.5 text-xs rounded border ${
                      safeGuruPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={safeGuruPage === totalGuruPages}
                  onClick={() =>
                    setGuruPage((prev) => Math.min(totalGuruPages, prev + 1))
                  }
                  className={`px-3 py-1.5 text-xs rounded border ${
                    safeGuruPage === totalGuruPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

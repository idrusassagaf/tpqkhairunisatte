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

  // ================= TAMBAHAN DATA VIEW =================
  const [dataSantri, setDataSantri] = useState([]);
  const [searchSantri, setSearchSantri] = useState("");
  const [dataGuru, setDataGuru] = useState([]);
  const [searchGuru, setSearchGuru] = useState("");
  const [editSantriId, setEditSantriId] = useState(null);
  const [editGuruId, setEditGuruId] = useState(null);

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

    // 🔥 VALIDASI WAJIB
    if (!form.nama || !form.tanggal_lahir || !form.status_orangtua) {
      alert("Isi data wajib dulu bro!");
      return;
    }

    const formData = new FormData();

    // isi data biasa
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

    // orang tua
    formData.append("orang_tua[nama_ayah]", form.nama_ayah);
    formData.append("orang_tua[pekerjaan_ayah]", form.pekerjaan_ayah);
    formData.append("orang_tua[nama_ibu]", form.nama_ibu);
    formData.append("orang_tua[pekerjaan_ibu]", form.pekerjaan_ibu);

    // 🔥 FOTO (INI KUNCI)
    if (form.foto) {
      formData.append("foto", form.foto);
    }

    // 🔥 EDIT SANTRI
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

        alert("Alhamdulillah...Data santri berhasil");
        setEditSantriId(null);
        // reset form
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

        // 🔥 REFRESH + PINDAH TAB
        fetchSantri();
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

  // 🔥 TAMBAHKAN DI SINI
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

    // 🔥 foto (backend belum pakai, tapi tidak error)
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
        alert("Ahamdulillah...Data guru berhasil");

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
      // ✅ pastikan array
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
    // 🔥 TAMBAHAN INI
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
      fetchSantri();
    }

    if (tab === "viewGuru") {
      fetchGuru();
    }
  }, [tab]);

  // ================= UI =================
  const handleDeleteSantri = async (id) => {
    if (!confirm("Yakin mau hapus?")) return;

    try {
      await api.delete(`/master-data/${id}`);
      alert("Berhasil dihapus");
      fetchSantri(); // refresh tabel
    } catch (err) {
      console.error(err);
      alert("Gagal hapus");
    }
  };

  const handleDeleteGuru = async (id) => {
    if (!confirm("Yakin mau hapus guru?")) return;

    try {
      await api.delete(`/guru/${id}`); // ✅ FIX
      alert("Guru berhasil dihapus");
      fetchGuru();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus guru");
    }
  };

  const filteredSantri = dataSantri.filter((d) => {
    const keyword = searchSantri.toLowerCase();

    // 🔥 KONVERSI JK
    const jkText = d.jenis_kelamin === "L" ? "laki-laki" : "perempuan";

    const matchSearch =
      d.nama?.toLowerCase().includes(keyword) ||
      d.nis?.toLowerCase().includes(keyword) ||
      d.kelas?.toLowerCase().includes(keyword) ||
      jkText.includes(keyword) ||
      d.tanggal_lahir?.toLowerCase().includes(keyword) ||
      String(d.usia || "").includes(keyword) ||
      d.alamat?.toLowerCase().includes(keyword) ||
      d.kontak?.toLowerCase().includes(keyword) ||
      d.status_orangtua?.toLowerCase().includes(keyword) ||
      d.status_anak?.toLowerCase().includes(keyword);

    return matchSearch;
  });
  const filteredGuru = dataGuru.filter((g) => {
    const keyword = searchGuru.toLowerCase();

    return (
      g.nama_guru?.toLowerCase().includes(keyword) ||
      g.nig?.toLowerCase().includes(keyword) ||
      g.jenis_kelamin?.toLowerCase().includes(keyword) ||
      g.tanggal_lahir?.toLowerCase().includes(keyword) ||
      String(g.usia || "").includes(keyword) ||
      g.pendidikan?.toLowerCase().includes(keyword) ||
      g.pekerjaan?.toLowerCase().includes(keyword) ||
      g.kontak?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-light text-black tracking-wider">
        MASTER DATA
      </h1>

      {/* TAB */}
      <div className="grid grid-cols-2 md:flex gap-4">
        <button
          onClick={() => setTab("santri")}
          className={`px-4 py-2 font-light rounded ${tab === "santri" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Form Santri
        </button>

        <button
          onClick={() => setTab("guru")}
          className={`px-4 py-2 font-light rounded ${tab === "guru" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Form Guru
        </button>

        <button
          onClick={() => setTab("viewSantri")}
          className={`px-4 py-2 font-light rounded ${tab === "viewSantri" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          View Santri
        </button>

        <button
          onClick={() => setTab("viewGuru")}
          className={`px-4 py-2 font-light rounded ${tab === "viewGuru" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          View Guru
        </button>
      </div>

      {/* ================= SANTRI ================= */}
      {tab === "santri" && (
        <div className="bg-white p-4 md:p-4 rounded-xl shadow-sm md:border ">
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
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
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
              {/* PREVIEW FOTO */}
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
                Simpan Data Santri
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= GURU ================= */}
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
                Simpan Data Guru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW SANTRI ================= */}

      {tab === "viewSantri" && (
        <div className="bg-white p-5 rounded-xl shadow">
          {/* 🔍 SEARCH PINDAH KE SINI */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari data santri..."
              value={searchSantri}
              onChange={(e) => setSearchSantri(e.target.value)}
              className="border p-2 rounded w-full md:w-64"
            />
          </div>

          {/* ================= MOBILE (AMAN) ================= */}
          <div className="block md:hidden space-y-3 mb-4">
            {filteredSantri.map((d, i) => (
              <div
                key={i}
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
                {/* NIS + KELAS */}
                <div className="text-base p-4 space-y-3 bg-gray-200 text-gray-700 text-justify">
                  Adalah santri TPQ Khairunisa Ternate - nomor ID {d.nis} Kelas{" "}
                  pada {d.kelas || "-"} dengan jenis kelamin{" "}
                  {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} berusia{" "}
                  {d.usia} tahun Kelahiran tanggal {d.tanggal_lahir}
                  Santri adalah anak dari Ayah bernama {
                    d.orang_tua?.nama_ayah
                  }{" "}
                  pekerjaan {d.orang_tua?.pekerjaan_ayah} dan Ibu bernama{" "}
                  {d.orang_tua?.nama_ibu} {d.orang_tua?.pekerjaan_ibu} Status
                  kedua orangtua {d.status_orangtua} dan santri adalah{" "}
                  {d.status_anak} Santri beralamat di kelurahan {d.alamat} Kota
                  Ternate. Nomor Kontak {d.kontak}
                </div>
                <div className="flex justify-end gap-5  bg-gray-300 p-2">
                  <button
                    onClick={() => {
                      setForm({
                        nama: d.nama,
                        nis: d.nis,
                        kelas: d.kelas || "", // ✅ TAMBAHKAN
                        jenis_kelamin: d.jenis_kelamin,
                        tanggal_lahir: d.tanggal_lahir,
                        usia: d.usia,
                        alamat: d.alamat,
                        kontak: d.kontak,
                        status_orangtua: d.status_orangtua,
                        status_anak: d.status_anak,
                        nama_ayah: d.orang_tua?.nama_ayah || "",
                        pekerjaan_ayah: d.orang_tua?.pekerjaan_ayah || "",
                        nama_ibu: d.orang_tua?.nama_ibu || "",
                        pekerjaan_ibu: d.orang_tua?.pekerjaan_ibu || "",
                      });

                      setEditSantriId(d.id);
                      setTab("santri");
                      console.log("MODE:", editSantriId ? "EDIT" : "CREATE");
                    }}
                  >
                    ✏️
                  </button>

                  <button onClick={() => handleDeleteSantri(d.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden md:table w-full text-xs text-black border">
            {/* ================= HEADER ================= */}
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

            {/* ================= BODY ================= */}
            <tbody>
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredSantri.map((d, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
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
                    {/* 1. Nama - NIS- Kelas */}
                    <td className="p-2">
                      <div className="font-semibold">{d.nama}</div>
                      <div className="text-xs text-gray-500">
                        {d.nis} | Kelas {d.kelas || "-"}
                      </div>
                    </td>

                    {/* 2. JK, Usia - Kelahiran */}
                    <td className="p-2">
                      <div>
                        {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                        {d.usia} Th
                      </div>

                      <div className="text-xs text-gray-500">
                        {d.tanggal_lahir}
                      </div>
                    </td>

                    {/* 4. Alamat - Kontak */}
                    <td className="p-2">
                      <div>{d.alamat}</div>
                      <div className="text-xs text-gray-500">{d.kontak}</div>
                    </td>

                    {/* 4. Ayah - Pekerjaan */}
                    <td className="p-2">
                      <div>{d.orang_tua?.nama_ayah}</div>
                      <div className="text-xs text-gray-500">
                        {d.orang_tua?.pekerjaan_ayah}
                      </div>
                    </td>

                    {/* 5. Ibu - Pekerjaan */}
                    <td className="p-2">
                      <div>{d.orang_tua?.nama_ibu}</div>
                      <div className="text-xs text-gray-500">
                        {d.orang_tua?.pekerjaan_ibu}
                      </div>
                    </td>

                    {/* 6. Status Ortu - Anak */}
                    <td className="p-2">
                      <div>{d.status_orangtua}</div>
                      <div className="text-xs text-gray-500">
                        {d.status_anak}
                      </div>
                    </td>

                    {/* 7. Aksi */}
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="text-blue-600"
                          onClick={() => {
                            setForm({
                              nama: d.nama,
                              nis: d.nis,
                              kelas: d.kelas || "", // ✅ TAMBAHKAN
                              jenis_kelamin: d.jenis_kelamin,
                              tanggal_lahir: d.tanggal_lahir,
                              usia: d.usia,
                              alamat: d.alamat,
                              kontak: d.kontak,
                              status_orangtua: d.status_orangtua,
                              status_anak: d.status_anak,

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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= VIEW GURU ================= */}
      {tab === "viewGuru" && (
        <div className="bg-white p-5 rounded-xl shadow">
          {/* SEARCH */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari data guru..."
              value={searchGuru}
              onChange={(e) => setSearchGuru(e.target.value)}
              className="border p-2 rounded w-full md:w-64"
            />
          </div>

          {/* ================= MOBILE VIEW GURU ================= */}
          <div className="block md:hidden space-y-3 mb-4">
            {filteredGuru.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Data guru kosong
              </div>
            ) : (
              filteredGuru.map((g, i) => (
                <div
                  key={i}
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
                  {/* NARASI GURU */}
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
                  <div className="flex justify-end gap-3 pt-2 bg-gray-300">
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

          <table className="hidden md:table w-full text-xs text-black border">
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
              {filteredGuru.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-3">
                    Data guru kosong
                  </td>
                </tr>
              ) : (
                filteredGuru.map((g, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
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
      )}
    </div>
  );
}

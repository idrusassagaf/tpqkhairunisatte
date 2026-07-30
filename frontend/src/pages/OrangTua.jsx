import { useEffect, useState } from "react";
import { api } from "../api";

export default function OrangTua() {
  const [data, setData] = useState([]);
  const [santriList, setSantriList] = useState([]);

  const [form, setForm] = useState({
    nama_ayah: "",
    nama_ibu: "",
    no_hp: "",
    alamat: "",
    santri_id: "",
  });

  // GET ORANG TUA
  const getData = () => {
    api
      .get("/orangtua")
      .then((res) => setData(res.data.data.data))
      .catch((err) => console.error(err));
  };

  // GET SANTRI (untuk relasi)
  const getSantri = () => {
    api
      .get("/santri")
      .then((res) => setSantriList(res.data.data.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getData();
    getSantri();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      nama_ayah: form.nama_ayah,
      nama_ibu: form.nama_ibu,
      no_hp: form.no_hp,
      alamat: form.alamat,
      santri_id: form.santri_id,
    };

    api
      .post("/orangtua", payload)
      .then(() => {
        alert("Berhasil tambah orang tua");
        setForm({
          nama_ayah: "",
          nama_ibu: "",
          no_hp: "",
          alamat: "",
          santri_id: "",
        });
        getData();
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal tambah data");
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Orang Tua</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-2 bg-white p-4 rounded shadow"
      >
        <input
          name="nama_ayah"
          placeholder="Nama Ayah"
          value={form.nama_ayah}
          onChange={handleChange}
        />

        <input
          name="nama_ibu"
          placeholder="Nama Ibu"
          value={form.nama_ibu}
          onChange={handleChange}
        />

        <input
          name="no_hp"
          placeholder="No HP"
          value={form.no_hp}
          onChange={handleChange}
        />

        <input
          name="alamat"
          placeholder="Alamat"
          value={form.alamat}
          onChange={handleChange}
        />

        {/* RELASI SANTRI */}
        <select name="santri_id" value={form.santri_id} onChange={handleChange}>
          <option value="">Pilih Santri</option>
          {santriList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))}
        </select>

        <button className="bg-purple-500 text-white px-4 py-2">Simpan</button>
      </form>

      {/* LIST */}
      <div className="mt-6 space-y-3">
        {data.map((item) => (
          <div key={item.id} className="bg-white p-3 shadow rounded">
            <p>
              <b>Ayah:</b> {item.nama_ayah}
            </p>
            <p>
              <b>Ibu:</b> {item.nama_ibu}
            </p>
            <p>
              <b>No HP:</b> {item.no_hp}
            </p>
            <p>
              <b>Alamat:</b> {item.alamat}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Santri: {item.santri?.nama || "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

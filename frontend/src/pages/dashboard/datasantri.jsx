import { useEffect, useState } from "react";

import { Download, FileSpreadsheet, FileText, Pencil, Plus, Trash2, Users } from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import { api } from "../../api";
import { SkeletonRows } from "../../components/Skeleton";
import FormSantriModal from "../../components/dashboard/FormSantriModal";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

export default function DataSantri() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDownload, setShowDownload] = useState(false);

  // ================= FORM (TAMBAH / UBAH) =================
  const [formOpen, setFormOpen] = useState(false);
  const [santriEdit, setSantriEdit] = useState(null);

  // ================= PAGINATION SETTING =================

  const itemsPerPage = 10;

  // ================= FILTER DATA =================

  const filteredData = data.filter((d) => {
    const keyword = search.toLowerCase();

    const semuaData = `
      ${d.nama || ""}
      ${d.nis || ""}
      ${d.kelas || ""}
      ${d.jenis_kelamin === "L" ? "laki laki" : "perempuan"}
      ${d.tanggal_lahir || ""}
      ${d.usia || ""}
      ${d.alamat || ""}
      ${d.kontak || ""}
      ${d.orang_tua?.nama_ayah || ""}
      ${d.orang_tua?.nama_ibu || ""}
      ${d.orang_tua?.pekerjaan_ayah || ""}
      ${d.orang_tua?.pekerjaan_ibu || ""}
      ${d.status_orangtua || ""}
      ${d.status_anak || ""}
    `.toLowerCase();

    return semuaData.includes(keyword);
  });

  // ================= PAGINATION CALCULATION =================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ================= FETCH DATA =================

  const fetchSantri = async () => {
    try {
      const res = await api.get("/master-data");

      setData(res?.data?.data?.santri || []);
    } catch (err) {
      console.error("Gagal ambil data santri:", err);

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchSantri();
  }, []);

  // ================= SEARCH =================

  const handleSearch = (e) => {
    setSearch(e.target.value);

    // Kembali ke halaman pertama ketika pencarian berubah

    setCurrentPage(1);
  };

  // ================= PAGINATION HANDLER =================

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // =========================================================
  // DOWNLOAD EXCEL
  // =========================================================

  const downloadExcel = () => {
    if (filteredData.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data santri untuk di-download.",
      });
      return;
    }

    const excelData = filteredData.map((d, index) => ({
      No: index + 1,

      Nama: d.nama || "-",

      NIS: d.nis || "-",

      "Jenis Kelamin": d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

      Usia: d.usia ?? "-",

      "Tanggal Lahir": d.tanggal_lahir || "-",

      Kelas: d.kelas || "-",

      Alamat: d.alamat || "-",

      Kontak: d.kontak || "-",

      "Nama Ayah": d.orang_tua?.nama_ayah || "-",

      "Pekerjaan Ayah": d.orang_tua?.pekerjaan_ayah || "-",

      "Nama Ibu": d.orang_tua?.nama_ibu || "-",

      "Pekerjaan Ibu": d.orang_tua?.pekerjaan_ibu || "-",

      "Status Orang Tua": d.status_orangtua || "-",

      "Status Anak": d.status_anak || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Santri");

    // Lebar kolom

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 14 },
      { wch: 16 },
      { wch: 8 },
      { wch: 16 },
      { wch: 15 },
      { wch: 30 },
      { wch: 18 },
      { wch: 25 },
      { wch: 22 },
      { wch: 25 },
      { wch: 22 },
      { wch: 20 },
      { wch: 20 },
    ];

    const namaFile = search.trim()
      ? "data-santri-hasil-pencarian.xlsx"
      : "data-santri.xlsx";

    XLSX.writeFile(workbook, namaFile);

    setShowDownload(false);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    if (filteredData.length === 0) {
      window.__tpqNotify?.toast({
        type: "warning",
        title: "Tidak ada data",
        message: "Tidak ada data santri untuk di-download.",
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",

        unit: "mm",

        format: "a4",
      });

      // =====================================================
      // TANGGAL REALTIME
      // Diambil tepat saat tombol Download PDF ditekan
      // =====================================================

      const tanggalRealtime = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",

        month: "long",

        year: "numeric",
      });

      // ================= JUDUL =================

      doc.setFontSize(16);

      doc.setFont("helvetica", "bold");

      doc.text("DATA BASE SANTRI", 148, 15, {
        align: "center",
      });

      doc.setFontSize(10);

      doc.setFont("helvetica", "normal");

      doc.text("TPQ Hairunissa Ternate", 148, 21, {
        align: "center",
      });

      // ================= INFO PENCARIAN =================

      if (search.trim()) {
        doc.setFontSize(8);

        doc.text(`Hasil pencarian: "${search}"`, 14, 29);
      }

      // ================= DATA TABEL =================

      const rows = filteredData.map((d, index) => [
        index + 1,

        d.nama || "-",

        d.nis || "-",

        d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",

        d.usia ?? "-",

        d.tanggal_lahir || "-",

        d.kelas || "-",

        d.alamat || "-",

        d.kontak || "-",

        d.orang_tua?.nama_ayah || "-",

        d.orang_tua?.nama_ibu || "-",

        d.status_orangtua || "-",

        d.status_anak || "-",
      ]);

      autoTable(doc, {
        startY: search.trim() ? 34 : 28,

        head: [
          [
            "No",

            "Nama",

            "NIS",

            "JK",

            "Usia",

            "Tgl Lahir",

            "Kelas",

            "Alamat",

            "Kontak",

            "Ayah",

            "Ibu",

            "Status Ortu",

            "Status Anak",
          ],
        ],

        body: rows,

        theme: "grid",

        styles: {
          fontSize: 7,

          cellPadding: 2,

          overflow: "linebreak",

          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: { cellWidth: 9 },

          1: { cellWidth: 30 },

          2: { cellWidth: 18 },

          3: { cellWidth: 20 },

          4: { cellWidth: 10 },

          5: { cellWidth: 20 },

          6: { cellWidth: 18 },

          7: { cellWidth: 32 },

          8: { cellWidth: 22 },

          9: { cellWidth: 28 },

          10: { cellWidth: 28 },

          11: { cellWidth: 23 },

          12: { cellWidth: 23 },
        },

        margin: {
          left: 8,

          right: 8,
        },

        // =====================================================
        // FOOTER PDF
        // TANGGAL REALTIME TGL-BULAN-TAHUN
        // =====================================================

        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.getHeight();

          doc.setFontSize(7);

          doc.setFont("helvetica", "normal");

          doc.text(
            `TPQ Hairunissa • Database Santri • Update ${tanggalRealtime} • Halaman ${doc.internal.getNumberOfPages()}`,
            148,
            pageHeight - 7,
            {
              align: "center",
            },
          );
        },
      });

      const namaFile = search.trim()
        ? "data-santri-hasil-pencarian.pdf"
        : "data-santri.pdf";

      doc.save(namaFile);

      setShowDownload(false);
    } catch (error) {
      console.error("Gagal membuat PDF santri:", error);
      window.__tpqNotify?.toast({
        type: "error",
        title: "Download gagal",
        message: "PDF gagal dibuat. Silakan cek Console browser.",
      });
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

  // ================= AKSI =================

  const bukaTambah = () => {
    setSantriEdit(null);
    setFormOpen(true);
  };

  const bukaUbah = (santri) => {
    setSantriEdit(santri);
    setFormOpen(true);
  };

  const handleHapus = async (santri) => {
    const yakin = await window.__tpqNotify?.confirm({
      title: "Hapus santri",
      message: `Hapus data santri "${santri.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!yakin) return;

    try {
      window.__tpqLoading?.show(`Menghapus "${santri.nama}"...`);
      await api.delete(`/master-data/${santri.id}`);
      window.__tpqNotify?.toast({
        type: "success",
        title: "Santri dihapus",
        message: `Data ${santri.nama} berhasil dihapus.`,
      });
      await fetchSantri();
    } catch (err) {
      window.__tpqNotify?.toast({
        type: "error",
        title: "Gagal menghapus",
        message: err?.response?.data?.message || "Gagal menghapus data santri.",
      });
    } finally {
      window.__tpqLoading?.hide();
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 overflow-x-hidden p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Users size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Data Santri</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Daftar lengkap santri beserta data orang tua.
            </p>
          </div>
        </div>

        {/* SEARCH + DOWNLOAD */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Cari data santri..."
            value={search}
            onChange={handleSearch}
            className={`${inputCls} sm:w-72`}
          />

          <button
            type="button"
            onClick={bukaTambah}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
          >
            <Plus size={17} />
            Tambah
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownload((prev) => !prev)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              <Download size={17} />
              Download
            </button>

            {showDownload && (
              <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-52">
                <button
                  type="button"
                  onClick={downloadExcel}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet size={18} className="text-green-600" />

                  <div className="text-left">
                    <div className="font-medium">Excel</div>
                    <div className="text-xs text-gray-400">.xlsx</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={downloadPDF}
                  className="flex w-full items-center gap-3 border-t px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileText size={18} className="text-red-600" />

                  <div className="text-left">
                    <div className="font-medium">PDF</div>
                    <div className="text-xs text-gray-400">.pdf</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {loading ? (
        <SkeletonRows rows={6} cols={4} />
      ) : (
        <>
        {/* MOBILE */}
        <div className="space-y-4 md:hidden">
          {filteredData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Data tidak ditemukan</div>
          ) : (
            paginatedData.map((d, i) => (
              <div
                key={d.id || i}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* HEADER CARD */}
                <div className="flex flex-col items-center gap-1 bg-amber-50 p-4 text-center">
                  {d.foto ? (
                    <img
                      src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${d.foto}`}
                      alt="foto"
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-xs text-gray-500 shadow">
                      No Foto
                    </div>
                  )}

                  <h2 className="mt-2 text-lg font-bold uppercase text-gray-900">
                    {d.nama}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {d.nis} · Kelas {d.kelas || "-"}
                  </p>
                </div>

                {/* NARASI */}
                <div className="space-y-2 p-4 text-sm leading-relaxed text-gray-700 text-justify">
                  <p>
                    Adalah santri TPQ Khairunisa Ternate dengan jenis kelamin{" "}
                    {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} berusia{" "}
                    {d.usia} tahun dan lahir pada tanggal {d.tanggal_lahir}.
                    Santri merupakan anak dari Ayah bernama{" "}
                    <b>{d.orang_tua?.nama_ayah || "-"}</b> dengan pekerjaan{" "}
                    {d.orang_tua?.pekerjaan_ayah || "-"} dan Ibu bernama{" "}
                    <b>{d.orang_tua?.nama_ibu || "-"}</b> dengan pekerjaan{" "}
                    {d.orang_tua?.pekerjaan_ibu || "-"}. Status orang tua adalah{" "}
                    <b>{d.status_orangtua || "-"}</b> dan santri termasuk{" "}
                    <b>{d.status_anak || "-"}</b>.
                  </p>

                  <p>
                    Santri berdomisili di Kelurahan {d.alamat || "-"} Kota Ternate.
                    {d.kontak && ` Nomor kontak ${d.kontak}.`}
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => bukaUbah(d)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50">
                      <Pencil size={14} /> Ubah
                    </button>
                    <button onClick={() => handleHapus(d)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Foto</th>
                <th className="px-4 py-3 text-left font-semibold">Nama - NIS</th>
                <th className="px-4 py-3 text-left font-semibold">JK, Usia - Kelahiran</th>
                <th className="px-4 py-3 text-left font-semibold">Alamat - Kontak</th>
                <th className="px-4 py-3 text-left font-semibold">Ayah - Pekerjaan</th>
                <th className="px-4 py-3 text-left font-semibold">Ibu - Pekerjaan</th>
                <th className="px-4 py-3 text-left font-semibold">Status Ortu - Anak</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                paginatedData.map((d, i) => (
                  <tr
                    key={d.id || i}
                    className="border-t border-gray-100 transition hover:bg-amber-50/40"
                  >
                    <td className="px-4 py-3">
                      {d.foto ? (
                        <img
                          src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${d.foto}`}
                          alt="foto"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{d.nama}</div>
                      <div className="text-xs text-gray-500">{d.nis}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        {d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"},{" "}
                        {d.usia} Th
                      </div>
                      <div className="text-xs text-gray-500">{d.tanggal_lahir}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{d.alamat}</div>
                      <div className="text-xs text-gray-500">{d.kontak || "-"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{d.orang_tua?.nama_ayah || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {d.orang_tua?.pekerjaan_ayah || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{d.orang_tua?.nama_ibu || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {d.orang_tua?.pekerjaan_ibu || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{d.status_orangtua || "-"}</div>
                      <div className="text-xs text-gray-500">{d.status_anak || "-"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => bukaUbah(d)} className="rounded-lg p-2 text-amber-700 hover:bg-amber-50" title="Ubah">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleHapus(d)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </>
      )}

      {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[32px] rounded-lg border px-3 py-1.5 text-xs transition ${
                        currentPage === page
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {formOpen && (
        <FormSantriModal
          santri={santriEdit}
          onClose={() => setFormOpen(false)}
          onSaved={async () => {
            setFormOpen(false);
            await fetchSantri();
          }}
        />
      )}
    </div>
  );
}

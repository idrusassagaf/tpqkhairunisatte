import { tanggalHariIni, periodeSekarang, tahunSekarang } from "../utils/waktu";
import TableLoadingRow from "../components/TableLoadingRow";
import useSedangMemuat from "../hooks/useSedangMemuat";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../api";

const DATA_PER_PAGE = 10;

export default function KehadiranSantri() {
  const sedangMemuat = useSedangMemuat();

  const [bulan, setBulan] = useState(() => {
    return periodeSekarang();
  });

  const [santri, setSantri] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [jadwal, setJadwal] = useState({});
  const [editingSantri, setEditingSantri] = useState(null);
  const [savingTanggal, setSavingTanggal] = useState("");

  // Hanya Admin yang boleh mengedit kehadiran
  const isAdmin = useMemo(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");

      return savedUser?.role === "Admin";
    } catch {
      return false;
    }
  }, []);

  // Jadwal mengaji dari kalender: { "YYYY-MM-DD": "mengaji" | "libur" }
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const response = await api.get("/jadwal");

        setJadwal(response.data || {});
      } catch (error) {
        console.error("Gagal mengambil jadwal kalender:", error);
        setJadwal({});
      }
    };

    fetchJadwal();
  }, []);

  // Hari ini (zona lokal) dalam format YYYY-MM-DD
  const todayStr = useMemo(() => {
    return tanggalHariIni();
  }, []);

  // Daftar tanggal di bulan yang dipilih
  const daftarTanggal = useMemo(() => {
    const [tahun, bulanAngka] = bulan.split("-");
    const jumlahHari = new Date(Number(tahun), Number(bulanAngka), 0).getDate();

    return Array.from({ length: jumlahHari }, (_, i) => {
      const hari = String(i + 1).padStart(2, "0");

      return `${bulan}-${hari}`;
    });
  }, [bulan]);

  // Status per tanggal: record jika ada, "A" jika hari mengaji sudah lewat
  const getStatusPada = (personId, tanggal) => {
    const record = absensi.find(
      (absen) =>
        String(absen.tipe) === "santri" &&
        Number(absen.person_id) === Number(personId) &&
        String(absen.tanggal).slice(0, 10) === tanggal,
    );

    if (record) return record.status;

    return tanggal < todayStr && jadwal[tanggal] === "mengaji" ? "A" : "";
  };

  const handleUbahStatus = async (personId, tanggal, status) => {
    if (!isAdmin || !status) return;

    try {
      setSavingTanggal(tanggal);

      await api.post("/absensi", {
        tipe: "santri",
        person_id: personId,
        tanggal,
        status,
      });

      await fetchAbsensi();
    } catch (error) {
      console.error("Gagal menyimpan absensi santri:", error);

      alert("Gagal menyimpan absensi. Coba lagi.");
    } finally {
      setSavingTanggal("");
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, [bulan]);

  useEffect(() => {
    setPage(1);
  }, [search, bulan]);

  const fetchAbsensi = async () => {
    try {
      setLoading(true);

      const response = await api.get("/absensi", {
        params: {
          tipe: "santri",
          bulan,
        },
      });

      setSantri(response.data?.data || []);
      setAbsensi(response.data?.absensi || []);
    } catch (error) {
      console.error("Gagal mengambil data absensi santri:", error);

      setSantri([]);
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  };

  const rekapSantri = useMemo(() => {
    return santri.map((item) => {
      const data = absensi.filter(
        (absen) =>
          String(absen.tipe) === "santri" &&
          Number(absen.person_id) === Number(item.id),
      );

      // Alpa = A yang diisi manual + hari mengaji yang lewat tanpa absensi
      const alpaOtomatis = daftarTanggal.filter(
        (tanggal) =>
          tanggal < todayStr &&
          jadwal[tanggal] === "mengaji" &&
          !data.some((x) => String(x.tanggal).slice(0, 10) === tanggal),
      ).length;

      return {
        id: item.id,
        nama: item.nama,
        nis: item.nis,
        H: data.filter((x) => x.status === "H").length,
        I: data.filter((x) => x.status === "I").length,
        A: data.filter((x) => x.status === "A").length + alpaOtomatis,
      };
    });
  }, [santri, absensi, daftarTanggal, todayStr, jadwal]);

  const filteredSantri = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return rekapSantri;
    }

    return rekapSantri.filter(
      (item) =>
        String(item.nama || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.nis || "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [rekapSantri, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSantri.length / DATA_PER_PAGE),
  );

  const paginatedSantri = filteredSantri.slice(
    (page - 1) * DATA_PER_PAGE,
    page * DATA_PER_PAGE,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const namaBulan = useMemo(() => {
    const [tahun, bulanAngka] = bulan.split("-");

    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(tahun), Number(bulanAngka) - 1, 1));
  }, [bulan]);

  const handleDownloadExcel = () => {
    const rows = filteredSantri.map((item, index) => ({
      No: index + 1,
      "Nama Santri": item.nama || "",
      NIS: item.nis || "",
      H: item.H || 0,
      I: item.I || 0,
      A: item.A || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 18 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran Santri");

    XLSX.writeFile(workbook, `Kehadiran-Santri-${bulan}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text("REKAPITULASI DAFTAR HADIR SANTRI", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setFontSize(13);

    doc.text("TPQ KHAIRUNNISSA", pageWidth / 2, 26, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Bulan: ${namaBulan}`, pageWidth / 2, 34, {
      align: "center",
    });

    const tableData = filteredSantri.map((item, index) => [
      index + 1,
      item.nama || "",
      item.nis || "",
      item.H || 0,
      item.I || 0,
      item.A || 0,
    ]);

    autoTable(doc, {
      startY: 41,

      head: [["No", "Nama Santri", "NIS", "H", "I", "A"]],

      body: tableData,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
      },

      headStyles: {
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },

      bodyStyles: {
        valign: "middle",
      },

      columnStyles: {
        0: {
          cellWidth: 12,
          halign: "center",
        },

        1: {
          cellWidth: 70,
          halign: "left",
        },

        2: {
          cellWidth: 30,
          halign: "center",
        },

        3: {
          cellWidth: 12,
          halign: "center",
        },

        4: {
          cellWidth: 12,
          halign: "center",
        },

        5: {
          cellWidth: 12,
          halign: "center",
        },

        6: {
          cellWidth: 12,
          halign: "center",
        },
      },

      margin: {
        left: 25,
        right: 25,
      },

      tableWidth: 160,

      didDrawPage: () => {
        const footerY = pageHeight - 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          `Dicetak: ${new Intl.DateTimeFormat("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(new Date())}`,
          pageWidth / 2,
          footerY,
          {
            align: "center",
          },
        );
      },
    });

    const total = filteredSantri.reduce(
      (hasil, item) => ({
        H: hasil.H + Number(item.H || 0),
        I: hasil.I + Number(item.I || 0),
        A: hasil.A + Number(item.A || 0),
      }),
      {
        H: 0,
        I: 0,
        A: 0,
      },
    );

    const finalY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 10
      : 50;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
      `TOTAL   H: ${total.H}    I: ${total.I}    A: ${total.A}`,
      pageWidth / 2,
      finalY,
      {
        align: "center",
      },
    );

    doc.save(`Kehadiran-Santri-${bulan}.pdf`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-sms md:text-2xl font-extralight text-gray-800">
              DAFTAR HADIR SANTRI TPQ KHAIRUNNISSA
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Rekapitulasi kehadiran santri berdasarkan bulan.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                BULAN
              </label>

              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau NIS..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!filteredSantri.length}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={17} />
              PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={!filteredSantri.length}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={17} />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-3 text-left text-sm font-semibold w-[38%] md:w-auto">
                  Nama Santri
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[22%] md:w-auto">
                  NIS
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  H
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  I
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  A
                </th>

                {isAdmin && (
                  <th className="border px-2 py-3 text-center text-sm font-semibold w-[12%]">
                    Edit
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {sedangMemuat ? (
                <TableLoadingRow colSpan={7} />
              ) : (
                <>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 6 : 5}
                        className="border px-4 py-8 text-center text-gray-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : paginatedSantri.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 6 : 5}
                        className="border px-4 py-8 text-center text-gray-500"
                      >
                        Data kehadiran santri belum tersedia.
                      </td>
                    </tr>
                  ) : (
                    paginatedSantri.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border px-3 py-3 text-sm break-words">
                          {item.nama}
                        </td>

                        <td className="border px-2 py-3 text-sm text-center break-all">
                          {item.nis}
                        </td>

                        <td className="border px-2 py-3 text-sm text-center">
                          {item.H}
                        </td>

                        <td className="border px-2 py-3 text-sm text-center">
                          {item.I}
                        </td>

                        <td className="border px-2 py-3 text-sm text-center">
                          {item.A}
                        </td>

                        {isAdmin && (
                          <td className="border px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setEditingSantri(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-600 text-green-700 text-xs font-medium hover:bg-green-50"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {editingSantri && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setEditingSantri(null)}
          >
            <div
              className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 p-4 border-b">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    {editingSantri.nama}
                  </h2>

                  <p className="text-xs text-gray-500">
                    NIS {editingSantri.nis || "-"} · {namaBulan}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSantri(null)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-2">
                {daftarTanggal.map((tanggal) => {
                  const status = getStatusPada(editingSantri.id, tanggal);

                  return (
                    <div
                      key={tanggal}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-gray-700">
                        {new Intl.DateTimeFormat("id-ID", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        }).format(new Date(`${tanggal}T00:00:00`))}
                      </span>

                      <select
                        value={status}
                        disabled={savingTanggal === tanggal}
                        onChange={(e) =>
                          handleUbahStatus(
                            editingSantri.id,
                            tanggal,
                            e.target.value,
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <option value="">Belum diisi</option>
                        <option value="H">H - Hadir</option>
                        <option value="I">I - Izin</option>
                        <option value="A">A - Alpa</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {filteredSantri.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <div className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {(page - 1) * DATA_PER_PAGE + 1}
              </span>
              {" - "}
              <span className="font-medium text-gray-700">
                {Math.min(page * DATA_PER_PAGE, filteredSantri.length)}
              </span>
              {" dari "}
              <span className="font-medium text-gray-700">
                {filteredSantri.length}
              </span>{" "}
              data
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>

              <span className="text-sm px-2">
                Halaman {page} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

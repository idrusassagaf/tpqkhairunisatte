import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../api";
import { Skeleton, SkeletonRows } from "../components/Skeleton";

// Gaya input seragam dengan halaman admin lainnya
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

const DATA_PER_PAGE = 10;

export default function KehadiranSantri() {
  const [bulan, setBulan] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [santri, setSantri] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

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

      return {
        id: item.id,
        nama: item.nama,
        nis: item.nis,
        H: data.filter((x) => x.status === "H").length,
        I: data.filter((x) => x.status === "I").length,
        S: data.filter((x) => x.status === "S").length,
        A: data.filter((x) => x.status === "A").length,
      };
    });
  }, [santri, absensi]);

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
      S: item.S || 0,
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
      item.S || 0,
      item.A || 0,
    ]);

    autoTable(doc, {
      startY: 41,

      head: [["No", "Nama Santri", "NIS", "H", "I", "S", "A"]],

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
        S: hasil.S + Number(item.S || 0),
        A: hasil.A + Number(item.A || 0),
      }),
      {
        H: 0,
        I: 0,
        S: 0,
        A: 0,
      },
    );

    const finalY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 10
      : 50;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
      `TOTAL   H: ${total.H}    I: ${total.I}    S: ${total.S}    A: ${total.A}`,
      pageWidth / 2,
      finalY,
      {
        align: "center",
      },
    );

    doc.save(`Kehadiran-Santri-${bulan}.pdf`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <CalendarCheck size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Daftar Hadir Santri</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Rekapitulasi kehadiran santri berdasarkan bulan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!filteredSantri.length}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
          >
            <FileText size={17} />
            PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={!filteredSantri.length}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
          >
            <FileSpreadsheet size={17} />
            Excel
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* FILTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-medium text-gray-600">
              Bulan
            </label>

            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className={`${inputCls} md:w-44`}
            />
          </div>

          <div className="relative flex-1 md:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[650px] table-fixed border-collapse text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-[38%] px-4 py-3 text-left font-semibold md:w-auto">
                  Nama Santri
                </th>

                <th className="w-[22%] px-2 py-3 text-center font-semibold md:w-auto">
                  NIS
                </th>

                <th className="w-[10%] px-2 py-3 text-center font-semibold">H</th>
                <th className="w-[10%] px-2 py-3 text-center font-semibold">I</th>
                <th className="w-[10%] px-2 py-3 text-center font-semibold">S</th>
                <th className="w-[10%] px-2 py-3 text-center font-semibold">A</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-0">
                    <SkeletonRows rows={6} cols={6} />
                  </td>
                </tr>
              ) : paginatedSantri.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Data kehadiran santri belum tersedia.
                  </td>
                </tr>
              ) : (
                paginatedSantri.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 transition hover:bg-green-50/40"
                  >
                    <td className="px-4 py-3 font-medium break-words text-gray-900">
                      {item.nama}
                    </td>

                    <td className="px-2 py-3 text-center break-all">{item.nis}</td>

                    <td className="px-2 py-3 text-center">
                      <span className="font-semibold text-green-700">{item.H}</span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <span className="font-semibold text-blue-700">{item.I}</span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <span className="font-semibold text-yellow-700">{item.S}</span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <span className="font-semibold text-red-700">{item.A}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSantri.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
            <div className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-gray-700">
                {(page - 1) * DATA_PER_PAGE + 1}
              </span>
              {" – "}
              <span className="font-semibold text-gray-700">
                {Math.min(page * DATA_PER_PAGE, filteredSantri.length)}
              </span>
              {" dari "}
              <span className="font-semibold text-gray-700">{filteredSantri.length}</span>{" "}
              data
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Sebelumnya
              </button>

              <span className="px-2 text-xs text-gray-600">
                Halaman {page} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

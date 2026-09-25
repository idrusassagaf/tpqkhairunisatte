import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../api";

const DATA_PER_PAGE = 10;

export default function KehadiranGuru() {
  const [bulan, setBulan] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [guru, setGuru] = useState([]);
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
          tipe: "guru",
          bulan,
        },
      });

      setGuru(response.data?.data || []);
      setAbsensi(response.data?.absensi || []);
    } catch (error) {
      console.error("Gagal mengambil data absensi guru:", error);

      setGuru([]);
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  };

  const rekapGuru = useMemo(() => {
    return guru.map((item) => {
      const data = absensi.filter(
        (absen) =>
          String(absen.tipe) === "guru" &&
          Number(absen.person_id) === Number(item.id),
      );

      return {
        id: item.id,
        nama_guru: item.nama_guru,
        nig: item.nig,
        H: data.filter((x) => x.status === "H").length,
        I: data.filter((x) => x.status === "I").length,
        S: data.filter((x) => x.status === "S").length,
        A: data.filter((x) => x.status === "A").length,
      };
    });
  }, [guru, absensi]);

  const filteredGuru = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return rekapGuru;
    }

    return rekapGuru.filter(
      (item) =>
        String(item.nama_guru || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.nig || "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [rekapGuru, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGuru.length / DATA_PER_PAGE),
  );

  const paginatedGuru = filteredGuru.slice(
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
    const rows = filteredGuru.map((item, index) => ({
      No: index + 1,
      "Nama Guru": item.nama_guru || "",
      NIG: item.nig || "",
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran Guru");

    XLSX.writeFile(workbook, `Kehadiran-Guru-${bulan}.xlsx`);
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

    doc.text("REKAPITULASI DAFTAR HADIR GURU", pageWidth / 2, 18, {
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

    const tableData = filteredGuru.map((item, index) => [
      index + 1,
      item.nama_guru || "",
      item.nig || "",
      item.H || 0,
      item.I || 0,
      item.S || 0,
      item.A || 0,
    ]);

    autoTable(doc, {
      startY: 41,

      head: [["No", "Nama Guru", "NIG", "H", "I", "S", "A"]],

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

    const total = filteredGuru.reduce(
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

    doc.save(`Kehadiran-Guru-${bulan}.pdf`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              DAFTAR HADIR GURU TPQ KHAIRUNNISSA
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Rekapitulasi kehadiran guru berdasarkan bulan.
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
                placeholder="Cari nama atau NIG..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!filteredGuru.length}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={17} />
              PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={!filteredGuru.length}
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
                  Nama Guru
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[22%] md:w-auto">
                  NIG
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  H
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  I
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  S
                </th>

                <th className="border px-2 py-3 text-center text-sm font-semibold w-[10%]">
                  A
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="border px-4 py-8 text-center text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedGuru.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="border px-4 py-8 text-center text-gray-500"
                  >
                    Data kehadiran guru belum tersedia.
                  </td>
                </tr>
              ) : (
                paginatedGuru.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-3 text-sm break-words">
                      {item.nama_guru}
                    </td>

                    <td className="border px-2 py-3 text-sm text-center break-all">
                      {item.nig}
                    </td>

                    <td className="border px-2 py-3 text-sm text-center">
                      {item.H}
                    </td>

                    <td className="border px-2 py-3 text-sm text-center">
                      {item.I}
                    </td>

                    <td className="border px-2 py-3 text-sm text-center">
                      {item.S}
                    </td>

                    <td className="border px-2 py-3 text-sm text-center">
                      {item.A}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredGuru.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <div className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {(page - 1) * DATA_PER_PAGE + 1}
              </span>
              {" - "}
              <span className="font-medium text-gray-700">
                {Math.min(page * DATA_PER_PAGE, filteredGuru.length)}
              </span>
              {" dari "}
              <span className="font-medium text-gray-700">
                {filteredGuru.length}
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

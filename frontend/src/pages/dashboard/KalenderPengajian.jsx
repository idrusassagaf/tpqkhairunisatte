import { CalendarDays, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { Skeleton } from "../../components/Skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function KalenderPengajian() {
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [jadwal, setJadwal] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  useEffect(() => {
    loadJadwal();
  }, []);

  const loadJadwal = async () => {
    try {
      const res = await api.get("/jadwal");
      setJadwal(res.data);
    } catch (err) {
      console.error("Gagal mengambil jadwal", err);
    } finally {
      setLoading(false);
    }
  };

  const bulanTahun = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const tahun = currentDate.getFullYear();
  const bulan = currentDate.getMonth();

  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
  const firstDay = new Date(tahun, bulan, 1).getDay();

  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date();

  // Format kunci HARUS sama persis dengan yang dikembalikan backend
  // (kolom `tanggal` bertipe DATE di MySQL selalu "YYYY-MM-DD" dengan
  // leading zero). Tanpa padStart, jadwal yang sudah tersimpan tidak
  // akan pernah cocok/tampil di kalender.
  const buatKey = (tahunX, bulanX, tanggalX) =>
    `${tahunX}-${String(bulanX).padStart(2, "0")}-${String(tanggalX).padStart(2, "0")}`;

  const isToday = (tanggal) => {
    const key = buatKey(tahun, bulan + 1, tanggal);
    const todayKey = buatKey(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );

    return key === todayKey;
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const pilihTanggal = (tanggal) => {
    const key = buatKey(tahun, bulan + 1, tanggal);
    setSelectedDate(key);
  };

  // Menghapus status Mengaji / Libur pada tanggal yang dipilih
  const hapusStatus = async () => {
    const key = selectedDate;

    try {
      await api.delete(`/jadwal/${key}`);

      setJadwal((prev) => {
        const next = { ...prev };

        delete next[key];

        return next;
      });

      setSelectedDate(null);
    } catch (err) {
      console.error("Gagal menghapus jadwal", err);
    }
  };

  const setStatus = async (status) => {
    const key = selectedDate;

    try {
      await api.post("/jadwal", {
        tanggal: key,
        status: status,
      });

      setJadwal((prev) => ({
        ...prev,
        [key]: status,
      }));

      setSelectedDate(null);
    } catch (err) {
      console.error("Gagal menyimpan jadwal", err);
    }
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("KALENDER PENGAJIAN TPQ", centerX, 18, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(bulanTahun.toUpperCase(), centerX, 26, { align: "center" });

      // =====================================================
      // SUSUN GRID KALENDER (Senin - Minggu, sama seperti layar)
      // =====================================================

      const totalSel = offset + jumlahHari;
      const totalMinggu = Math.ceil(totalSel / 7);

      const gridTeks = [];
      const gridStatus = [];

      for (let m = 0; m < totalMinggu; m++) {
        const barisTeks = [];
        const barisStatus = [];

        for (let h = 0; h < 7; h++) {
          const selIndex = m * 7 + h;
          const tanggal = selIndex - offset + 1;

          if (tanggal < 1 || tanggal > jumlahHari) {
            barisTeks.push("");
            barisStatus.push(null);
            continue;
          }

          const tglKey = buatKey(tahun, bulan + 1, tanggal);
          const status = jadwal[tglKey];

          const label =
            status === "mengaji" ? "Mengaji" : status === "libur" ? "Libur" : "";

          barisTeks.push(label ? `${tanggal}\n${label}` : `${tanggal}`);
          barisStatus.push(status || null);
        }

        gridTeks.push(barisTeks);
        gridStatus.push(barisStatus);
      }

      autoTable(doc, {
        startY: 34,
        head: [["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]],
        body: gridTeks,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          minCellHeight: 16,
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        didParseCell: (data) => {
          if (data.section !== "body") return;

          const status = gridStatus[data.row.index]?.[data.column.index];

          if (status === "mengaji") {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
          } else if (status === "libur") {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [153, 27, 27];
          }
        },
      });

      // =====================================================
      // KETERANGAN
      // =====================================================

      const keteranganY = doc.lastAutoTable.finalY + 10;

      doc.setFillColor(220, 252, 231);
      doc.rect(20, keteranganY - 4, 5, 5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("Mengaji", 28, keteranganY);

      doc.setFillColor(254, 226, 226);
      doc.rect(60, keteranganY - 4, 5, 5, "F");
      doc.text("Libur", 68, keteranganY);

      const namaFile = `kalender-pengajian-${tahun}-${String(bulan + 1).padStart(2, "0")}.pdf`;

      doc.save(namaFile);
    } catch (error) {
      console.error("Gagal membuat PDF kalender:", error);
      alert("PDF gagal dibuat. Silakan cek Console browser.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <CalendarDays size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">Kalender TPQ</h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Atur hari mengaji dan hari libur setiap bulan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadPDF}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100"
        >
          <Download size={16} />
          Download
        </button>
      </div>

      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        {/* KONTROL BULAN */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Bulan sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>

          <h2 className="text-lg font-semibold capitalize text-gray-900">{bulanTahun}</h2>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Bulan berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* PILIH STATUS */}
        {selectedDate && (
          <div className="flex flex-col gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700">
              Tanggal dipilih: <span className="font-semibold text-gray-900">{selectedDate}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatus("mengaji")}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
              >
                Mengaji
              </button>

              <button
                type="button"
                onClick={() => setStatus("libur")}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
              >
                Libur
              </button>

              {jadwal[selectedDate] && (
                <button
                  type="button"
                  onClick={hapusStatus}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                  Hapus status
                </button>
              )}
            </div>
          </div>
        )}

        {/* KALENDER */}
        <div>
          <div className="mb-2 grid grid-cols-7 gap-2">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((hari) => (
              <div
                key={hari}
                className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {hari}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {loading
            ? Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))
            : Array.from({ length: jumlahHari }).map((_, index) => {
              const tglKey = buatKey(tahun, bulan + 1, index + 1);
              const statusTanggal = jadwal[tglKey];
              const today = isToday(index + 1);
              const dipilih = selectedDate === tglKey;

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => pilihTanggal(index + 1)}
                  className={`flex h-14 flex-col items-center justify-center rounded-xl border transition ${
                    dipilih
                      ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200"
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      today ? "bg-gray-800 text-white" : "text-gray-800"
                    }`}
                  >
                    {index + 1}
                  </span>

                  {statusTanggal === "mengaji" && (
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                      M
                    </span>
                  )}

                  {statusTanggal === "libur" && (
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      L
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* KETERANGAN */}
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              M
            </span>
            <span className="text-sm text-gray-700">Mengaji</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              L
            </span>
            <span className="text-sm text-gray-700">Libur</span>
          </div>
        </div>
      </div>
    </div>
  );
}

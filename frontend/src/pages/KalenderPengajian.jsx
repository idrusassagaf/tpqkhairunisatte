import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function KalenderPengajian() {
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
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-light">KALENDER TPQ</h1>

      {/* KONTROL BULAN */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>

          <h2 className="text-xl font-semibold capitalize">{bulanTahun}</h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* PANEL PILIH STATUS */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">
            Tanggal Dipilih : {selectedDate}
          </h3>

          <div className="flex gap-3">
            <button
              onClick={() => setStatus("mengaji")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Mengaji
            </button>

            <button
              onClick={() => setStatus("libur")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Libur
            </button>
          </div>
        </div>
      )}

      {/* KALENDER */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((hari) => (
            <div
              key={hari}
              className="text-center text-xs font-semibold text-gray-700 py-1"
            >
              {hari}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: jumlahHari }).map((_, index) => {
            const tglKey = buatKey(tahun, bulan + 1, index + 1);
            const statusTanggal = jadwal[tglKey];

            return (
              <div
                key={index}
                onClick={() => pilihTanggal(index + 1)}
                className="
  h-14
  border
  rounded-lg
  p-1
  transition
  cursor-pointer
  flex
  flex-col
  items-center
  justify-center
  hover:bg-gray-50
"
              >
                {/* angka tanggal */}
                <div
                  className={`
    w-7
    h-7
    rounded-full
    flex
    items-center
    justify-center
    text-sm
    font-bold
    transition-all

    ${isToday(index + 1) ? "bg-gray-400 text-white shadow-md" : "text-gray-800"}
  `}
                >
                  {index + 1}
                </div>

                {/* PREVIEW STATUS */}
                {statusTanggal === "mengaji" && (
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                    M
                  </div>
                )}

                {statusTanggal === "libur" && (
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    L
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KETERANGAN */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              M
            </div>
            <span className="text-sm font-medium">Mengaji</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              L
            </div>
            <span className="text-sm font-medium">Libur</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadPDF}
              className="border border-green-500 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50"
            >
              ⬇ Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

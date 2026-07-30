import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";

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

  const isToday = (tanggal) => {
    const key = `${tahun}-${bulan + 1}-${tanggal}`;
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

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
    const key = `${tahun}-${bulan + 1}-${tanggal}`;
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

          {Array.from({ length: jumlahHari }).map((_, index) => (
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

              {/* 🔥 PREVIEW STATUS (INI YANG BENAR LETAKNYA) */}
              {jadwal[`${tahun}-${bulan + 1}-${index + 1}`] === "mengaji" && (
                <div className="mt-1 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                  M
                </div>
              )}

              {jadwal[`${tahun}-${bulan + 1}-${index + 1}`] === "libur" && (
                <div className="mt-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  L
                </div>
              )}
            </div>
          ))}
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
            <button className="border border-green-500 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50">
              ⬇ Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

import { api } from "../api";

import heroImage from "../assets/hero-putih04.jpg";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export default function KalenderPublic() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jadwal, setJadwal] = useState({});

  useEffect(() => {
    loadJadwal();
  }, []);

  const loadJadwal = async () => {
    try {
      const res = await api.get("/jadwal");
      setJadwal(res.data);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* HERO */}

      <section
        className="
relative
overflow-hidden

min-h-[85vh]

pt-8
md:pt-10
"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div
          className="
  relative
  z-10
  max-w-6xl
  mx-auto
  px-4

  pt-2
  md:pt-4
  "
        >
          {/* JUDUL */}

          <div className="text-center mb-5">
            <h1
              className="
            text-2xl
            md:text-4xl
            font-bold
            text-green-800
            "
            >
              Kalender Pengajian
            </h1>
          </div>

          {/* CARD BULAN */}

          <div
            className="
bg-white/35
backdrop-blur-xs
border
border-white/30
rounded-3xl
shadow-lg
p-3
md:p-4
mb-4
"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="
              p-2
              rounded-xl
              bg-green-50
              hover:bg-green-100
              "
              >
                <ChevronLeft />
              </button>

              <div className="flex items-center gap-2">
                <CalendarDays className="text-green-700" size={20} />

                <h2
                  className="
                text-base
                md:text-2xl
                font-bold
                capitalize
                text-blue-800
                "
                >
                  {bulanTahun}
                </h2>
              </div>

              <button
                onClick={nextMonth}
                className="
              p-2
              rounded-xl
              bg-green-50
              hover:bg-green-100
              "
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* KALENDER */}

          <div
            className="
          bg-white/35
          backdrop-blur-xs
          border
          border-white/30
          rounded-3xl
          shadow-lg
          p-3
          md:p-5
          "
          >
            {/* HARI */}

            <div className="grid grid-cols-7 gap-1 mb-3">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((hari) => (
                <div
                  key={hari}
                  className="
                text-center
                text-xs
                md:text-base
                font-bold
                text-green-700
                "
                >
                  {hari}
                </div>
              ))}
            </div>

            {/* TANGGAL */}

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={i}></div>
              ))}

              {Array.from({ length: jumlahHari }).map((_, index) => {
                const tanggal = index + 1;

                const key = `${tahun}-${bulan + 1}-${tanggal}`;

                const status = jadwal[key];

                return (
                  <div
                    key={tanggal}
                    className="
border
border-green-400
rounded-2xl
h-12
md:h-20
bg-white/25
backdrop-blur-xs
flex
flex-col
items-center
justify-center
hover:bg-white/10
transition
"
                  >
                    <div
                      className="
                    text-xs
                    md:text-base
                    font-semibold
                    "
                    >
                      {tanggal}
                    </div>

                    {status === "mengaji" && (
                      <div
                        className="
                      mt-1
                      w-5
                      h-5
                      md:w-7
                      md:h-7
                      rounded-full
                      bg-green-500
                      text-white
                      flex
                      items-center
                      justify-center
                      text-[10px]
                      "
                      >
                        M
                      </div>
                    )}

                    {status === "libur" && (
                      <div
                        className="
                      mt-1
                      w-5
                      h-5
                      md:w-7
                      md:h-7
                      rounded-full
                      bg-red-500
                      text-white
                      flex
                      items-center
                      justify-center
                      text-[10px]
                      "
                      >
                        L
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KETERANGAN */}

        <div
          className="
flex
justify-center
items-center
gap-8
mt-3
pb-3
text-sm
md:text-base
"
        >
          <div className="flex items-center gap-3">
            <div
              className="
      w-7
      h-7

      rounded-full

      bg-green-500

      text-white

      flex
      items-center
      justify-center

      font-bold
      "
            >
              M
            </div>

            <span className="font-medium text-gray-700">Mengaji</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="
      w-7
      h-7

      rounded-full

      bg-red-500

      text-white

      flex
      items-center
      justify-center

      font-bold
      "
            >
              L
            </div>
            <span className="font-medium text-gray-700">Libur</span>
          </div>
        </div>
      </section>
    </div>
  );
}

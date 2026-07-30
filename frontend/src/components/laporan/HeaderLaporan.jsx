export default function HeaderLaporan() {
  return (
    <>
      {/* ================= HEADER ================= */}

      <div className="text-center">
        <img
          src="/logo.png"
          alt="Logo TPQ"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3"
        />

        <h2 className="text-sm sm:text-base md:text-lg font-semibold tracking-wider uppercase">
          Taman Pendidikan Al-Qur'an
        </h2>

        <p className="mt-2 text-gray-600 italic text-sm">
          "Membentuk Generasi Qur'ani yang Berakhlak Mulia"
        </p>

        <div className="mt-4 text-blue-600 text-xs sm:text-sm md:text-base leading-6">
          <p>Jl. Ketilang Gang MT. Habib Abubakar Al Atas.</p>

          <p>
            Kel. Gamalama | Kec. Ternate Tengah | Kota Ternate | Prov. Maluku
            Utara
          </p>

          <p>
            www.tpqkhairunnisa.id | Email: tpqkhairunnisa@gmail.com | Telp:
            08xxxxxxxxxx
          </p>
        </div>
      </div>

      {/* ================= JUDUL ================= */}

      <div className="mt-6 sm:mt-8">
        <hr className="border-2 border-black" />

        <h2 className="py-3 sm:py-4 text-center text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase">
          Laporan Ringkas
        </h2>

        <hr className="border border-black" />
      </div>

      {/* ================= IDENTITAS ================= */}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Nomor Laporan</span>
            {" : "}
            001/LR/TPQ/{new Date().getFullYear()}
          </p>

          <p>
            <span className="font-semibold">Tanggal Cetak</span>
            {" : "}
            {new Date().toLocaleDateString("id-ID")}
          </p>

          <p>
            <span className="font-semibold">Jam Cetak</span>
            {" : "}
            {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-semibold">Status Data</span>
            {" : "}
            Realtime
          </p>

          <p>
            <span className="font-semibold">Sumber Data</span>
            {" : "}
            Database TPQ Khairunnisa
          </p>

          <p>
            <span className="font-semibold">Periode Data</span>
            {" : "}
            Seluruh Data Aktif
          </p>
        </div>
      </div>
    </>
  );
}

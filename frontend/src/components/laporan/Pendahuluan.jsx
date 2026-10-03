import JudulBab from "./JudulBab";
import Paragraf from "./Paragraf";

export default function Pendahuluan() {
  return (
    <section className="mt-10 md:mt-12">
      <JudulBab nomor="I" judul="PENDAHULUAN" />

      <div className="mt-6 space-y-2">
        <Paragraf>
          Laporan Ringkas ini merupakan ringkasan seluruh data yang tersimpan
          pada <b>Sistem Informasi TPQ Hairunnisa</b>. Seluruh informasi yang
          disajikan dihasilkan secara otomatis berdasarkan data yang terdapat
          pada database aplikasi sehingga selalu menggambarkan kondisi terkini.
        </Paragraf>

        <Paragraf>
          Laporan ini disusun sebagai media informasi dan dokumentasi mengenai
          kondisi santri, guru, perkembangan pembelajaran Iqra, Al-Qur'an,
          hafalan, serta berbagai aktivitas yang tercatat pada Sistem Informasi
          TPQ Hairunnisa. Seluruh isi laporan akan selalu berubah secara
          otomatis mengikuti perkembangan data yang tersimpan pada database
          sehingga dapat digunakan sebagai bahan evaluasi, penyusunan program
          kerja, serta pengambilan keputusan oleh pengelola TPQ Hairunnisa.
        </Paragraf>
      </div>
    </section>
  );
}

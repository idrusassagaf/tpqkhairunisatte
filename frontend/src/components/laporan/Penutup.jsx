import JudulBab from "./JudulBab";
import Paragraf from "./Paragraf";

export default function Penutup({ masterData }) {
  const jumlahSantri = masterData?.santri?.length || 0;
  const jumlahGuru = masterData?.guru?.length || 0;
  const jumlahBerita = masterData?.berita?.length || 0;
  const jumlahPengumuman = masterData?.pengumuman?.length || 0;
  const jumlahGaleri = masterData?.galeri?.length || 0;

  return (
    <section className="mt-10">
      <JudulBab nomor="X" judul="PENUTUP" />

      <div className="mt-4 space-y-2">
        <Paragraf>
          Laporan Ringkas ini disusun secara otomatis berdasarkan data yang
          tersimpan pada Sistem Informasi TPQ Khairunnisa. Sampai dengan laporan
          ini diterbitkan, sistem telah mengelola{" "}
          <b>{jumlahSantri} data santri</b>,<b> {jumlahGuru} data guru</b>,{" "}
          <b>{jumlahBerita} berita</b>,<b> {jumlahPengumuman} pengumuman</b>,
          serta
          <b> {jumlahGaleri} dokumentasi galeri</b> sebagai bagian dari
          administrasi dan layanan informasi TPQ.
        </Paragraf>

        <Paragraf>
          Diharapkan laporan ini dapat menjadi bahan evaluasi, pengambilan
          keputusan, serta dokumentasi dalam mendukung peningkatan kualitas
          pengelolaan pendidikan di TPQ Khairunnisa.
        </Paragraf>

        <Paragraf>
          Demikian laporan ringkas ini disusun untuk dipergunakan sebagaimana
          mestinya.
        </Paragraf>
      </div>
    </section>
  );
}

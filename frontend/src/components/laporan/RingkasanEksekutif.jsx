import JudulBab from "./JudulBab";
import Paragraf from "./Paragraf";
import { laporanStatistik } from "../../utils/laporanStatistik";

export default function RingkasanEksekutif({ masterData }) {
  const statistik = laporanStatistik(masterData);
  const berita = masterData?.berita || [];
  const pengumuman = masterData?.pengumuman || [];
  const galeri = masterData?.galeri || [];
  let hafalanLancar = 0;
  let hafalanBelum = 0;

  (masterData?.santri || []).forEach((s) => {
    const data = JSON.parse(localStorage.getItem(`hafalan_${s.nis}`) || "{}");

    Object.values(data).forEach((item) => {
      if (item?.progres === "Lancar") hafalanLancar++;
      if (item?.progres === "Belum") hafalanBelum++;
    });
  });
  return (
    <section className="mt-10">
      <JudulBab nomor="I" judul="RINGKASAN EKSEKUTIF" />

      <div className="mt-5 space-y-3">
        <Paragraf>
          Berdasarkan hasil pengolahan data pada
          <b> Sistem Informasi TPQ Khairunnisa</b>, saat laporan ini dibuat
          terdapat
          <b> {statistik.jumlahSantri} santri</b> yang dibimbing oleh
          <b> {statistik.jumlahGuru} guru</b>. Program pembelajaran terdiri atas
          <b> {statistik.santriIqra} santri jenjang Iqra</b> dan
          <b> {statistik.santriQuran} santri jenjang Al-Qur'an</b>. Sistem juga
          telah mencatat
          <b> 3 materi hafalan</b>,<b> {berita.length} berita</b>,
          <b> {pengumuman.length} pengumuman</b>, serta
          <b> {galeri.length} dokumentasi galeri</b>. Berdasarkan evaluasi
          pembelajaran, terdapat
          <b> {statistik.iqraLancar} santri Iqra telah Lancar</b>,
          <b> {statistik.iqraBelum} santri masih Belum Lancar</b>, sedangkan
          pada program hafalan terdapat
          <b> {hafalanLancar} hafalan berstatus Lancar</b> dan
          <b> {hafalanBelum} hafalan berstatus Belum Lancar</b>.
        </Paragraf>
      </div>
    </section>
  );
}

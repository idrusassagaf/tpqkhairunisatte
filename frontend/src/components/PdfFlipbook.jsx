import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ===========================================================
// PENGATURAN PERPINDAHAN HALAMAN
// ===========================================================
const EFEK = "balik"; // "balik" = halaman berputar di tengah buku, "geser" = keluar-masuk
const DURASI_MS = 600; // lama animasi satu perpindahan
const JARAK_GESER_PX = 40; // jarak geser halaman pada efek "geser"
const SUDUT_MAKS = 170; // sudut putar maksimal pada efek "balik" (derajat)
const PERSPEKTIF_PX = 4000; // makin besar, makin datar putarannya (tidak membesar di tepi)

const ZOOM_MIN = 1;
const ZOOM_MAKS = 2.5;
const ZOOM_LANGKAH = 0.25;
const VOLUME_SUARA = 0.9; // 0 - 1

const RASIO_HALAMAN = 1.414; // A4
const BREAKPOINT_DUA_HALAMAN = 768;

// Susun halaman menjadi spread: sampul sendiri di kanan, lalu pasangan kiri-kanan
const susunSpread = (pages, dua) => {
  if (!dua) {
    return pages.map((src, i) => ({ kiri: null, kanan: { src, nomor: i + 1 } }));
  }

  const hasil = [{ kiri: null, kanan: pages[0] ? { src: pages[0], nomor: 1 } : null }];

  for (let i = 1; i < pages.length; i += 2) {
    hasil.push({
      kiri: { src: pages[i], nomor: i + 1 },
      kanan: pages[i + 1] ? { src: pages[i + 1], nomor: i + 2 } : null,
    });
  }

  return hasil;
};

// Suara membalik halaman (file audio dari folder public)
const SUARA_URL = "/book-opening.mp3";

const mainkanSuara = (ctx, buffer) => {
  const sumber = ctx.createBufferSource();
  sumber.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = VOLUME_SUARA;

  sumber.connect(gain);
  gain.connect(ctx.destination);
  sumber.start();
};

// Buku PDF dengan sampul dan kertas krem
export default function PdfFlipbook({ data }) {
  const wrapRef = useRef(null);
  const touchRef = useRef(null);
  const sibukRef = useRef(false);

  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [lebar, setLebar] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [bisuh, setBisuh] = useState(false);
  const audioRef = useRef(null);
  const suaraRef = useRef(null);

  // Animasi "balik": halaman yang berputar
  const [balik, setBalik] = useState(null); // { dir, from, to, buka }
  // Animasi "geser": spread lama yang keluar
  const [keluar, setKeluar] = useState(null); // { idx, dir }

  // Ukur lebar kontainer
  useEffect(() => {
    const el = wrapRef.current;

    if (!el) return;

    const ukur = () => setLebar(el.clientWidth);

    ukur();

    const observer = new ResizeObserver(ukur);

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Render setiap halaman PDF menjadi gambar
  useEffect(() => {
    let batal = false;
    let doc = null;

    const render = async () => {
      try {
        doc = await pdfjs.getDocument({ data: data.slice(0) }).promise;

        const hasil = [];

        for (let n = 1; n <= doc.numPages; n++) {
          if (batal) return;

          const page = await doc.getPage(n);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = 1600 / baseViewport.width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;

          hasil.push(canvas.toDataURL("image/jpeg", 0.92));

          setProgress(n / doc.numPages);
        }

        if (!batal) setPages(hasil);
      } catch (err) {
        console.error("Gagal merender PDF:", err);

        if (!batal) setError("PDF tidak dapat ditampilkan.");
      }
    };

    setPages([]);
    setProgress(0);
    setError("");
    setIndex(0);
    render();

    return () => {
      batal = true;
      doc?.destroy?.();
    };
  }, [data]);

  const dua = lebar >= BREAKPOINT_DUA_HALAMAN;
  const spreads = susunSpread(pages, dua);
  const jumlah = spreads.length;
  const siap = jumlah > 0;
  const spread = spreads[index];

  // Efek balik hanya untuk layar lebar; layar kecil memakai geser
  const efekAktif = EFEK;

  // Pindah halaman
  const pindah = (ke) => {
    if (ke < 0 || ke >= jumlah || ke === index || sibukRef.current) return;

    const dir = ke > index ? "next" : "prev";

    sibukRef.current = true;

    if (!bisuh) {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;

        audioRef.current = Ctx ? new Ctx() : null;
      }

      const ctx = audioRef.current;

      if (ctx) {
        ctx.resume?.();

        const putar = async () => {
          try {
            if (!suaraRef.current) {
              const res = await fetch(SUARA_URL);

              suaraRef.current = await ctx.decodeAudioData(await res.arrayBuffer());
            }

            mainkanSuara(ctx, suaraRef.current);
          } catch (err) {
            console.error("Gagal memutar suara halaman:", err);
          }
        };

        putar();
      }
    }

    if (efekAktif === "balik") {
      setBalik({ dir, from: index, to: ke, buka: false, id: Date.now() });
    } else {
      setKeluar({ idx: index, dir });
    }

    setIndex(ke);
  };

  // Mulai animasi balik: setelah render awal, buka halaman ke sudut tujuan.
  // Efek ini hanya bergantung pada id animasi, bukan pada seluruh objek balik,
  // supaya timer pembersih tidak ikut terhapus saat sudut berubah.
  const idBalik = balik?.id;

  useEffect(() => {
    if (!idBalik) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBalik((b) => (b && b.id === idBalik ? { ...b, buka: true } : b));
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [idBalik]);

  // Selesai animasi balik: bersihkan lembar dan buka kunci perpindahan
  useEffect(() => {
    if (!idBalik) return;

    const selesai = setTimeout(() => {
      setBalik(null);
      sibukRef.current = false;
    }, DURASI_MS);

    return () => clearTimeout(selesai);
  }, [idBalik]);

  // Mulai animasi geser: bersihkan spread lama setelah selesai
  useEffect(() => {
    if (!keluar) return;

    const selesai = setTimeout(() => {
      setKeluar(null);
      sibukRef.current = false;
    }, DURASI_MS);

    return () => clearTimeout(selesai);
  }, [keluar]);

  const ubahZoom = (z) => {
    setZoom(Math.min(ZOOM_MAKS, Math.max(ZOOM_MIN, Math.round(z * 100) / 100)));
  };

  // Navigasi keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") pindah(index - 1);
      if (e.key === "ArrowRight") pindah(index + 1);
      if (e.key === "+" || e.key === "=") ubahZoom(zoom + ZOOM_LANGKAH);
      if (e.key === "-") ubahZoom(zoom - ZOOM_LANGKAH);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  });

  // Geser dengan sentuh
  const onTouchStart = (e) => {
    touchRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchRef.current === null) return;

    const selisih = e.changedTouches[0].clientX - touchRef.current;

    touchRef.current = null;

    if (Math.abs(selisih) < 40) return;

    pindah(selisih < 0 ? index + 1 : index - 1);
  };

  // Ukuran satu halaman mengikuti lebar kontainer dan rasio A4
  const halamanDasar = dua
    ? Math.max(180, Math.floor((lebar - 48) / 2))
    : Math.max(180, Math.floor(lebar - 48));
  const halamanLebar = Math.floor(halamanDasar * zoom);
  const halamanTinggi = Math.floor(halamanLebar * RASIO_HALAMAN);

  // Isi kiri dan kanan yang tampil saat ini (saat animasi balik, tampil dari dua spread)
  let tampilKiri = spread?.kiri ?? null;
  let tampilKanan = spread?.kanan ?? null;
  let lembar = null;

  if (balik) {
    const dari = spreads[balik.from];
    const ke = spreads[balik.to];

    if (!dua) {
      // Satu halaman: lembar berputar dari tepi kiri, depannya halaman lama, belakangnya halaman baru
      tampilKiri = null;
      tampilKanan = ke.kanan;
      lembar = {
        sisi: "tunggal",
        depan: dari.kanan,
        belakang: ke.kanan,
      };
    } else if (balik.dir === "next") {
      tampilKiri = dari.kiri;
      tampilKanan = ke.kanan;
      lembar = {
        sisi: "kanan",
        depan: dari.kanan,
        belakang: ke.kiri,
      };
    } else {
      tampilKiri = ke.kiri;
      tampilKanan = dari.kanan;
      lembar = {
        sisi: "kiri",
        depan: dari.kiri,
        belakang: ke.kanan,
      };
    }
  }

  const renderHalaman = (hal, sisi) => (
    <div
      className="relative bg-[#fdfaf3]"
      style={{ width: halamanLebar, height: halamanTinggi }}
    >
      {hal && (
        <>
          <img
            src={hal.src}
            alt={`Halaman ${hal.nomor}`}
            draggable={false}
            className="block h-full w-full select-none object-contain"
          />

          {/* BAYANGAN LIPATAN DI TENGAH BUKU */}
          {dua && (
            <div
              className={`pointer-events-none absolute inset-y-0 w-12 ${
                sisi === "kiri"
                  ? "right-0 bg-gradient-to-l from-black/20 to-transparent"
                  : "left-0 bg-gradient-to-r from-black/20 to-transparent"
              }`}
            />
          )}

          <span
            className={`pointer-events-none absolute bottom-2 text-[10px] text-stone-500 ${
              sisi === "kiri" ? "left-3" : "right-3"
            }`}
          >
            {hal.nomor}
          </span>
        </>
      )}
    </div>
  );

  // Satu lembar yang berputar: muka depan dan muka belakang
  const renderLembar = () => {
    const sudut = balik.buka
      ? balik.dir === "next"
        ? -SUDUT_MAKS
        : SUDUT_MAKS
      : 0;

    const kiri = lembar.sisi === "kiri";
    const tunggal = lembar.sisi === "tunggal";

    return (
      <div
        className="pointer-events-none absolute top-0"
        style={{
          width: halamanLebar,
          height: halamanTinggi,
          left: kiri || tunggal ? 0 : halamanLebar,
          transformOrigin: kiri ? "right center" : "left center",
          transform: `rotateY(${sudut}deg)`,
          transformStyle: "preserve-3d",
          transition: `transform ${DURASI_MS}ms ease-in-out`,
        }}
      >
        <div
          className="absolute inset-0 bg-[#fdfaf3]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {lembar.depan && (
            <img
              src={lembar.depan.src}
              alt=""
              draggable={false}
              className="block h-full w-full object-contain"
            />
          )}
        </div>

        <div
          className="absolute inset-0 bg-[#fdfaf3]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {lembar.belakang && (
            <img
              src={lembar.belakang.src}
              alt=""
              draggable={false}
              className="block h-full w-full object-contain"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={wrapRef}
      className="flex w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-green-950 via-green-900 to-green-950 shadow-xl"
    >
      <div className="flex min-h-[320px] overflow-auto px-2 py-8 md:px-4">
        {error && <p className="text-sm text-red-200">{error}</p>}

        {!error && !siap && (
          <div className="w-full max-w-xs text-center text-white">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-green-400 transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-gray-300">
              {Math.round(progress * 100)}%
            </p>
          </div>
        )}

        {siap && lebar > 0 && (
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="m-auto shrink-0 rounded-2xl bg-gradient-to-b from-green-800 to-green-900 p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/30 md:p-4"
          >
            <div
              className="relative"
              style={{
                width: dua ? halamanLebar * 2 : halamanLebar,
                height: halamanTinggi,
                perspective: `${PERSPEKTIF_PX}px`,
              }}
            >
              {/* SPREAD YANG TAMPIL (untuk efek geser, ini yang masuk) */}
              {efekAktif === "geser" ? (
                <div
                  key={`masuk-${index}`}
                  className={`absolute inset-0 flex overflow-hidden rounded-md shadow-inner ${
                    keluar?.dir === "prev" ? "book-enter-prev" : "book-enter-next"
                  }`}
                  style={{
                    "--jarak": `${JARAK_GESER_PX}px`,
                    animationDuration: `${DURASI_MS}ms`,
                  }}
                >
                  {dua ? (
                    <>
                      {renderHalaman(tampilKiri, "kiri")}
                      {renderHalaman(tampilKanan, "kanan")}
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />
                    </>
                  ) : (
                    renderHalaman(tampilKanan, "kanan")
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex overflow-hidden rounded-md shadow-inner">
                  {dua ? (
                    <>
                      {renderHalaman(tampilKiri, "kiri")}
                      {renderHalaman(tampilKanan, "kanan")}
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />
                    </>
                  ) : (
                    renderHalaman(tampilKanan, "kanan")
                  )}
                </div>
              )}

              {/* SPREAD LAMA YANG KELUAR (efek geser) */}
              {efekAktif === "geser" && keluar && spreads[keluar.idx] && (
                <div
                  key={`keluar-${keluar.idx}`}
                  className={`absolute inset-0 flex overflow-hidden rounded-md shadow-inner ${
                    keluar.dir === "next" ? "book-exit-next" : "book-exit-prev"
                  }`}
                  style={{
                    "--jarak": `${JARAK_GESER_PX}px`,
                    animationDuration: `${DURASI_MS}ms`,
                  }}
                >
                  {dua ? (
                    <>
                      {renderHalaman(spreads[keluar.idx].kiri, "kiri")}
                      {renderHalaman(spreads[keluar.idx].kanan, "kanan")}
                      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />
                    </>
                  ) : (
                    renderHalaman(spreads[keluar.idx].kanan, "kanan")
                  )}
                </div>
              )}

              {/* LEMBAR YANG SEDANG DIBALIK (efek balik) */}
              {efekAktif === "balik" && balik && lembar && renderLembar()}
            </div>
          </div>
        )}
      </div>

      {/* KONTROL */}
      {siap && (
        <div className="flex flex-wrap items-center justify-center gap-3 pb-5 pt-1 text-white">
          <button
            type="button"
            onClick={() => setBisuh((v) => !v)}
            aria-label={bisuh ? "Nyalakan suara" : "Bisukan suara"}
            title={bisuh ? "Nyalakan suara" : "Bisukan suara"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            {bisuh ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            onClick={() => ubahZoom(zoom - ZOOM_LANGKAH)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Perkecil"
            title="Perkecil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomOut size={18} />
          </button>

          <button
            type="button"
            onClick={() => ubahZoom(1)}
            title="Ukuran normal"
            className="min-w-[3.5rem] rounded-full bg-white/10 px-3 py-2 text-xs transition hover:bg-white/20"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => ubahZoom(zoom + ZOOM_LANGKAH)}
            disabled={zoom >= ZOOM_MAKS}
            aria-label="Perbesar"
            title="Perbesar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomIn size={18} />
          </button>

          <span className="mx-2 hidden h-6 w-px bg-white/20 sm:block" />

          <button
            type="button"
            onClick={() => pindah(index - 1)}
            disabled={index === 0}
            aria-label="Halaman sebelumnya"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft size={22} />
          </button>

          <span className="min-w-[6rem] text-center text-sm">
            {index + 1} / {jumlah}
          </span>

          <button
            type="button"
            onClick={() => pindah(index + 1)}
            disabled={index >= jumlah - 1}
            aria-label="Halaman berikutnya"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

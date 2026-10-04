import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, ScanLine, UserRound, Users } from "lucide-react";
import { api } from "../api";

export default function ScanAbsensi() {
  const scannerRef = useRef(null);
  const scanningRef = useRef(false);

  const [tipe, setTipe] = useState("santri");
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setCameraActive(false);
      return;
    }

    try {
      if (scanningRef.current) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.warn("Scanner berhenti:", err);
    }

    try {
      await scannerRef.current.clear();
    } catch (err) {
      console.warn("Scanner clear:", err);
    }

    scanningRef.current = false;
    scannerRef.current = null;
    setCameraActive(false);
  };

  const startScanner = async () => {
    setError("");
    setHasil(null);

    await stopScanner();

    try {
      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          if (loading || !scanningRef.current) {
            return;
          }

          scanningRef.current = false;
          setLoading(true);
          setError("");

          try {
            const kode = decodedText.trim();

            if (!kode) {
              throw new Error("Kode QR kosong.");
            }

            const response = await api.post("/absensi/scan", {
              tipe,
              kode,
            });

            setHasil(response?.data?.data || null);

            await stopScanner();
          } catch (err) {
            console.error("Gagal menyimpan absensi:", err);

            const message =
              err?.response?.data?.message ||
              "QR terbaca, tetapi absensi gagal disimpan.";

            setError(message);

            scanningRef.current = true;
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Error scanning frame diabaikan.
          // Callback ini dipanggil terus selama kamera mencari QR.
        },
      );

      scanningRef.current = true;
      setCameraActive(true);
    } catch (err) {
      console.error("Gagal membuka kamera:", err);

      setError(
        "Kamera tidak dapat dibuka. Pastikan izin kamera diberikan kepada browser.",
      );

      scanningRef.current = false;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleTipeChange = async (value) => {
    setTipe(value);
    setHasil(null);
    setError("");

    if (cameraActive) {
      await stopScanner();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <ScanLine size={22} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Scan QR Absensi</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Scan QR santri atau guru menggunakan kamera laptop/PC.
          </p>
        </div>
      </div>

      {/* PILIH TIPE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-purple-600" />
          <h2 className="text-sm font-semibold text-gray-800">Jenis Absensi</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5">
          <button
            type="button"
            onClick={() => handleTipeChange("santri")}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tipe === "santri"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <UserRound size={17} />
            Santri
          </button>

          <button
            type="button"
            onClick={() => handleTipeChange("guru")}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tipe === "guru"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Users size={17} />
            Guru
          </button>
        </div>
      </div>

      {/* KAMERA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Camera size={18} className="text-purple-600" />
          <h2 className="text-sm font-semibold text-gray-800">Kamera</h2>
        </div>

        <div
          id="qr-reader"
          className="mx-auto w-full max-w-md overflow-hidden rounded-xl"
        />

        {!cameraActive && !hasil && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <ScanLine size={32} className="text-gray-400" />
            </div>

            <p className="mb-4 text-sm text-gray-500">
              Pilih jenis absensi kemudian tekan tombol mulai kamera.
            </p>

            <button
              type="button"
              onClick={startScanner}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={18} />
              Mulai Kamera
            </button>
          </div>
        )}

        {cameraActive && (
          <div className="mt-4 text-center">
            <p className="mb-3 text-sm text-gray-500">
              Arahkan QR Code ke kotak kamera.
            </p>

            <button
              type="button"
              onClick={stopScanner}
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Hentikan Kamera
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* HASIL */}
        {hasil && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                <CheckCircle2 size={26} className="text-green-600" />
              </div>

              <div>
                <h3 className="font-semibold text-green-800">Absensi Berhasil</h3>

                <p className="text-sm text-green-700">
                  Kehadiran berhasil dicatat.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white p-4 text-sm md:grid-cols-2">
              <div>
                <span className="text-xs text-gray-500">Nama</span>
                <div className="font-semibold text-gray-900">{hasil.nama}</div>
              </div>

              <div>
                <span className="text-xs text-gray-500">
                  {hasil.tipe === "guru" ? "NIG" : "NIS"}
                </span>
                <div className="font-semibold text-gray-900">{hasil.kode}</div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Tanggal</span>
                <div className="font-semibold text-gray-900">{hasil.tanggal}</div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Jam</span>
                <div className="font-semibold text-gray-900">{hasil.jam}</div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Status</span>
                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    HADIR
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startScanner}
              className="mt-5 w-full rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700 md:w-auto"
            >
              Scan Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

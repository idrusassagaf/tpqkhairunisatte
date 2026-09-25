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
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Scan QR Absensi
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Scan QR santri atau guru menggunakan kamera laptop/PC.
          </p>
        </div>

        {/* PILIH TIPE */}
        <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-purple-600" />
            <h2 className="font-semibold text-gray-800">Jenis Absensi</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTipeChange("santri")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                tipe === "santri"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <UserRound size={18} />
              Santri
            </button>

            <button
              type="button"
              onClick={() => handleTipeChange("guru")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                tipe === "guru"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Users size={18} />
              Guru
            </button>
          </div>
        </div>

        {/* CAMERA */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera size={21} className="text-purple-600" />
            <h2 className="font-semibold text-gray-800">Kamera</h2>
          </div>

          <div
            id="qr-reader"
            className="w-full max-w-md mx-auto overflow-hidden rounded-xl"
          />

          {!cameraActive && !hasil && (
            <div className="text-center py-8">
              <ScanLine size={48} className="mx-auto text-gray-300 mb-3" />

              <p className="text-sm text-gray-500 mb-4">
                Pilih jenis absensi kemudian tekan tombol mulai kamera.
              </p>

              <button
                type="button"
                onClick={startScanner}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
              >
                <Camera size={18} />
                Mulai Kamera
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 mb-3">
                Arahkan QR Code ke kotak kamera.
              </p>

              <button
                type="button"
                onClick={stopScanner}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Hentikan Kamera
              </button>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* HASIL */}
          {hasil && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={28} className="text-green-600" />

                <div>
                  <h3 className="font-bold text-green-800">Absensi Berhasil</h3>

                  <p className="text-sm text-green-700">
                    Kehadiran berhasil dicatat.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Nama</span>
                  <div className="font-semibold text-gray-800">
                    {hasil.nama}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">
                    {hasil.tipe === "guru" ? "NIG" : "NIS"}
                  </span>
                  <div className="font-semibold text-gray-800">
                    {hasil.kode}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Tanggal</span>
                  <div className="font-semibold text-gray-800">
                    {hasil.tanggal}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Jam</span>
                  <div className="font-semibold text-gray-800">{hasil.jam}</div>
                </div>

                <div>
                  <span className="text-gray-500">Status</span>
                  <div className="font-bold text-green-700">HADIR</div>
                </div>
              </div>

              <button
                type="button"
                onClick={startScanner}
                className="mt-5 w-full md:w-auto px-5 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Scan Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

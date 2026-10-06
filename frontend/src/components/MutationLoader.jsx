import { useEffect, useState } from "react";
import { subscribeLoading } from "../loadingStore";

// =========================================================
// OVERLAY LOADING SAAT SIMPAN / UBAH / HAPUS
// =========================================================
// Menutup layar sementara supaya tombol tidak bisa
// ditekan dua kali ketika request masih berjalan.
// =========================================================

export default function MutationLoader() {
  const [aktif, setAktif] = useState(false);

  useEffect(() => subscribeLoading(setAktif), []);

  if (!aktif) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 cursor-wait"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg px-5 py-4">
        <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-green-600 animate-spin" />

        <span className="text-sm text-gray-700">Memproses...</span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { subscribeMemuat } from "../loadingStore";

// =========================================================
// BAR LOADING DI ATAS LAYAR
// =========================================================
// Muncul otomatis setiap halaman mengambil data (GET).
// =========================================================

export default function TopLoadingBar() {
  const [aktif, setAktif] = useState(false);

  useEffect(() => subscribeMemuat(setAktif), []);

  if (!aktif) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[120] h-1 overflow-hidden bg-green-100"
      role="progressbar"
      aria-label="Memuat data"
    >
      <div className="h-full w-1/3 bg-green-600 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
    </div>
  );
}

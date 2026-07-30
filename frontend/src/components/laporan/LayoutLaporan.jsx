import { forwardRef } from "react";

const LayoutLaporan = forwardRef(({ children }, ref) => {
  return (
    <div className="min-h-screen bg-slate-200 py-3 sm:py-6 md:py-10">
      {/* AREA KERTAS A4 */}
      <div
        ref={ref}
        className="
          mx-auto
          bg-white
          shadow-xl
          rounded-lg

          w-full
          max-w-[210mm]

          min-h-screen
          md:min-h-[297mm]

          px-4
          sm:px-6
          md:px-10
          lg:px-[25mm]

          py-6
          sm:py-8
          md:py-10
          lg:py-[20mm]

          flex
          flex-col

          transition-all
        "
      >
        {/* ================= ISI LAPORAN ================= */}
        <div className="flex-1">{children}</div>

        {/* ================= FOOTER ================= */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500 flex justify-between items-center">
          <span>
            © {new Date().getFullYear()} TPQ Khairunnisa - Sistem Informasi TPQ
          </span>

          <span>Halaman 1</span>
        </div>
      </div>
    </div>
  );
});

export default LayoutLaporan;

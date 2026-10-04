// Placeholder loading yang dipakai saat data dari API belum tersedia.
// Ukuran dan bentuk diatur lewat className, misalnya "h-5 w-12" atau "h-40 w-full".
export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  );
}

// Baris tabel/daftar dengan beberapa kolom placeholder
export function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-4 ${j === 0 ? "w-8" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Kartu berita/pengumuman/galeri: gambar + judul + beberapa baris teks
export function SkeletonCard({ withImage = true, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      {withImage && <Skeleton className="mb-4 h-44 w-full rounded-xl" />}

      <Skeleton className="h-5 w-2/3" />

      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />

        <Skeleton className="h-3 w-11/12" />

        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

// Baris loading untuk <tbody> saat data tabel sedang diambil.
export default function TableLoadingRow({ colSpan, text = "Memuat data..." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-gray-500">
        <div className="flex flex-col items-center justify-center gap-3">
          <span className="h-7 w-7 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />

          <span className="text-sm">{text}</span>
        </div>
      </td>
    </tr>
  );
}

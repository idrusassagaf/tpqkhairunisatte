import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { dismissToast, subscribeToast } from "../toastStore";

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeToast(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3"
        >
          <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />

          <p className="flex-1 text-sm text-gray-800">{toast.message}</p>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

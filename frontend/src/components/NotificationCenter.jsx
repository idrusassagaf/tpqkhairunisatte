import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const palette = {
  success: {
    icon: CheckCircle2,
    card: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    card: "border-red-200 bg-red-50/95 text-red-900",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    card: "border-amber-200 bg-amber-50/95 text-amber-900",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  info: {
    icon: Info,
    card: "border-sky-200 bg-sky-50/95 text-sky-900",
    badge: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
};

export default function NotificationCenter() {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState({
    open: false,
    message: "Memproses...",
  });

  useEffect(() => {
    const notify = {
      toast: ({
        type = "success",
        title = "Notifikasi",
        message = "",
        duration = 3200,
      }) => {
        const id = createId();

        setToasts((prev) => [
          ...prev,
          {
            id,
            type,
            title,
            message,
            duration,
          },
        ]);

        window.setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      },
      confirm: async ({
        title = "Konfirmasi",
        message = "Apakah Anda yakin?",
        confirmText = "Ya, lanjutkan",
        cancelText = "Batal",
        variant = "danger",
      }) => {
        return new Promise((resolve) => {
          setModal({
            id: createId(),
            title,
            message,
            confirmText,
            cancelText,
            variant,
            resolve,
          });
        });
      },
      loading: {
        show: (message = "Memproses...") => {
          setLoading({ open: true, message });
        },
        hide: () => {
          setLoading({ open: false, message: "Memproses..." });
        },
      },
    };

    const originalAlert = window.alert;

    window.__tpqNotify = notify;
    window.__tpqLoading = notify.loading;
    window.alert = (msg) => {
      const text =
        typeof msg === "string"
          ? msg
          : msg && typeof msg.message === "string"
            ? msg.message
            : "Informasi terbaru";

      notify.toast({
        type: "info",
        title: "Pemberitahuan",
        message: text,
        duration: 3200,
      });
    };

    return () => {
      window.__tpqNotify = undefined;
      window.__tpqLoading = undefined;
      window.alert = originalAlert;
      delete window.__tpqNotify;
      delete window.__tpqLoading;
    };
  }, []);

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = (isConfirmed) => {
    if (modal?.resolve) {
      modal.resolve(isConfirmed);
    }
    setModal(null);
  };

  const modalTone = useMemo(() => {
    if (modal?.variant === "danger") {
      return {
        ring: "border-red-200 bg-red-50",
        icon: Trash2,
        iconWrap: "bg-red-100 text-red-600",
        confirm: "bg-red-600 hover:bg-red-700",
      };
    }

    return {
      ring: "border-sky-200 bg-sky-50",
      icon: ShieldAlert,
      iconWrap: "bg-sky-100 text-sky-600",
      confirm: "bg-sky-600 hover:bg-sky-700",
    };
  }, [modal]);

  const ModalIcon = modalTone.icon;

  return (
    <>
      {loading.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/90 px-5 py-3 shadow-2xl shadow-slate-900/15">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span className="text-sm font-medium text-slate-700">
              {loading.message}
            </span>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const config = palette[toast.type] || palette.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`${config.card} pointer-events-auto overflow-hidden rounded-2xl border shadow-2xl shadow-slate-900/10 backdrop-blur-md`}
            >
              <div className="flex items-start gap-3 p-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${config.badge}`}
                >
                  <Icon size={16} className="shrink-0" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
                    />
                    <p className="text-sm font-semibold">{toast.title}</p>
                  </div>

                  {toast.message && (
                    <p className="mt-1 text-sm leading-5 opacity-80">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => closeToast(toast.id)}
                  className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700"
                  aria-label="Tutup notifikasi"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-slate-900/55 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md overflow-hidden rounded-3xl border bg-white shadow-2xl shadow-slate-900/20 ${modalTone.ring}`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${modalTone.iconWrap}`}
                >
                  <ModalIcon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {modal.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {modal.message}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {modal.cancelText}
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${modalTone.confirm}`}
                >
                  {modal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.__tpqNotify = window.__tpqNotify || {
  toast: () => {},
  confirm: async () => true,
  loading: {
    show: () => {},
    hide: () => {},
  },
};

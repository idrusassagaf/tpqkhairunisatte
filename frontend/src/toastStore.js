// =========================================================
// NOTIFIKASI SUKSES (TOAST)
// =========================================================
// Dipakai menggantikan alert() untuk pesan berhasil.
// Ditampilkan oleh ToastHost.jsx dan hilang otomatis.
// =========================================================

let toasts = [];
let nextId = 1;
const listeners = new Set();
const DURASI_MS = 3000;

const notify = () => {
  listeners.forEach((listener) => listener(toasts));
};

export const notifySuccess = (message) => {
  const id = nextId++;

  toasts = [...toasts, { id, message }];
  notify();

  setTimeout(() => dismissToast(id), DURASI_MS);
};

export const dismissToast = (id) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
};

export const subscribeToast = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

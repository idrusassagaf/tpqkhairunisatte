// =========================================================
// LOADING GLOBAL UNTUK CREATE / UPDATE / DELETE
// =========================================================
// Menyimpan jumlah request tulis yang sedang berjalan.
// Dibaca oleh MutationLoader.jsx lewat subscribe().
// =========================================================

let pending = 0;
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener(pending > 0));
};

export const mulaiLoading = () => {
  pending += 1;
  notify();
};

export const selesaiLoading = () => {
  pending = Math.max(0, pending - 1);
  notify();
};

export const subscribeLoading = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

// =========================================================
// LOADING BACA DATA (GET)
// =========================================================
// Dipakai TopLoadingBar.jsx: bar tipis di bagian atas layar
// selama halaman mengambil data.
// =========================================================

let memuat = 0;
const listenersMemuat = new Set();

const notifyMemuat = () => {
  listenersMemuat.forEach((listener) => listener(memuat > 0));
};

export const mulaiMemuat = () => {
  memuat += 1;
  notifyMemuat();
};

export const selesaiMemuat = () => {
  memuat = Math.max(0, memuat - 1);
  notifyMemuat();
};

export const subscribeMemuat = (listener) => {
  listenersMemuat.add(listener);

  return () => listenersMemuat.delete(listener);
};

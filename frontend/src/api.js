import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

// =========================================================
// OTOMATIS KIRIM TOKEN LOGIN
// =========================================================
// Token disimpan oleh LoginAdmin.jsx di localStorage
// dengan key: "token"
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =========================================================
// TOKEN TIDAK VALID (401)
// =========================================================
// Kalau server menolak token (misalnya sudah kedaluwarsa atau
// dihapus), data login dibersihkan lalu user dikirim ke halaman login.
// Permintaan /login sendiri dikecualikan supaya pesan error tetap tampil.
// =========================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !url.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);
